import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Modal, Descriptions, Tag, Table, Button, Space,
    Input, message, Popconfirm, InputNumber, Select,
    Switch, Divider, DatePicker, Form
} from 'antd'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
    getOrderById, confirmOrder, cancelOrder, shipOrder,
    completeOrder, updatePayment, updateInfo,
    updateItem, removeItem, addItem
} from '../../api/orders'
import { getProducts } from '../../api/products'
import type { Order, OrderItem, Product } from '../../types'
import axios from 'axios'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, STATUS_TRANSITIONS } from '../../constants/orderStatus'
import {extractErrorMessage} from "../../api/utils.ts";

interface Props {
    orderId: number
    onClose: () => void
}

const SOURCE_OPTIONS = [
    { value: 'CRM', label: 'CRM' },
    { value: 'Телефон', label: 'Телефон' },
    { value: 'Сайт', label: 'Сайт' },
    { value: 'Мессенджер', label: 'Мессенджер' },
    { value: 'Лично', label: 'Лично' },
]

const PAYMENT_METHOD_OPTIONS = [
    { value: 'Наличные', label: 'Наличные' },
    { value: 'Карта', label: 'Карта' },
    { value: 'Перевод', label: 'Перевод' },
    { value: 'Онлайн', label: 'Онлайн' },
]

const OrderDetailModal = ({ orderId, onClose }: Props) => {
    const [order, setOrder] = useState<Order | null>(null)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const notesInitialized = useRef(false)

    // details form
    const [source, setSource] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
    const [paymentDate, setPaymentDate] = useState<dayjs.Dayjs | null>(null)
    const detailsInitialized = useRef(false)

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
            if (!detailsInitialized.current) {
                setSource(res.data.source || '')
                setPaymentMethod(res.data.paymentMethod || null)
                setPaymentDate(res.data.paymentDate ? dayjs(res.data.paymentDate) : null)
                detailsInitialized.current = true
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

    const updateLocalItem = (productId: number, newQuantity: number) => {
        setOrder(prev => {
            if (!prev) return prev
            const updatedItems = prev.items.map(i =>
                i.productId === productId
                    ? { ...i, quantity: newQuantity, totalPrice: i.unitPrice * newQuantity }
                    : i
            )
            return { ...prev, items: updatedItems, totalPrice: updatedItems.reduce((s, i) => s + i.totalPrice, 0) }
        })
    }

    const removeLocalItem = (productId: number) => {
        setOrder(prev => {
            if (!prev) return prev
            const updatedItems = prev.items.filter(i => i.productId !== productId)
            return { ...prev, items: updatedItems, totalPrice: updatedItems.reduce((s, i) => s + i.totalPrice, 0) }
        })
    }

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
                    productId: product.id, sku: product.sku, productName: product.name,
                    quantity, unitPrice: product.price, totalPrice: product.price * quantity,
                }
                updatedItems = [...prev.items, newItem]
            }
            return { ...prev, items: updatedItems, totalPrice: updatedItems.reduce((s, i) => s + i.totalPrice, 0) }
        })
    }

    const updateLocalStock = (productId: number, delta: number) => {
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, stockQuantity: p.stockQuantity + delta } : p
        ))
    }

    const executeStatusChange = async (newStatus: string) => {
        setActionLoading(true)
        try {
            switch (newStatus) {
                case 'CONFIRMED': await confirmOrder(orderId); break
                case 'SHIPPED':   await shipOrder(orderId); break
                case 'COMPLETED': await completeOrder(orderId); break
                case 'CANCELLED': await cancelOrder(orderId); break
            }
            await load()
            messageApi.success('Статус обновлён')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data?.message) {
                messageApi.error(extractErrorMessage(e))
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === 'CANCELLED') {
            Modal.confirm({
                title: 'Отменить заказ?',
                content: 'Товары вернутся на склад. Это действие нельзя отменить.',
                okText: 'Да, отменить',
                okButtonProps: { danger: true },
                cancelText: 'Нет',
                onOk: () => executeStatusChange('CANCELLED'),
            })
            return
        }
        executeStatusChange(newStatus)
    }

    const handlePaymentToggle = async (checked: boolean) => {
        setActionLoading(true)
        try {
            const res = await updatePayment(orderId, checked)
            setOrder(res.data)
            messageApi.success(checked ? 'Отмечено как оплаченный' : 'Отметка об оплате снята')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data?.message) {
                messageApi.error(extractErrorMessage(e))
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleSaveAll = async () => {
        setActionLoading(true)
        try {
            const res = await updateInfo(orderId, {
                notes,
                source: source || undefined,
                paymentMethod,
                paymentDate: paymentDate ? paymentDate.toISOString() : null,
            })
            setOrder(res.data)
            messageApi.success('Сохранено')
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data?.message) {
                messageApi.error(extractErrorMessage(e))
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
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data?.message) {
                messageApi.error(extractErrorMessage(e))
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
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.data?.message) {
                messageApi.error(extractErrorMessage(e))
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
            if (axios.isAxiosError(e) && e.response?.data?.message) {
                messageApi.error(extractErrorMessage(e))
            }
        } finally {
            setActionLoading(false)
        }
    }

    const isEditable = order?.status === 'NEW'
    const isCancelled = order?.status === 'CANCELLED'
    const availableTransitions = order ? STATUS_TRANSITIONS[order.status] ?? [] : []

    const itemColumns = [
        { title: 'Артикул', dataIndex: 'sku', key: 'sku' },
        { title: 'Товар', dataIndex: 'productName', key: 'productName' },
        {
            title: 'Кол-во', dataIndex: 'quantity', key: 'quantity',
            render: (v: number, record: OrderItem) => isEditable ? (
                <InputNumber
                    min={1} value={v} disabled={actionLoading}
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
            title: '', key: 'remove', width: 40,
            render: (_: unknown, record: OrderItem) => (
                <Popconfirm
                    title="Удалить позицию?"
                    onConfirm={() => handleRemoveItem(record.productId, record.quantity)}
                    okText="Да" cancelText="Нет" disabled={actionLoading}
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
            width={720}
            loading={loading}
        >
            {contextHolder}
            {order && (
                <>
                    <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
                        <Descriptions.Item label="Клиент">{order.customerName}</Descriptions.Item>
                        <Descriptions.Item label="Сумма">{order.totalPrice} ₽</Descriptions.Item>
                        <Descriptions.Item label="Дата">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Статус и оплата */}
                    <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 500, color: '#888' }}>Статус:</span>
                            <Select
                                value={order.status}
                                onChange={handleStatusChange}
                                disabled={actionLoading || availableTransitions.length === 0}
                                style={{ minWidth: 160 }}
                                options={[
                                    { value: order.status, label: ORDER_STATUS_LABELS[order.status], disabled: true },
                                    ...availableTransitions.map(s => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
                                ]}
                                labelRender={({ value }) => {
                                    const v = value as string
                                    return (
                                        <Tag
                                            color={ORDER_STATUS_COLORS[v]}
                                            style={{ margin: 0, cursor: availableTransitions.length > 0 ? 'pointer' : 'default' }}
                                        >
                                            {ORDER_STATUS_LABELS[v]}
                                        </Tag>
                                    )
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 500, color: '#888' }}>Оплата:</span>
                            <Switch
                                checked={order.paid}
                                onChange={handlePaymentToggle}
                                disabled={isCancelled || actionLoading}
                                checkedChildren="Оплачен"
                                unCheckedChildren="Не оплачен"
                            />
                        </div>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    {/* Позиции */}
                    <Table
                        columns={itemColumns}
                        dataSource={order.items}
                        rowKey="productId"
                        pagination={false}
                        size="small"
                        style={{ marginBottom: 16 }}
                    />

                    {/* Добавить товар */}
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
                                    min={1} value={addQuantity}
                                    onChange={(v) => setAddQuantity(v || 1)}
                                    style={{ width: 80 }} disabled={actionLoading}
                                />
                                <Button
                                    icon={<PlusOutlined />} onClick={handleAddItem}
                                    disabled={!selectedProductId || actionLoading} type="primary"
                                >
                                    Добавить
                                </Button>
                            </Space.Compact>
                        </div>
                    )}

                    <Divider style={{ margin: '12px 0' }} />

                    {/* Детали + примечание */}
                    <Form layout="vertical" size="small">
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Form.Item label="Источник" style={{ flex: 1, marginBottom: 8 }}>
                                <Select
                                    value={source || undefined}
                                    onChange={setSource}
                                    placeholder="Откуда заказ"
                                    disabled={isCancelled || actionLoading}
                                    options={SOURCE_OPTIONS}
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item label="Способ оплаты" style={{ flex: 1, marginBottom: 8 }}>
                                <Select
                                    value={paymentMethod || undefined}
                                    onChange={v => setPaymentMethod(v ?? null)}
                                    placeholder="Выберите способ"
                                    disabled={isCancelled || actionLoading}
                                    options={PAYMENT_METHOD_OPTIONS}
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item label="Дата оплаты" style={{ flex: 1, marginBottom: 8 }}>
                                <DatePicker
                                    value={paymentDate}
                                    onChange={v => setPaymentDate(v)}
                                    format="DD.MM.YYYY"
                                    style={{ width: '100%' }}
                                    disabled={isCancelled || actionLoading}
                                    allowClear
                                />
                            </Form.Item>
                        </div>
                        <Form.Item label="Примечание" style={{ marginBottom: 8 }}>
                            <Input.TextArea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                disabled={isCancelled || actionLoading}
                            />
                        </Form.Item>
                        <Button
                            icon={<SaveOutlined />}
                            onClick={handleSaveAll}
                            disabled={isCancelled || actionLoading}
                            size="small"
                        >
                            Сохранить
                        </Button>
                    </Form>
                </>
            )}
        </Modal>
    )
}

export default OrderDetailModal