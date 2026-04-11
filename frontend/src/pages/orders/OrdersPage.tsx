import {useState, useEffect, useCallback} from 'react'
import {Table, Button, Space, Popconfirm, message, Tag, Select} from 'antd'
import {PlusOutlined} from '@ant-design/icons'
import {useSearchParams} from 'react-router-dom'
import type {ColumnsType} from 'antd/es/table'
import type {OrderListItem} from '../../types'
import {getOrders, deleteOrder} from '../../api/orders'
import OrderModal from './OrderModal'
import OrderDetailModal from './OrderDetailModal'
import axios from 'axios'
import {ORDER_STATUS_COLORS, ORDER_STATUS_LABELS} from '../../constants/orderStatus'
import {extractErrorMessage} from "../../api/utils.ts";


const OrdersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const statusFilter = searchParams.get('status') ?? undefined

    const [orders, setOrders] = useState<OrderListItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [detailOrderId, setDetailOrderId] = useState<number | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getOrders({status: statusFilter, page, size: 10})
            setOrders(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter])

    useEffect(() => {
        load()
    }, [load])

    const handleDelete = async (id: number) => {
        try {
            await deleteOrder(id)
            messageApi.success('Заказ удалён')
            load()
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 400) {
                messageApi.error(extractErrorMessage(e))
            }
        }
    }

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', String(newPage))
            return prev
        })
    }

    const handleStatusChange = (value: string | undefined) => {
        setSearchParams(prev => {
            if (value) {
                prev.set('status', value)
            } else {
                prev.delete('status')
            }
            prev.set('page', '1')
            return prev
        })
    }

    const columns: ColumnsType<OrderListItem> = [
        {title: '№', dataIndex: 'id', key: 'id', width: 60},
        {title: 'Клиент', dataIndex: 'customerName', key: 'customerName'},
        {
            title: 'Статус', dataIndex: 'status', key: 'status',
            render: (v) => <Tag color={ORDER_STATUS_COLORS[v]}>{ORDER_STATUS_LABELS[v]}</Tag>
        },
        {
            title: 'Оплата',
            dataIndex: 'paid',
            key: 'paid',
            width: 110,
            render: (v: boolean) => (
                <Tag color={v ? 'green' : 'red'}>{v ? 'Оплачен' : 'Не оплачен'}</Tag>
            )
        },
        {
            title: 'Сумма', dataIndex: 'totalPrice', key: 'totalPrice',
            render: (v) => `${v} ₽`
        },
        {
            title: 'Дата создания', dataIndex: 'createdAt', key: 'createdAt',
            render: (v) => new Date(v).toLocaleDateString('ru-RU')
        },
        {
            title: 'Примечание', dataIndex: 'notes', key: 'notes',
            render: (v) => v || '—'
        },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setDetailOrderId(record.id)}}>
                        Открыть
                    </Button>
                    <Popconfirm
                        title="Удалить заказ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да" cancelText="Нет"
                    >
                        <Button size="small" danger onClick={(e) => e.stopPropagation()}>Удалить</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <div>
            {contextHolder}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                <Select
                    placeholder="Фильтр по статусу"
                    allowClear
                    style={{width: 200}}
                    value={statusFilter}
                    onChange={handleStatusChange}
                    options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({value, label}))}
                />
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => setCreateModalOpen(true)}>
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
                    onChange: handlePageChange
                }}
                onRow={(record) => ({
                    onClick: () => setDetailOrderId(record.id),
                    style: {cursor: 'pointer'},
                })}
            />
            <OrderModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    load()
                }}
            />
            {detailOrderId && (
                <OrderDetailModal
                    orderId={detailOrderId}
                    onClose={() => {
                        setDetailOrderId(null);
                        load()
                    }}
                />
            )}
        </div>
    )
}

export default OrdersPage