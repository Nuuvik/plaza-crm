import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Popconfirm, message, Tag, Select, DatePicker } from 'antd'
import { ClearOutlined, PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import type { ColumnsType } from 'antd/es/table'
import type { OrderListItem } from '../../types'
import { getOrders, deleteOrder } from '../../api/orders'
import OrderModal from './OrderModal'
import OrderDetailModal from './OrderDetailModal'
import { extractErrorMessage } from '../../api/utils'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../constants/orderStatus'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const DEFAULT_SORT_FIELD = 'createdAt'
const DEFAULT_SORT_ORDER = 'desc'

const OrdersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const statusParam = searchParams.get('status') ?? undefined
    const fromParam = searchParams.get('from') ?? undefined
    const toParam = searchParams.get('to') ?? undefined
    const sortField = searchParams.get('sortField') ?? DEFAULT_SORT_FIELD
    const sortOrder = searchParams.get('sortOrder') ?? DEFAULT_SORT_ORDER

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
                sort: `${sortField},${sortOrder}`,
            })
            setOrders(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, statusParam, fromParam, toParam, sortField, sortOrder])

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

    const handleTableChange: TableProps<OrderListItem>['onChange'] = (pagination, _filters, sorter) => {
        const s = (Array.isArray(sorter) ? sorter[0] : sorter) as SorterResult<OrderListItem>
        const newField = s?.order ? (s.columnKey as string) ?? sortField : sortField
        const newOrder = s?.order
            ? s.order === 'descend' ? 'desc' : 'asc'
            : sortOrder === 'desc' ? 'asc' : 'desc'   // null-клик → тоглим

        setSearchParams(prev => {
            prev.set('page', String(pagination.current ?? 1))
            prev.set('sortField', newField)
            prev.set('sortOrder', newOrder)
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

    const getSortOrder = (field: string) =>
        sortField === field ? (sortOrder === 'desc' ? 'descend' : 'ascend') as 'descend' | 'ascend' : null

    const columns: ColumnsType<OrderListItem> = [
        {
            title: '№',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: true,
            sortOrder: getSortOrder('id'),
        },
        {
            title: 'Клиент',
            dataIndex: 'customerName',
            key: 'customer.name',
            sorter: true,
            sortOrder: getSortOrder('customer.name'),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            sortOrder: getSortOrder('status'),
            render: (v) => <Tag color={ORDER_STATUS_COLORS[v]}>{ORDER_STATUS_LABELS[v]}</Tag>,
        },
        {
            title: 'Оплата',
            dataIndex: 'paid',
            key: 'isPaid',
            width: 110,
            sorter: true,
            sortOrder: getSortOrder('isPaid'),
            render: (v: boolean) => (
                <Tag color={v ? 'green' : 'red'}>{v ? 'Оплачен' : 'Не оплачен'}</Tag>
            ),
        },
        {
            title: 'Сумма',
            dataIndex: 'totalPrice',
            // backend entity field is totalAmount
            key: 'totalAmount',
            sorter: true,
            sortOrder: getSortOrder('totalAmount'),
            render: (v) => `${v} ₽`,
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            sortOrder: getSortOrder('createdAt'),
            render: (v) => new Date(v).toLocaleDateString('ru-RU'),
        },
        {
            title: 'Примечание',
            dataIndex: 'notes',
            key: 'notes',
            sorter: true,
            sortOrder: getSortOrder('notes'),
            render: (v) => v || '—',
        },
        {
            title: 'Действия',
            key: 'actions',
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
            ),
        },
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
                    allowEmpty={[true, true]}
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
                onChange={handleTableChange}
                showSorterTooltip={false}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    showTotal: (t) => `Всего: ${t}`,
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