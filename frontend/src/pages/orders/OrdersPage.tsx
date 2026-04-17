import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Popconfirm, message, Tag, Select, DatePicker } from 'antd'
import { ClearOutlined, PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { OrderListItem } from '../../types'
import { getOrders, deleteOrder } from '../../api/orders'
import OrderModal from './OrderModal'
import OrderDetailModal from './OrderDetailModal'
import { extractErrorMessage } from '../../api/utils'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../constants/orderStatus'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const OrdersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const statusParam = searchParams.get('status') ?? undefined
    const fromParam = searchParams.get('from') ?? undefined
    const toParam = searchParams.get('to') ?? undefined

    const [orders, setOrders] = useState<OrderListItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [detailOrderId, setDetailOrderId] = useState<number | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(
        fromParam && toParam
            ? [dayjs(fromParam), dayjs(toParam)]
            : null
    )

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getOrders({
                status: statusParam,
                from: fromParam,
                to: toParam,
                page,
                size: 10,
            })
            setOrders(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, statusParam, fromParam, toParam])

    useEffect(() => {
        load()
    }, [load])

    const handleDelete = async (id: number) => {
        try {
            await deleteOrder(id)
            messageApi.success('Заказ удалён')
            load()
        } catch (e) {
            messageApi.error(extractErrorMessage(e))
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
            if (value) prev.set('status', value)
            else prev.delete('status')
            prev.set('page', '1')
            return prev
        })
    }

    const handleDateChange = (
        values: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    ) => {
        setDateRange(values)
        setSearchParams(prev => {
            if (values?.[0]) prev.set('from', values[0].startOf('day').toISOString())
            else prev.delete('from')
            if (values?.[1]) prev.set('to', values[1].endOf('day').toISOString())
            else prev.delete('to')
            prev.set('page', '1')
            return prev
        })
    }

    const handleReset = () => {
        setDateRange(null)
        setSearchParams({ page: '1' })
    }

    const hasFilters = !!(statusParam || fromParam || toParam)

    const columns: ColumnsType<OrderListItem> = [
        { title: '№', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Клиент', dataIndex: 'customerName', key: 'customerName' },
        {
            title: 'Статус', dataIndex: 'status', key: 'status',
            render: (v) => <Tag color={ORDER_STATUS_COLORS[v]}>{ORDER_STATUS_LABELS[v]}</Tag>
        },
        {
            title: 'Оплата', dataIndex: 'paid', key: 'paid', width: 110,
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
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setDetailOrderId(record.id) }}>
                        Открыть
                    </Button>
                    <Popconfirm
                        title="Удалить заказ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да" cancelText="Нет"
                    >
                        <Button size="small" danger onClick={(e) => e.stopPropagation()}>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <div>
            {contextHolder}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Select
                    placeholder="Статус"
                    allowClear
                    style={{ width: 180 }}
                    value={statusParam}
                    onChange={handleStatusChange}
                    options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                />
                <RangePicker
                    value={dateRange}
                    onChange={(values) =>
                        handleDateChange(values as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)
                    }
                    format="DD.MM.YYYY"
                    placeholder={['Дата от', 'Дата до']}
                />
                {hasFilters && (
                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                        Сбросить
                    </Button>
                )}
                <div style={{ marginLeft: 'auto' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                        Новый заказ
                    </Button>
                </div>
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
                    style: { cursor: 'pointer' },
                })}
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