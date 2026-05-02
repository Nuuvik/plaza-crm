import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Select, Space, Table, Tag } from 'antd'
import { ClearOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Car, Product } from '../../types'
import {getProductById, getProducts} from '../../api/products'
import { getMaxAssemblable } from '../../api/bom'
import { getCars } from '../../api/cars'
import { getMe } from '../../api/auth'
import BomModal from './BomModal'
import AssemblyModal from './AssemblyModal'
import ProductModal from '../products/ProductModal'
import { useDebouncedCallback } from 'use-debounce'

interface ProductWithMax extends Product {
    maxAssemblable?: number
}

const ProductsTab = () => {
    const [products, setProducts] = useState<ProductWithMax[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [cars, setCars] = useState<Car[]>([])
    const [nameInput, setNameInput] = useState('')
    const [skuInput, setSkuInput] = useState('')
    const [nameFilter, setNameFilter] = useState('')
    const [skuFilter, setSkuFilter] = useState('')
    const [carIdFilter, setCarIdFilter] = useState<number | undefined>()
    const [bomProduct, setBomProduct] = useState<Product | null>(null)
    const [assemblyProduct, setAssemblyProduct] = useState<Product | null>(null)
    const [productModalOpen, setProductModalOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        getCars({ size: 200 }).then(r => setCars(r.data.content))
        getMe().then(r => setIsAdmin(r.data.role === 'ADMIN'))
    }, [])

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getProducts({
                name: nameFilter || undefined,
                sku: skuFilter || undefined,
                carId: carIdFilter,
                page,
                size: 10,
            })
            const content = res.data.content

            const withMax = await Promise.all(
                content.map(async (p) => {
                    try {
                        const r = await getMaxAssemblable(p.id)
                        return { ...p, maxAssemblable: r.data.maxAssemblable }
                    } catch {
                        return { ...p, maxAssemblable: 0 }
                    }
                })
            )

            setProducts(withMax)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, nameFilter, skuFilter, carIdFilter])

    useEffect(() => { load() }, [load])

    const handleNameChange = useDebouncedCallback((v: string) => {
        setNameFilter(v)
        setPage(0)
    }, 300)

    const handleSkuChange = useDebouncedCallback((v: string) => {
        setSkuFilter(v)
        setPage(0)
    }, 300)

    const handleReset = () => {
        setNameInput('')
        setSkuInput('')
        setNameFilter('')
        setSkuFilter('')
        setCarIdFilter(undefined)
        setPage(0)
    }

    const hasFilters = !!(nameFilter || skuFilter || carIdFilter)

    const handleProductCreated = (product: Product) => {
        setProductModalOpen(false)
        load()
        setBomProduct(product)
    }

    const refreshAllRows = async () => {
        setProducts(prev => {
            // запускаем обновление для каждой строки параллельно
            Promise.all(
                prev.map(async (p) => {
                    try {
                        const [productRes, maxRes] = await Promise.all([
                            getProductById(p.id),
                            getMaxAssemblable(p.id),
                        ])
                        return { ...productRes.data, maxAssemblable: maxRes.data.maxAssemblable }
                    } catch {
                        return p
                    }
                })
            ).then(updated => {
                setProducts(updated)
            })
            // пока запросы летят — оставляем старые данные без перемешивания
            return prev
        })
    }

    const columns: ColumnsType<ProductWithMax> = [
        {
            title: 'Артикул',
            dataIndex: 'sku',
            key: 'sku',
            render: (v) => <Tag color="purple">{v}</Tag>,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Автомобиль',
            dataIndex: 'car',
            key: 'car',
            render: (car: Car | null) => car ? `${car.brand} ${car.model}` : '—',
        },
        {
            title: 'На складе',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            render: (v) => (
                <Tag color={v > 0 ? 'green' : 'red'}>{v} шт.</Tag>
            ),
        },
        {
            title: 'Можно собрать',
            dataIndex: 'maxAssemblable',
            key: 'maxAssemblable',
            render: (v: number) => (
                <Tag color={v > 0 ? 'blue' : 'default'}>
                    ≤ {v} шт.
                </Tag>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {isAdmin && (
                        <Button
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                setBomProduct(record)
                            }}
                        >
                            Спецификация
                        </Button>
                    )}
                    <Button
                        size="small"
                        type="primary"
                        ghost
                        disabled={record.maxAssemblable === 0}
                        onClick={(e) => {
                            e.stopPropagation()
                            setAssemblyProduct(record)
                        }}
                    >
                        Собрать
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
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
                <Select
                    allowClear
                    placeholder="Автомобиль"
                    style={{ width: 200 }}
                    value={carIdFilter}
                    onChange={(v) => { setCarIdFilter(v); setPage(0) }}
                    options={cars.map(c => ({
                        value: c.id,
                        label: `${c.brand} ${c.model}`,
                    }))}
                />
                {hasFilters && (
                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                        Сбросить
                    </Button>
                )}
                {isAdmin && (
                    <div style={{ marginLeft: 'auto' }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setProductModalOpen(true)}
                        >
                            Новый товар
                        </Button>
                    </div>
                )}
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
                    showTotal: (t) => `Всего: ${t}`,
                    onChange: (p) => setPage(p - 1),
                }}
            />

            {bomProduct && (
                <BomModal
                    open={bomProduct !== null}
                    productId={bomProduct.id}
                    productName={bomProduct.name}
                    onClose={() => { setBomProduct(null); load() }}
                />
            )}

            <AssemblyModal
                open={assemblyProduct !== null}
                product={assemblyProduct}
                onClose={() => setAssemblyProduct(null)}
                onSuccess={() => {
                    setAssemblyProduct(null)
                    refreshAllRows()
                }}
            />

            <ProductModal
                open={productModalOpen}
                product={null}
                onClose={() => setProductModalOpen(false)}
                onSuccess={handleProductCreated}
            />
        </div>
    )
}

export default ProductsTab