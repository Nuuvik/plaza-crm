import { useState, useEffect, useCallback } from 'react'
import { Modal, Form, Select, InputNumber, Button, Table, Space, Input, DatePicker, Divider, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCustomers } from '../../api/customers'
import { getProducts } from '../../api/products'
import { createOrder } from '../../api/orders'
import type { Customer, Product } from '../../types'
import axios from 'axios'

interface OrderItemForm {
    productId: number
    quantity: number
}

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
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

const OrderModal = ({ open, onClose, onSuccess }: Props) => {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [customerId, setCustomerId] = useState<number | null>(null)
    const [items, setItems] = useState<OrderItemForm[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [source, setSource] = useState<string | undefined>(undefined)
    const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined)
    const [paymentDate, setPaymentDate] = useState<import('dayjs').Dayjs | null>(null)
    const [notes, setNotes] = useState('')
    const [loadingData, setLoadingData] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    const loadData = useCallback(async () => {
        setLoadingData(true)
        try {
            const [customersRes, productsRes] = await Promise.all([
                getCustomers({ size: 100 }),
                getProducts({ size: 100 })
            ])
            setCustomers(customersRes.data.content)
            setProducts(productsRes.data.content)
        } catch {
            messageApi.error('Не удалось загрузить данные')
        } finally {
            setLoadingData(false)
        }
    }, [messageApi])

    useEffect(() => {
        if (!open) return
        setCustomerId(null)
        setItems([])
        setSelectedProductId(null)
        setQuantity(1)
        setSource(undefined)
        setPaymentMethod(undefined)
        setPaymentDate(null)
        setNotes('')
        loadData()
    }, [open, loadData])

    const addItem = () => {
        if (!selectedProductId) return
        const existing = items.find(i => i.productId === selectedProductId)
        if (existing) {
            setItems(items.map(i =>
                i.productId === selectedProductId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
            ))
        } else {
            setItems([...items, { productId: selectedProductId, quantity }])
        }
        setSelectedProductId(null)
        setQuantity(1)
    }

    const removeItem = (productId: number) => {
        setItems(items.filter(i => i.productId !== productId))
    }

    const handleSubmit = async () => {
        let currentItems = items
        if (selectedProductId) {
            const existing = currentItems.find(i => i.productId === selectedProductId)
            if (existing) {
                currentItems = currentItems.map(i =>
                    i.productId === selectedProductId
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                )
            } else {
                currentItems = [...currentItems, { productId: selectedProductId, quantity }]
            }
            setItems(currentItems)
            setSelectedProductId(null)
            setQuantity(1)
        }

        if (!customerId) { messageApi.error('Выберите клиента'); return }
        if (currentItems.length === 0) { messageApi.error('Добавьте хотя бы один товар'); return }

        setSubmitting(true)
        try {
            await createOrder({
                customerId,
                items: currentItems,
                source,
                paymentMethod,
                paymentDate: paymentDate ? paymentDate.toISOString() : undefined,
                notes: notes || undefined,
            })
            messageApi.success('Заказ создан')
            onSuccess()
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 400) {
                messageApi.error(e.response?.data?.message || 'Ошибка при создании заказа')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            title: 'Товар', dataIndex: 'productId', key: 'productId',
            render: (id: number) => {
                const p = products.find(p => p.id === id)
                return p ? `${p.name} (${p.sku})` : id
            }
        },
        { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity', width: 80 },
        {
            title: '', key: 'actions', width: 40,
            render: (_: unknown, record: OrderItemForm) => (
                <Button
                    size="small" danger icon={<DeleteOutlined />}
                    onClick={() => removeItem(record.productId)}
                />
            )
        }
    ]

    return (
        <Modal
            title="Новый заказ"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Создать"
            cancelText="Отмена"
            okButtonProps={{ loading: submitting, disabled: loadingData }}
            destroyOnHidden
            width={640}
        >
            {contextHolder}
            <Form layout="vertical" size="small">

                {/* Клиент */}
                <Form.Item label="Клиент" required style={{ marginBottom: 12 }}>
                    <Select
                        showSearch
                        placeholder="Выберите клиента"
                        value={customerId}
                        onChange={setCustomerId}
                        loading={loadingData}
                        disabled={loadingData}
                        filterOption={(input, option) =>
                            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                        options={customers.map(c => ({ value: c.id, label: `${c.name} — ${c.phone}` }))}
                    />
                </Form.Item>

                {/* Источник + способ оплаты */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <Form.Item label="Источник" style={{ flex: 1, marginBottom: 12 }}>
                        <Select
                            placeholder="Откуда заказ"
                            value={source}
                            onChange={setSource}
                            options={SOURCE_OPTIONS}
                            disabled={loadingData}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label="Способ оплаты" style={{ flex: 1, marginBottom: 12 }}>
                        <Select
                            placeholder="Выберите способ"
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                            options={PAYMENT_METHOD_OPTIONS}
                            disabled={loadingData}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label="Дата оплаты" style={{ flex: 1, marginBottom: 12 }}>
                        <DatePicker
                            value={paymentDate}
                            onChange={setPaymentDate}
                            format="DD.MM.YYYY"
                            style={{ width: '100%' }}
                            disabled={loadingData}
                        />
                    </Form.Item>
                </div>

                <Divider style={{ margin: '4px 0 12px' }}>Товары</Divider>

                {/* Добавить товар */}
                <Form.Item style={{ marginBottom: 8 }}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Select
                            showSearch
                            placeholder="Выберите товар"
                            value={selectedProductId}
                            onChange={setSelectedProductId}
                            style={{ flex: 1 }}
                            loading={loadingData}
                            disabled={loadingData}
                            filterOption={(input, option) =>
                                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            options={products.map(p => ({
                                value: p.id,
                                label: `${p.name} (${p.sku}) — ${p.stockQuantity} шт.`
                            }))}
                        />
                        <InputNumber
                            min={1} value={quantity}
                            onChange={(v) => setQuantity(v || 1)}
                            style={{ width: 80 }} disabled={loadingData}
                        />
                        <Button
                            icon={<PlusOutlined />} onClick={addItem}
                            disabled={!selectedProductId || loadingData}
                        />
                    </Space.Compact>
                </Form.Item>

                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="productId"
                    pagination={false}
                    size="small"
                    style={{ marginBottom: 12 }}
                    locale={{ emptyText: 'Товары не добавлены' }}
                />

                <Divider style={{ margin: '4px 0 12px' }} />

                {/* Примечание */}
                <Form.Item label="Примечание" style={{ marginBottom: 0 }}>
                    <Input.TextArea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        disabled={loadingData}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default OrderModal