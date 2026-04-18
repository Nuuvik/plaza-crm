import { useState, useEffect, useCallback } from 'react'
import { Table, Select, Input, Button, Space, Tag, DatePicker, Form } from 'antd'
import { SearchOutlined, ClearOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { getAuditLogs, type AuditLog } from '../../api/audit'
import dayjs from 'dayjs'

const ENTITY_TYPE_COLORS: Record<string, string> = {
    USER: 'blue',
    CUSTOMER: 'green',
    ORDER: 'orange',
    ORDERITEM: 'gold',
    PRODUCT: 'purple',
}

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'success',
    UPDATE: 'processing',
    DELETE: 'error',
    LOGIN: 'blue',
    REGISTER: 'cyan',
    CONFIRM: 'green',
    CANCEL: 'red',
    PAY: 'gold',
    SHIP: 'purple',
    CHANGE_PASSWORD: 'warning',
    ADMIN_CHANGE_PASSWORD: 'warning',
    ADD: 'success',
    UPDATE_NOTES: 'processing',
    SYSTEM_INIT: 'default',
    COMPLETE: 'success',
    MARK_PAID: 'gold',
    MARK_UNPAID: 'error',
}

const ENTITY_TYPE_OPTIONS = [
    { value: 'USER', label: 'Пользователи' },
    { value: 'CUSTOMER', label: 'Клиенты' },
    { value: 'ORDER', label: 'Заказы' },
    { value: 'ORDERITEM', label: 'Позиции заказов' },
    { value: 'PRODUCT', label: 'Товары' },
]

const { RangePicker } = DatePicker

const AuditLogsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1

    const [logs, setLogs] = useState<AuditLog[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    // Фильтры
    const [entityType, setEntityType] = useState<string | undefined>(
        searchParams.get('entityType') ?? undefined
    )
    const [username, setUsername] = useState(searchParams.get('username') ?? '')
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

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
        setSearchParams({ page: '1' })
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
            width: 130,
            render: (v: string) => (
                <Tag color={ENTITY_TYPE_COLORS[v] ?? 'default'}>{v}</Tag>
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
            width: 180,
            render: (v: string) => (
                <Tag color={ACTION_COLORS[v] ?? 'default'}>{v}</Tag>
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
            <div style={{ marginBottom: 16 }}>
                <Form layout="inline" onFinish={handleSearch}>
                    <Form.Item label="Тип сущности">
                        <Select
                            allowClear
                            placeholder="Все"
                            value={entityType}
                            onChange={setEntityType}
                            style={{ width: 180 }}
                            options={ENTITY_TYPE_OPTIONS}
                        />
                    </Form.Item>
                    <Form.Item label="Пользователь">
                        <Input
                            placeholder="Логин"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: 160 }}
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
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                            >
                                Найти
                            </Button>
                            <Button icon={<ClearOutlined />} onClick={handleReset}>
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