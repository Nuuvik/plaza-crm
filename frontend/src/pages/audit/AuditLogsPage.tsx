import {useCallback, useEffect, useState} from 'react'
import {Button, DatePicker, Form, Input, Select, Space, Table, Tag} from 'antd'
import {ClearOutlined, SearchOutlined} from '@ant-design/icons'
import {useSearchParams} from 'react-router-dom'
import type {ColumnsType} from 'antd/es/table'
import {type AuditLog, getAuditLogs} from '../../api/audit'
import dayjs from 'dayjs'

const ENTITY_TYPE_COLORS: Record<string, string> = {
    USER: '#6366f1',
    CUSTOMER: '#06b6d4',
    ORDER: '#f97316',
    ORDERITEM: '#eab308',
    PRODUCT: '#a855f7',
}

const ACTION_COLORS: Record<string, string> = {
    CREATE: '#22c55e',
    UPDATE: '#3b82f6',
    DELETE: '#ef4444',
    LOGIN: '#6366f1',
    REGISTER: '#06b6d4',
    CONFIRM: '#84cc16',
    CANCEL: '#f97316',
    SHIP: '#a855f7',
    COMPLETE: '#10b981',
    MARK_PAID: '#f59e0b',
    MARK_UNPAID: '#f43f5e',
    CHANGE_PASSWORD: '#ec4899',
    ADMIN_CHANGE_PASSWORD: '#d946ef',
    ADD: '#14b8a6',
    UPDATE_INFO: '#60a5fa',
    UPDATE_NOTES: '#818cf8',
    PAY: '#fbbf24',
    SYSTEM_INIT: '#94a3b8',
    ARCHIVE: '#78716c',
    UNARCHIVE: '#0ea5e9',
}

const ENTITY_TYPE_OPTIONS = [
    {value: 'USER', label: 'Пользователи'},
    {value: 'CUSTOMER', label: 'Клиенты'},
    {value: 'ORDER', label: 'Заказы'},
    {value: 'ORDERITEM', label: 'Позиции заказов'},
    {value: 'PRODUCT', label: 'Товары'},
]

const {RangePicker} = DatePicker

const AuditLogsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1

    const [logs, setLogs] = useState<AuditLog[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    const [entityType, setEntityType] = useState<string | undefined>(
        searchParams.get('entityType') ?? undefined
    )
    const [username, setUsername] = useState(searchParams.get('username') ?? '')
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

    // Светлая тема: solid фон, белый текст
    // Тёмная тема: прозрачный фон, цветной текст и рамка (ghost-стиль)
    const tagStyle = (color: string): React.CSSProperties => ({
        backgroundColor: color + '22',
        color,
        border: `1px solid ${color}88`,
    })

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const from = dateRange?.[0]?.toISOString()
            const to = dateRange?.[1]?.toISOString()
            const res = await getAuditLogs({
                entityType: entityType || undefined,
                username: username || undefined,
                from,
                to,
                page,
                size: 20,
            })
            setLogs(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, entityType, username, dateRange])

    useEffect(() => {
        load()
    }, [load])

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', String(newPage))
            return prev
        })
    }

    const handleSearch = () => {
        setSearchParams(prev => {
            prev.set('page', '1')
            if (entityType) prev.set('entityType', entityType)
            else prev.delete('entityType')
            if (username) prev.set('username', username)
            else prev.delete('username')
            return prev
        })
    }

    const handleReset = () => {
        setEntityType(undefined)
        setUsername('')
        setDateRange(null)
        setSearchParams({page: '1'})
    }

    const columns: ColumnsType<AuditLog> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
        },
        {
            title: 'Сущность',
            dataIndex: 'entityType',
            key: 'entityType',
            width: 140,
            render: (v: string) => (
                <Tag style={tagStyle(ENTITY_TYPE_COLORS[v] ?? '#94a3b8')}>{v}</Tag>
            ),
        },
        {
            title: 'ID записи',
            dataIndex: 'entityId',
            key: 'entityId',
            width: 90,
        },
        {
            title: 'Действие',
            dataIndex: 'action',
            key: 'action',
            width: 200,
            render: (v: string) => (
                <Tag style={tagStyle(ACTION_COLORS[v] ?? '#94a3b8')}>{v}</Tag>
            ),
        },
        {
            title: 'Пользователь',
            dataIndex: 'username',
            key: 'username',
            width: 150,
        },
        {
            title: 'Дата и время',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v: string) =>
                new Date(v).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }),
        },
    ]

    return (
        <div>
            <div style={{marginBottom: 16}}>
                <Form layout="inline" onFinish={handleSearch}>
                    <Form.Item label="Тип сущности">
                        <Select
                            allowClear
                            placeholder="Все"
                            value={entityType}
                            onChange={setEntityType}
                            style={{width: 180}}
                            options={ENTITY_TYPE_OPTIONS}
                        />
                    </Form.Item>
                    <Form.Item label="Пользователь">
                        <Input
                            placeholder="Логин"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{width: 160}}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label="Период">
                        <RangePicker
                            showTime
                            format="DD.MM.YYYY HH:mm"
                            allowEmpty={[true, true]}
                            value={dateRange}
                            onChange={val =>
                                setDateRange(val as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)
                            }
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SearchOutlined/>}
                                onClick={handleSearch}
                            >
                                Найти
                            </Button>
                            <Button icon={<ClearOutlined/>} onClick={handleReset}>
                                Сбросить
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <Table
                columns={columns}
                dataSource={logs}
                rowKey="id"
                loading={loading}
                size="small"
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 20,
                    showSizeChanger: false,
                    showTotal: (t) => `Всего: ${t}`,
                    onChange: handlePageChange,
                }}
            />
        </div>
    )
}

export default AuditLogsPage