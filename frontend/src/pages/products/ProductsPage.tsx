import {useState, useEffect, useCallback} from 'react'
import { Table, Button, Input, Space, Popconfirm, message, Tag } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Product } from '../../types'
import { getProducts, deleteProduct } from '../../api/products'
import ProductModal from './ProductModal'
import { useDebouncedCallback } from 'use-debounce'

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = useCallback(async (p = page, s = search) => {
        setLoading(true)
        try {
            const res = await getProducts({ name: s || undefined, page: p, size: 10 })
            setProducts(res.data.content)
            setTotal(res.data.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => {
        load()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { load() }, [])

    const handleDelete = async (id: number) => {
        await deleteProduct(id)
        messageApi.success('Товар удалён')
        load()
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setModalOpen(true)
    }

    const handleCreate = () => {
        setEditingProduct(null)
        setModalOpen(true)
    }

    const handleSearch = useDebouncedCallback((val: string) => {
        setPage(0)
        load(0, val)
    }, 300)

    const columns: ColumnsType<Product> = [
        { title: 'SKU', dataIndex: 'sku', key: 'sku',
            render: (v) => <Tag color="purple">{v}</Tag> },
        { title: 'Название', dataIndex: 'name', key: 'name' },
        { title: 'Цена', dataIndex: 'price', key: 'price',
            render: (v) => `${v} ₽` },
        { title: 'Автомобиль', dataIndex: 'car', key: 'car',
            render: (v) => v || '—' },
        { title: 'Остаток', dataIndex: 'stockQuantity', key: 'stockQuantity',
            render: (v) => <Tag color={v > 0 ? 'green' : 'red'}>{v} шт.</Tag> },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Input
                    placeholder="Поиск по названию"
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        handleSearch(e.target.value)
                    }}
                    allowClear
                    onClear={() => {
                        setSearch('')
                        handleSearch('')
                    }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
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
                    onChange: (p) => { setPage(p - 1); load(p - 1) }
                }}
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