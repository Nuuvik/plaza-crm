import {useCallback, useEffect, useState} from 'react'
import {Button, Input, message, Popconfirm, Space, Table, Tag} from 'antd'
import {PlusOutlined, SearchOutlined} from '@ant-design/icons'
import {useSearchParams} from 'react-router-dom'
import type {ColumnsType} from 'antd/es/table'
import type {Product} from '../../types'
import {deleteProduct, getProducts} from '../../api/products'
import ProductModal from './ProductModal'
import {useDebouncedCallback} from 'use-debounce'
import axios from 'axios'

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const search = searchParams.get('name') ?? ''

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
            const res = await getProducts({name: search || undefined, page, size: 10})
            setProducts(res.data.content)
            setTotal(res.data.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => {
        setSearchInput(search)
    }, [search])

    useEffect(() => {
        load()
    }, [load])

    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id)
            messageApi.success('Товар удалён')
            load()
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 400) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
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
            if (val) {
                prev.set('name', val)
            } else {
                prev.delete('name')
            }
            prev.set('page', '1')
            return prev
        })
    }, 300)

    const columns: ColumnsType<Product> = [
        {
            title: 'Артикул', dataIndex: 'sku', key: 'sku',
            render: (v) => <Tag color="purple">{v}</Tag>
        },
        {title: 'Название', dataIndex: 'name', key: 'name'},
        {
            title: 'Цена', dataIndex: 'price', key: 'price',
            render: (v) => `${v} ₽`
        },
        {
            title: 'Автомобиль', dataIndex: 'car', key: 'car',
            render: (v) => v || '—'
        },
        {
            title: 'Остаток', dataIndex: 'stockQuantity', key: 'stockQuantity',
            render: (v) => <Tag color={v > 0 ? 'green' : 'red'}>{v} шт.</Tag>
        },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => handleEdit(record)}>Изменить</Button>
                    <Popconfirm
                        title="Удалить товар?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да" cancelText="Нет"
                    >
                        <Button size="small" danger>Удалить</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <div>
            {contextHolder}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                <Input
                    placeholder="Поиск по названию"
                    prefix={<SearchOutlined/>}
                    style={{width: 300}}
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
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
                    Новый товар
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    onChange: handlePageChange
                }}
            />
            <ProductModal
                open={modalOpen}
                product={editingProduct}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    setModalOpen(false);
                    load()
                }}
            />
        </div>
    )
}

export default ProductsPage