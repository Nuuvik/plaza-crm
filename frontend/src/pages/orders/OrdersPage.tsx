import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Tag, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Order } from '../../types'
import { getOrders, deleteOrder } from '../../api/orders'
import OrderModal from './OrderModal'
import OrderDetailModal from './OrderDetailModal'

const statusColors: Record<string, string> = {
    NEW: 'blue', CONFIRMED: 'orange', PAID: 'green',
    SHIPPED: 'purple', CANCELLED: 'red'
}

const statusLabels: Record<string, string> = {
    NEW: 'Новый', CONFIRMED: 'Подтверждён', PAID: 'Оплачен',
    SHIPPED: 'Отправлен', CANCELLED: 'Отменён'
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string | undefined>()
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [detailOrderId, setDetailOrderId] = useState<number | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = async (p = page, status = statusFilter) => {
        setLoading(true)
        try {
            const res = await getOrders({ status, page: p, size: 10 })
            setOrders(res.data.content)
            setTotal(res.data.totalElements)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load(0, undefined) }, [])

    const handleDelete = async (id: number) => {
        await deleteOrder(id)
        messageApi.success('Заказ удалён')
        load()
    }

    const columns: ColumnsType<Order> = [
        { title: '№', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Клиент', dataIndex: 'customerName', key: 'customerName' },
        {
            title: 'Статус', dataIndex: 'status', key: 'status',
            render: (v) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag>
        },
        {
            title: 'Сумма', dataIndex: 'totalPrice', key: 'totalPrice',
            render: (v) => `${v} ₽`
        },
        {
            title: 'Дата', dataIndex: 'createdAt', key: 'createdAt',
            render: (v) => new Date(v).toLocaleDateString('ru-RU')
        },
        { title: 'Примечание', dataIndex: 'notes', key: 'notes',
            render: (v) => v || '—' },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => setDetailOrderId(record.id)}>
                        Открыть
                    </Button>
                    <Popconfirm
                        title="Удалить заказ?"
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
                <Select
                    placeholder="Фильтр по статусу"
                    allowClear
                    style={{ width: 200 }}
                    onChange={(v) => { setStatusFilter(v); setPage(0); load(0, v) }}
                    options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                    Новый заказ
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    onChange: (p) => { setPage(p - 1); load(p - 1) }
                }}
            />
            <OrderModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => { setCreateModalOpen(false); load() }}
            />
            {detailOrderId && (
                <OrderDetailModal
                    orderId={detailOrderId}
                    onClose={() => { setDetailOrderId(null); load() }}
                />
            )}
        </div>
    )
}

export default OrdersPage