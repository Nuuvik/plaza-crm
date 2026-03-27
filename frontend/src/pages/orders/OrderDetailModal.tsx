import { useState, useEffect, useCallback, useRef } from 'react'
import { Modal, Descriptions, Tag, Table, Button, Space, Input, message, Popconfirm, InputNumber, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getOrderById, confirmOrder, cancelOrder, payOrder, shipOrder, updateNotes, updateItem, removeItem, addItem } from '../../api/orders'
import { getProducts } from '../../api/products'
import type { Order, OrderItem, Product } from '../../types'
import axios from 'axios'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../constants/orderStatus'

interface Props {
    orderId: number
    onClose: () => void
}

const OrderDetailModal = ({ orderId, onClose }: Props) => {
    const [order, setOrder] = useState<Order | null>(null)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const [actionLoading, setActionLoading] = useState(false)

    const notesInitialized = useRef(false)

    const [products, setProducts] = useState<Product[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [addQuantity, setAddQuantity] = useState(1)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getOrderById(orderId)
            setOrder(res.data)
            if (!notesInitialized.current) {
                setNotes(res.data.notes || '')
                notesInitialized.current = true
            }
        } finally {
            setLoading(false)
        }
    }, [orderId])

    const loadProducts = useCallback(async () => {
        const res = await getProducts({ size: 100 })
        setProducts(res.data.content)
    }, [])

    useEffect(() => {
        load()
        loadProducts()
    }, [load, loadProducts])

    // Обновляем позицию локально без перезагрузки
    const updateLocalItem = (productId: number, newQuantity: number) => {
        setOrder(prev => {
            if (!prev) return prev
            const updatedItems = prev.items.map(i =>
                i.productId === productId
                    ? { ...i, quantity: newQuantity, totalPrice: i.unitPrice * newQuantity }
                    : i
            )
            const newTotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
            return { ...prev, items: updatedItems, totalPrice: newTotal }
        })
    }

    // Удаляем позицию локально без перезагрузки
    const removeLocalItem = (productId: number) => {
        setOrder(prev => {
            if (!prev) return prev
            const updatedItems = prev.items.filter(i => i.productId !== productId)
            const newTotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
            return { ...prev, items: updatedItems, totalPrice: newTotal }
        })
    }

    // Добавляем позицию локально без перезагрузки
    const addLocalItem = (product: Product, quantity: number) => {
        setOrder(prev => {
            if (!prev) return prev
            const existing = prev.items.find(i => i.productId === product.id)
            let updatedItems
            if (existing) {
                updatedItems = prev.items.map(i =>
                    i.productId === product.id
                        ? { ...i, quantity: i.quantity + quantity, totalPrice: i.unitPrice * (i.quantity + quantity) }
                        : i
                )
            } else {
                const newItem: OrderItem = {
                    productId: product.id,
                    sku: product.sku,
                    productName: product.name,
                    quantity,
                    unitPrice: product.price,
                    totalPrice: product.price * quantity
                }
                updatedItems = [...prev.items, newItem]
            }
            const newTotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
            return { ...prev, items: updatedItems, totalPrice: newTotal }
        })
    }

    const updateLocalStock = (productId: number, delta: number) => {
        setProducts(prev => prev.map(p =>
            p.id === productId
                ? { ...p, stockQuantity: p.stockQuantity + delta }
                : p
        ))
    }

    // load() только для смены статуса
    const handleAction = async (action: () => Promise<unknown>) => {
        setActionLoading(true)
        try {
            await action()
            await load()
            messageApi.success('Статус обновлён')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status !== 500 && e.response?.status !== 403) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleSaveNotes = async () => {
        setActionLoading(true)
        try {
            await updateNotes(orderId, notes)
            messageApi.success('Примечание сохранено')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 400) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleUpdateQuantity = async (productId: number, newQuantity: number, oldQuantity: number) => {
        setActionLoading(true)
        try {
            await updateItem(orderId, productId, newQuantity)
            updateLocalItem(productId, newQuantity)
            updateLocalStock(productId, oldQuantity - newQuantity)
            messageApi.success('Количество обновлено')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status !== 500 && e.response?.status !== 403) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleRemoveItem = async (productId: number, quantity: number) => {
        setActionLoading(true)
        try {
            await removeItem(orderId, productId)
            removeLocalItem(productId)
            updateLocalStock(productId, quantity)
            messageApi.success('Позиция удалена')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status !== 500 && e.response?.status !== 403) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleAddItem = async () => {
        if (!selectedProductId) return
        const product = products.find(p => p.id === selectedProductId)
        if (!product) return
        setActionLoading(true)
        try {
            await addItem(orderId, selectedProductId, addQuantity)
            addLocalItem(product, addQuantity)
            updateLocalStock(selectedProductId, -addQuantity)
            setSelectedProductId(null)
            setAddQuantity(1)
            messageApi.success('Товар добавлен')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status !== 500 && e.response?.status !== 403) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const isEditable = order?.status === 'NEW'

    const itemColumns = [
        { title: 'Артикул', dataIndex: 'sku', key: 'sku' },
        { title: 'Товар', dataIndex: 'productName', key: 'productName' },
        {
            title: 'Кол-во',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (v: number, record: OrderItem) => isEditable ? (
                <InputNumber
                    min={1}
                    value={v}
                    disabled={actionLoading}
                    onChange={(newVal) => {
                        if (newVal && newVal >= 1 && newVal !== v) {
                            handleUpdateQuantity(record.productId, newVal, v)
                        }
                    }}
                    style={{ width: 80 }}
                />
            ) : v
        },
        { title: 'Цена', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `${v} ₽` },
        { title: 'Итого', dataIndex: 'totalPrice', key: 'totalPrice', render: (v: number) => `${v} ₽` },
        ...(isEditable ? [{
            title: '',
            key: 'remove',
            width: 40,
            render: (_: unknown, record: OrderItem) => (
                <Popconfirm
                    title="Удалить позицию?"
                    onConfirm={() => handleRemoveItem(record.productId, record.quantity)}
                    okText="Да"
                    cancelText="Нет"
                    disabled={actionLoading}
                >
                    <Button size="small" danger disabled={actionLoading}>✕</Button>
                </Popconfirm>
            )
        }] : [])
    ]

    return (
        <Modal
            title={`Заказ №${orderId}`}
            open={true}
            onCancel={onClose}
            footer={null}
            width={700}
            loading={loading}
        >
            {contextHolder}
            {order && (
                <>
                    <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
                        <Descriptions.Item label="Статус">
                            <Tag color={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Клиент">{order.customerName}</Descriptions.Item>
                        <Descriptions.Item label="Сумма">{order.totalPrice} ₽</Descriptions.Item>
                        <Descriptions.Item label="Дата">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </Descriptions.Item>
                    </Descriptions>

                    <Table
                        columns={itemColumns}
                        dataSource={order.items}
                        rowKey="productId"
                        pagination={false}
                        size="small"
                        style={{ marginBottom: 16 }}
                    />

                    {isEditable && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>Добавить товар:</div>
                            <Space.Compact style={{ width: '100%' }}>
                                <Select
                                    showSearch
                                    placeholder="Выберите товар"
                                    value={selectedProductId}
                                    onChange={setSelectedProductId}
                                    style={{ flex: 1 }}
                                    disabled={actionLoading}
                                    filterOption={(input, option) =>
                                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={products.map(p => ({
                                        value: p.id,
                                        label: `${p.name} (${p.sku}) — ${p.stockQuantity} шт.`
                                    }))}
                                />
                                <InputNumber
                                    min={1}
                                    value={addQuantity}
                                    onChange={(v) => setAddQuantity(v || 1)}
                                    style={{ width: 80 }}
                                    disabled={actionLoading}
                                />
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={handleAddItem}
                                    disabled={!selectedProductId || actionLoading}
                                    type="primary"
                                >
                                    Добавить
                                </Button>
                            </Space.Compact>
                        </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Примечание:</div>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input.TextArea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                            <Button onClick={handleSaveNotes} disabled={actionLoading}>
                                Сохранить
                            </Button>
                        </Space.Compact>
                    </div>

                    {order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && (
                        <Space wrap>
                            {order.status === 'NEW' && (
                                <Button
                                    type="primary"
                                    loading={actionLoading}
                                    disabled={actionLoading}
                                    onClick={() => handleAction(() => confirmOrder(orderId))}
                                >
                                    Подтвердить
                                </Button>
                            )}
                            {order.status === 'CONFIRMED' && (
                                <Button
                                    type="primary"
                                    loading={actionLoading}
                                    disabled={actionLoading}
                                    onClick={() => handleAction(() => payOrder(orderId))}
                                >
                                    Оплачен
                                </Button>
                            )}
                            {order.status === 'PAID' && (
                                <Button
                                    type="primary"
                                    loading={actionLoading}
                                    disabled={actionLoading}
                                    onClick={() => handleAction(() => shipOrder(orderId))}
                                >
                                    Отправить
                                </Button>
                            )}
                            <Popconfirm
                                title="Отменить заказ?"
                                onConfirm={() => handleAction(() => cancelOrder(orderId))}
                                okText="Да" cancelText="Нет"
                                disabled={actionLoading}
                            >
                                <Button danger disabled={actionLoading}>Отменить</Button>
                            </Popconfirm>
                        </Space>
                    )}
                </>
            )}
        </Modal>
    )
}

export default OrderDetailModal