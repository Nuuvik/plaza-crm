import { useCallback, useEffect, useState } from 'react'
import { Button, Input, message, Modal, Space, Table, Tabs, Tag } from 'antd'
import { ClearOutlined, PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import type { ColumnsType } from 'antd/es/table'
import type { Product } from '../../types'
import {
    archiveProduct,
    deleteProduct,
    getArchivedProducts,
    getProductOrdersCount,
    getProducts,
    unarchiveProduct,
} from '../../api/products'
import ProductModal from './ProductModal'
import { useDebouncedCallback } from 'use-debounce'

const DEFAULT_SORT_FIELD = 'sku'
const DEFAULT_SORT_ORDER = 'asc'

const pluralOrders = (n: number) =>
    n === 1 ? `${n} заказе` : `${n} заказах`

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const nameParam = searchParams.get('name') ?? ''
    const skuParam = searchParams.get('sku') ?? ''
    const carParam = searchParams.get('car') ?? ''
    const tab = (searchParams.get('tab') ?? 'active') as 'active' | 'archived'
    const sortField = searchParams.get('sortField') ?? DEFAULT_SORT_FIELD
    const sortOrder = searchParams.get('sortOrder') ?? DEFAULT_SORT_ORDER

    const [products, setProducts] = useState<Product[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [nameInput, setNameInput] = useState(nameParam)
    const [skuInput, setSkuInput] = useState(skuParam)
    const [carInput, setCarInput] = useState(carParam)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = {
                name: nameParam || undefined,
                sku: skuParam || undefined,
                car: carParam || undefined,
                page,
                size: 10,
                sort: `${sortField},${sortOrder}`,
            }
            const res = tab === 'active'
                ? await getProducts(params)
                : await getArchivedProducts(params)
            setProducts(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, nameParam, skuParam, carParam, tab, sortField, sortOrder])

    useEffect(() => {
        setNameInput(nameParam)
        setSkuInput(skuParam)
        setCarInput(carParam)
    }, [nameParam, skuParam, carParam])

    useEffect(() => {
        load()
    }, [load])

    const updateParam = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value) prev.set(key, value)
            else prev.delete(key)
            prev.set('page', '1')
            return prev
        })
    }

    const handleNameChange = useDebouncedCallback((v: string) => updateParam('name', v), 300)
    const handleSkuChange = useDebouncedCallback((v: string) => updateParam('sku', v), 300)
    const handleCarChange = useDebouncedCallback((v: string) => updateParam('car', v), 300)

    const handleReset = () => {
        setNameInput('')
        setSkuInput('')
        setCarInput('')
        setSearchParams({ tab, page: '1' })
    }

    const hasFilters = !!(nameParam || skuParam || carParam)

    const handleTableChange: TableProps<Product>['onChange'] = (pagination, _filters, sorter) => {
        const s = (Array.isArray(sorter) ? sorter[0] : sorter) as SorterResult<Product>
        const newField = s?.order ? (s.columnKey as string) ?? sortField : sortField
        const newOrder = s?.order
            ? s.order === 'descend' ? 'desc' : 'asc'
            : sortOrder === 'desc' ? 'asc' : 'desc'   // null-клик → тоглим

        setSearchParams(prev => {
            prev.set('page', String(pagination.current ?? 1))
            prev.set('sortField', newField)
            prev.set('sortOrder', newOrder)
            return prev
        })
    }

    const handleTabChange = (key: string) => {
        setNameInput('')
        setSkuInput('')
        setCarInput('')
        setSearchParams({ tab: key, page: '1' })
    }

    const getSortOrder = (field: string) =>
        sortField === field ? (sortOrder === 'desc' ? 'descend' : 'ascend') as 'descend' | 'ascend' : null

    const handleDeleteClick = async (id: number) => {
        try {
            const res = await getProductOrdersCount(id)
            const count = res.data.count
            if (count > 0) {
                Modal.confirm({
                    title: 'Нельзя удалить товар',
                    content: `Товар присутствует в ${pluralOrders(count)}. Хотите переместить его в архив?`,
                    okText: 'В архив',
                    cancelText: 'Отмена',
                    onOk: () => handleArchive(id),
                })
            } else {
                Modal.confirm({
                    title: 'Удалить товар?',
                    content: 'Товар будет удалён без возможности восстановления.',
                    okText: 'Удалить',
                    okButtonProps: { danger: true },
                    cancelText: 'Отмена',
                    onOk: () => handleDelete(id),
                })
            }
        } catch {
            messageApi.error('Не удалось получить информацию о товаре')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id)
            messageApi.success('Товар удалён')
            load()
        } catch {
            messageApi.error('Не удалось удалить товар')
        }
    }

    const handleArchive = async (id: number) => {
        try {
            await archiveProduct(id)
            messageApi.success('Товар перемещён в архив')
            load()
        } catch {
            messageApi.error('Не удалось архивировать товар')
        }
    }

    const handleUnarchive = async (id: number) => {
        try {
            await unarchiveProduct(id)
            messageApi.success('Товар восстановлен из архива')
            load()
        } catch {
            messageApi.error('Не удалось восстановить товар')
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setModalOpen(true)
    }

    const activeColumns: ColumnsType<Product> = [
        {
            title: 'Артикул',
            dataIndex: 'sku',
            key: 'sku',
            sorter: true,
            sortOrder: getSortOrder('sku'),
            render: (v) => <Tag color="purple">{v}</Tag>,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: getSortOrder('name'),
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            sorter: true,
            sortOrder: getSortOrder('price'),
            render: (v) => `${v} ₽`,
        },
        {
            title: 'Автомобиль',
            dataIndex: 'car',
            key: 'car',
            sorter: true,
            sortOrder: getSortOrder('car'),
            render: (v) => v || '—',
        },
        {
            title: 'Остаток',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            sorter: true,
            sortOrder: getSortOrder('stockQuantity'),
            render: (v) => <Tag color={v > 0 ? 'green' : 'red'}>{v} шт.</Tag>,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleEdit(record) }}>
                        Изменить
                    </Button>
                    <Button size="small" danger onClick={(e) => { e.stopPropagation(); void handleDeleteClick(record.id) }}>
                        Удалить
                    </Button>
                </Space>
            ),
        },
    ]

    const archivedColumns: ColumnsType<Product> = [
        {
            title: 'Артикул',
            dataIndex: 'sku',
            key: 'sku',
            sorter: true,
            sortOrder: getSortOrder('sku'),
            render: (v) => <Tag color="default">{v}</Tag>,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: getSortOrder('name'),
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            sorter: true,
            sortOrder: getSortOrder('price'),
            render: (v) => `${v} ₽`,
        },
        {
            title: 'Автомобиль',
            dataIndex: 'car',
            key: 'car',
            render: (v) => v || '—',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleEdit(record) }}>
                        Изменить
                    </Button>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); void handleUnarchive(record.id) }}>
                        Восстановить
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            {contextHolder}
            <Tabs
                activeKey={tab}
                onChange={handleTabChange}
                items={[
                    { key: 'active', label: 'Активные' },
                    { key: 'archived', label: 'Архив' },
                ]}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Input
                    placeholder="Название"
                    style={{ width: 200 }}
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); handleNameChange(e.target.value) }}
                    allowClear
                    onClear={() => { setNameInput(''); handleNameChange('') }}
                />
                <Input
                    placeholder="Артикул"
                    style={{ width: 160 }}
                    value={skuInput}
                    onChange={(e) => { setSkuInput(e.target.value); handleSkuChange(e.target.value) }}
                    allowClear
                    onClear={() => { setSkuInput(''); handleSkuChange('') }}
                />
                <Input
                    placeholder="Автомобиль"
                    style={{ width: 180 }}
                    value={carInput}
                    onChange={(e) => { setCarInput(e.target.value); handleCarChange(e.target.value) }}
                    allowClear
                    onClear={() => { setCarInput(''); handleCarChange('') }}
                />
                {hasFilters && (
                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                        Сбросить
                    </Button>
                )}
                {tab === 'active' && (
                    <div style={{ marginLeft: 'auto' }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProduct(null); setModalOpen(true) }}>
                            Новый товар
                        </Button>
                    </div>
                )}
            </div>
            <Table
                columns={tab === 'active' ? activeColumns : archivedColumns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                showSorterTooltip={false}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    showTotal: (t) => `Всего: ${t}`,
                }}
                onRow={(record) => ({
                    onClick: () => handleEdit(record),
                    style: { cursor: 'pointer' },
                })}
            />
            <ProductModal
                open={modalOpen}
                product={editingProduct}
                onClose={() => setModalOpen(false)}
                onSuccess={() => { setModalOpen(false); load() }}
            />
        </div>
    )
}

export default ProductsPage