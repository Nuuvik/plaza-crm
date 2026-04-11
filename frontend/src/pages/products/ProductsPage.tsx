import { useCallback, useEffect, useState } from 'react'
import { Button, Input, message, Modal, Space, Table, Tabs, Tag } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
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

const pluralOrders = (n: number) =>
    n === 1 ? `${n} заказе` : `${n} заказах`

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const search = searchParams.get('name') ?? ''
    const tab = (searchParams.get('tab') ?? 'active') as 'active' | 'archived'

    const [products, setProducts] = useState<Product[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState(search)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            if (tab === 'active') {
                const res = await getProducts({ name: search || undefined, page, size: 10 })
                setProducts(res.data.content)
                setTotal(res.data.page.totalElements)
            } else {
                const res = await getArchivedProducts({ name: search || undefined, page, size: 10 })
                setProducts(res.data.content)
                setTotal(res.data.page.totalElements)
            }
        } finally {
            setLoading(false)
        }
    }, [page, search, tab])

    useEffect(() => {
        setSearchInput(search)
    }, [search])

    useEffect(() => {
        load()
    }, [load])

    const handleDeleteClick = async (id: number) => {
        try {
            const res = await getProductOrdersCount(id)
            const count = res.data.count

            if (count > 0) {
                Modal.confirm({
                    title: 'Нельзя удалить товар',
                    content: `Товар присутствует в ${pluralOrders(count)}. Хотите переместить его в архив? Товар будет скрыт из каталога, но история заказов сохранится.`,
                    okText: 'В архив',
                    cancelText: 'Отмена',
                    onOk: () => handleArchive(id),
                })
            } else {
                Modal.confirm({
                    title: 'Удалить товар?',
                    content: 'Товар не используется ни в одном заказе и будет удалён без возможности восстановления.',
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

    const handleCreate = () => {
        setEditingProduct(null)
        setModalOpen(true)
    }

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', String(newPage))
            return prev
        })
    }

    const handleSearch = useDebouncedCallback((val: string) => {
        setSearchParams(prev => {
            if (val) prev.set('name', val)
            else prev.delete('name')
            prev.set('page', '1')
            return prev
        })
    }, 300)

    const handleTabChange = (key: string) => {
        setSearchParams({ tab: key, page: '1' })
        setSearchInput('')
    }

    const activeColumns: ColumnsType<Product> = [
        {
            title: 'Артикул', dataIndex: 'sku', key: 'sku',
            render: (v) => <Tag color="purple">{v}</Tag>
        },
        { title: 'Название', dataIndex: 'name', key: 'name' },
        { title: 'Цена', dataIndex: 'price', key: 'price', render: (v) => `${v} ₽` },
        { title: 'Автомобиль', dataIndex: 'car', key: 'car', render: (v) => v || '—' },
        {
            title: 'Остаток', dataIndex: 'stockQuantity', key: 'stockQuantity',
            render: (v) => <Tag color={v > 0 ? 'green' : 'red'}>{v} шт.</Tag>
        },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleEdit(record) }}>Изменить</Button>
                    <Button size="small" danger onClick={(e) => { e.stopPropagation(); void handleDeleteClick(record.id)}}>
                        Удалить
                    </Button>
                </Space>
            )
        }
    ]

    const archivedColumns: ColumnsType<Product> = [
        {
            title: 'Артикул', dataIndex: 'sku', key: 'sku',
            render: (v) => <Tag color="default">{v}</Tag>
        },
        { title: 'Название', dataIndex: 'name', key: 'name' },
        { title: 'Цена', dataIndex: 'price', key: 'price', render: (v) => `${v} ₽` },
        { title: 'Автомобиль', dataIndex: 'car', key: 'car', render: (v) => v || '—' },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleEdit(record) }}>
                        Изменить
                    </Button>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); void handleUnarchive(record.id) }}>
                        Восстановить
                    </Button>
                </Space>
            )
        }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Input
                    placeholder="Поиск по названию"
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value)
                        handleSearch(e.target.value)
                    }}
                    allowClear
                    onClear={() => {
                        setSearchInput('')
                        handleSearch('')
                    }}
                />
                {tab === 'active' && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Новый товар
                    </Button>
                )}
            </div>
            <Table
                columns={tab === 'active' ? activeColumns : archivedColumns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    onChange: handlePageChange
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
                onSuccess={() => {
                    setModalOpen(false)
                    load()
                }}
            />
        </div>
    )
}

export default ProductsPage