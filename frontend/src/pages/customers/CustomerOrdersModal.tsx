import {useState, useEffect, useCallback} from 'react'
import { Modal, Table, Tag } from 'antd'
import type {OrderListItem} from '../../types'
import { getOrdersByCustomer } from '../../api/orders'
import type { ColumnsType } from 'antd/es/table'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../constants/orderStatus'

interface Props {
    customerId: number
    customerName: string
    onClose: () => void
}

const CustomerOrdersModal = ({ customerId, customerName, onClose }: Props) => {
    const [orders, setOrders] = useState<OrderListItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getOrdersByCustomer(customerId, { page, size: 10 })
            setOrders(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [customerId, page])

    useEffect(() => {
        load()
    }, [load])

    const columns: ColumnsType<OrderListItem> = [
        { title: '№', dataIndex: 'id', key: 'id', width: 60 },
        {
            title: 'Статус', dataIndex: 'status', key: 'status',
            render: (v) => <Tag color={ORDER_STATUS_COLORS[v]}>{ORDER_STATUS_LABELS[v]}</Tag>
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
    ]

    return (
        <Modal
            title={`Заказы клиента: ${customerName}`}
            open={true}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    onChange: (p) => setPage(p - 1)
                }}
            />
        </Modal>
    )
}

export default CustomerOrdersModal