import {useState, useEffect, useCallback} from 'react'
import { Modal, Descriptions, Tag, Table, Button, Space, Input, message, Popconfirm } from 'antd'
import { getOrderById, confirmOrder, cancelOrder, payOrder, shipOrder, updateNotes } from '../../api/orders'
import type { Order } from '../../types'
import axios from "axios";
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

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getOrderById(orderId)
            setOrder(res.data)
            setNotes(res.data.notes || '')
        } finally {
            setLoading(false)
        }
    }, [orderId])

    useEffect(() => { load() }, [load])

    const handleAction = async (action: () => Promise<unknown>) => {
        setActionLoading(true)
        try {
            await action()
            await load() // load стабилен благодаря useCallback
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
        try {
            await updateNotes(orderId, notes)
            messageApi.success('Примечание сохранено')
        } catch {
            messageApi.error('Ошибка')
        }
    }

    const itemColumns = [
        { title: 'SKU', dataIndex: 'sku', key: 'sku' },
        { title: 'Товар', dataIndex: 'productName', key: 'productName' },
        { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Цена', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `${v} ₽` },
        { title: 'Итого', dataIndex: 'totalPrice', key: 'totalPrice', render: (v: number) => `${v} ₽` },
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