import { useState, useEffect } from 'react'
import { Modal, Form, Select, InputNumber, Button, Table, Space, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCustomers } from '../../api/customers'
import { getProducts } from '../../api/products'
import { createOrder } from '../../api/orders'
import type { Customer, Product } from '../../types'

interface OrderItemForm {
    productId: number
    quantity: number
}

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const OrderModal = ({ open, onClose, onSuccess }: Props) => {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [customerId, setCustomerId] = useState<number | null>(null)
    const [items, setItems] = useState<OrderItemForm[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (open) {
            getCustomers({ size: 100 }).then(r => setCustomers(r.data.content))
            getProducts({ size: 100 }).then(r => setProducts(r.data.content))
            setCustomerId(null)
            setItems([])
        }
    }, [open])

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
        if (!customerId) { messageApi.error('Выберите клиента'); return }
        if (items.length === 0) { messageApi.error('Добавьте товары'); return }
        try {
            await createOrder({ customerId, items })
            messageApi.success('Заказ создан')
            onSuccess()
        } catch (e: any) {
            messageApi.error(e.response?.data?.message || 'Ошибка')
        }
    }

    const columns = [
        {
            title: 'Товар', dataIndex: 'productId', key: 'productId',
            render: (id: number) => products.find(p => p.id === id)?.name || id
        },
        { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity' },
        {
            title: '', key: 'actions',
            render: (_: any, record: OrderItemForm) => (
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
            destroyOnHidden
            width={600}
        >
            {contextHolder}
            <Form layout="vertical">
                <Form.Item label="Клиент" required>
                    <Select
                        showSearch
                        placeholder="Выберите клиента"
                        value={customerId}
                        onChange={setCustomerId}
                        filterOption={(input, option) =>
                            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                        options={customers.map(c => ({ value: c.id, label: `${c.name} — ${c.phone}` }))}
                    />
                </Form.Item>

                <Form.Item label="Добавить товар">
                    <Space.Compact style={{ width: '100%' }}>
                        <Select
                            showSearch
                            placeholder="Выберите товар"
                            value={selectedProductId}
                            onChange={setSelectedProductId}
                            style={{ flex: 1 }}
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
                            style={{ width: 80 }}
                        />
                        <Button icon={<PlusOutlined />} onClick={addItem} />
                    </Space.Compact>
                </Form.Item>

                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="productId"
                    pagination={false}
                    size="small"
                />
            </Form>
        </Modal>
    )
}

export default OrderModal