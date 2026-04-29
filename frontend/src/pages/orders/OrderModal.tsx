import {useCallback, useEffect, useState} from 'react'
import {
    Button,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Segmented,
    Select,
    Space,
    Table,
    theme
} from 'antd'
import {DeleteOutlined, PlusOutlined, TeamOutlined, UserAddOutlined} from '@ant-design/icons'
import {createCustomer, getCustomers} from '../../api/customers'
import {getProducts} from '../../api/products'
import {createOrder} from '../../api/orders'
import type {Customer, Product} from '../../types'
import axios from 'axios'
import {extractErrorMessage} from '../../api/utils'

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

const CUSTOMER_MODE_OPTIONS = [
    { value: 'existing', label: <><TeamOutlined /> Существующий</> },
    { value: 'new', label: <><UserAddOutlined /> Новый клиент</> },
]

interface NewCustomerErrors {
    name?: string
    phone?: string
    email?: string
}

const OrderModal = ({ open, onClose, onSuccess }: Props) => {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing')

    // Existing customer
    const [customerId, setCustomerId] = useState<number | null>(null)
    const [customerIdError, setCustomerIdError] = useState<string | undefined>()

    // New customer fields
    const [newCustomerName, setNewCustomerName] = useState('')
    const [newCustomerPhone, setNewCustomerPhone] = useState('')
    const [newCustomerEmail, setNewCustomerEmail] = useState('')
    const [newCustomerTelegram, setNewCustomerTelegram] = useState('')
    const [newCustomerAddress, setNewCustomerAddress] = useState('')
    const [newCustomerErrors, setNewCustomerErrors] = useState<NewCustomerErrors>({})

    // Order fields
    const [items, setItems] = useState<OrderItemForm[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [source, setSource] = useState<string | undefined>(undefined)
    const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined)
    const [paymentDate, setPaymentDate] = useState<import('dayjs').Dayjs | null>(null)
    const [notes, setNotes] = useState('')
    const [itemsError, setItemsError] = useState<string | undefined>()

    const [loadingData, setLoadingData] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    const { token } = theme.useToken()

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
        setCustomerMode('existing')
        setCustomerId(null)
        setCustomerIdError(undefined)
        setNewCustomerName('')
        setNewCustomerPhone('')
        setNewCustomerEmail('')
        setNewCustomerTelegram('')
        setNewCustomerAddress('')
        setNewCustomerErrors({})
        setItems([])
        setSelectedProductId(null)
        setQuantity(1)
        setSource(undefined)
        setPaymentMethod(undefined)
        setPaymentDate(null)
        setNotes('')
        setItemsError(undefined)
        loadData()
    }, [open, loadData])

    const addItem = () => {
        if (!selectedProductId) return
        setItemsError(undefined)
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

    const validateNewCustomer = (): NewCustomerErrors => {
        const errors: NewCustomerErrors = {}
        if (!newCustomerName.trim()) {
            errors.name = 'Введите имя клиента'
        } else if (newCustomerName.trim().length > 150) {
            errors.name = 'Не более 150 символов'
        }
        if (!newCustomerPhone.trim()) {
            errors.phone = 'Введите телефон'
        } else if (newCustomerPhone.trim().length > 20) {
            errors.phone = 'Не более 20 символов'
        }
        if (newCustomerEmail && newCustomerEmail.length > 255) {
            errors.email = 'Не более 255 символов'
        }
        return errors
    }

    const handleSubmit = async () => {
        // Финализируем незакрытый товар в списке
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

        // Собираем все ошибки сразу, не прерываясь на первой
        let hasErrors = false

        if (currentItems.length === 0) {
            setItemsError('Добавьте хотя бы один товар')
            hasErrors = true
        } else {
            setItemsError(undefined)
        }

        if (customerMode === 'existing') {
            if (!customerId) {
                setCustomerIdError('Выберите клиента')
                hasErrors = true
            } else {
                setCustomerIdError(undefined)
            }
        } else {
            const errors = validateNewCustomer()
            if (Object.keys(errors).length > 0) {
                setNewCustomerErrors(errors)
                hasErrors = true
            } else {
                setNewCustomerErrors({})
            }
        }

        if (hasErrors) return

        setSubmitting(true)

        let resolvedCustomerId: number

        if (customerMode === 'existing') {
            resolvedCustomerId = customerId!
        } else {
            try {
                const res = await createCustomer({
                    name: newCustomerName.trim(),
                    phone: newCustomerPhone.trim(),
                    email: newCustomerEmail.trim() || '',
                    telegram: newCustomerTelegram.trim() || '',
                    address: newCustomerAddress.trim() || '',
                })
                resolvedCustomerId = res.data.id
            } catch (e: unknown) {
                if (axios.isAxiosError(e) && e.response?.status === 400) {
                    const data = e.response.data
                    if (data?.errors) {
                        setNewCustomerErrors({
                            name: data.errors.name,
                            phone: data.errors.phone,
                            email: data.errors.email,
                        })
                    } else {
                        messageApi.error(extractErrorMessage(e, 'Ошибка при создании клиента'))
                    }
                } else {
                    messageApi.error(extractErrorMessage(e, 'Ошибка при создании клиента'))
                }
                setSubmitting(false)
                return
            }
        }

        try {
            await createOrder({
                customerId: resolvedCustomerId,
                items: currentItems,
                source,
                paymentMethod,
                paymentDate: paymentDate ? paymentDate.toISOString() : undefined,
                notes: notes || undefined,
            })
            messageApi.success('Заказ создан')
            onSuccess()
        } catch (e: unknown) {
            messageApi.error(extractErrorMessage(e, 'Ошибка при создании заказа'))
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

                {/* Переключатель режима клиента */}
                <Form.Item style={{ marginBottom: 12 }}>
                    <Segmented
                        options={CUSTOMER_MODE_OPTIONS}
                        value={customerMode}
                        onChange={(v) => {
                            setCustomerMode(v as 'existing' | 'new')
                            setCustomerIdError(undefined)
                            setNewCustomerErrors({})
                        }}
                        block
                    />
                </Form.Item>

                {/* Существующий клиент */}
                {customerMode === 'existing' && (
                    <Form.Item
                        label="Клиент"
                        required
                        style={{ marginBottom: 12 }}
                        validateStatus={customerIdError ? 'error' : ''}
                        help={customerIdError}
                    >
                        <Select
                            showSearch
                            placeholder="Выберите клиента"
                            value={customerId}
                            onChange={(v) => {
                                setCustomerId(v)
                                setCustomerIdError(undefined)
                            }}
                            loading={loadingData}
                            disabled={loadingData}
                            filterOption={(input, option) =>
                                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            options={customers.map(c => ({ value: c.id, label: `${c.name} — ${c.phone}` }))}
                        />
                    </Form.Item>
                )}

                {/* Новый клиент */}
                {customerMode === 'new' && (
                    <div
                        style={{
                            background: token.colorFillAlter,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            borderRadius: token.borderRadius,
                            padding: '12px 12px 4px',
                            marginBottom: 12,
                        }}
                    >
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Form.Item
                                label="Имя" required style={{ flex: 1, marginBottom: 8 }}
                                validateStatus={newCustomerErrors.name ? 'error' : ''}
                                help={newCustomerErrors.name}
                            >
                                <Input
                                    placeholder="Иванов Иван"
                                    value={newCustomerName}
                                    onChange={e => {
                                        setNewCustomerName(e.target.value)
                                        if (newCustomerErrors.name) {
                                            setNewCustomerErrors(p => ({ ...p, name: undefined }))
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Телефон" required style={{ flex: 1, marginBottom: 8 }}
                                validateStatus={newCustomerErrors.phone ? 'error' : ''}
                                help={newCustomerErrors.phone}
                            >
                                <Input
                                    placeholder="+7 900 000-00-00"
                                    value={newCustomerPhone}
                                    onChange={e => {
                                        setNewCustomerPhone(e.target.value)
                                        if (newCustomerErrors.phone) {
                                            setNewCustomerErrors(p => ({ ...p, phone: undefined }))
                                        }
                                    }}
                                />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Form.Item
                                label="Email" style={{ flex: 1, marginBottom: 8 }}
                                validateStatus={newCustomerErrors.email ? 'error' : ''}
                                help={newCustomerErrors.email}
                            >
                                <Input
                                    placeholder="mail@example.com"
                                    value={newCustomerEmail}
                                    onChange={e => {
                                        setNewCustomerEmail(e.target.value)
                                        if (newCustomerErrors.email) {
                                            setNewCustomerErrors(p => ({ ...p, email: undefined }))
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item label="Telegram" style={{ flex: 1, marginBottom: 8 }}>
                                <Input
                                    placeholder="@username"
                                    value={newCustomerTelegram}
                                    onChange={e => setNewCustomerTelegram(e.target.value)}
                                />
                            </Form.Item>
                        </div>
                        <Form.Item label="Адрес" style={{ marginBottom: 8 }}>
                            <Input
                                placeholder="Город, улица, дом"
                                value={newCustomerAddress}
                                onChange={e => setNewCustomerAddress(e.target.value)}
                            />
                        </Form.Item>
                    </div>
                )}

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
                            onChange={(v) => {
                                setSelectedProductId(v)
                                setItemsError(undefined)
                            }}
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
                    style={{ marginBottom: itemsError ? 4 : 12 }}
                    locale={{ emptyText: 'Товары не добавлены' }}
                />
                {itemsError && (
                    <div style={{ color: '#ff4d4f', fontSize: 14, marginBottom: 12 }}>
                        {itemsError}
                    </div>
                )}

                <Divider style={{ margin: '4px 0 12px' }} />

                {/* Примечание */}
                <Form.Item label="Примечание" style={{ marginBottom: 0 }}>
                    <Input.TextArea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        maxLength={1000}
                        showCount
                        disabled={loadingData}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default OrderModal