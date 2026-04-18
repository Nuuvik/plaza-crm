import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import type { ColumnsType } from 'antd/es/table'
import type { User } from '../../types'
import { getUsers } from '../../api/auth'
import UserCreateModal from './UserCreateModal'
import ChangePasswordModal from './ChangePasswordModal'

const DEFAULT_SORT_FIELD = 'id'
const DEFAULT_SORT_ORDER = 'asc'

const UsersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const sortField = searchParams.get('sortField') ?? DEFAULT_SORT_FIELD
    const sortOrder = searchParams.get('sortOrder') ?? DEFAULT_SORT_ORDER

    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [changePasswordUserId, setChangePasswordUserId] = useState<number | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getUsers({
                page,
                size: 10,
                sort: `${sortField},${sortOrder}`,
            })
            setUsers(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, sortField, sortOrder])

    useEffect(() => {
        load()
    }, [load])

    const handleTableChange: TableProps<User>['onChange'] = (pagination, _filters, sorter) => {
        const s = (Array.isArray(sorter) ? sorter[0] : sorter) as SorterResult<User>
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

    const getSortOrder = (field: string) =>
        sortField === field ? (sortOrder === 'desc' ? 'descend' : 'ascend') as 'descend' | 'ascend' : null

    const columns: ColumnsType<User> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: true,
            sortOrder: getSortOrder('id'),
        },
        {
            title: 'Логин',
            dataIndex: 'username',
            key: 'username',
            sorter: true,
            sortOrder: getSortOrder('username'),
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            sorter: true,
            sortOrder: getSortOrder('role'),
            render: (v) => (
                <Tag color={v === 'ADMIN' ? 'red' : 'blue'}>
                    {v === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                </Tag>
            ),
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
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => setChangePasswordUserId(record.id)}>
                        Сменить пароль
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                    Новый пользователь
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={users}
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
            />
            <UserCreateModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false)
                    load()
                    messageApi.success('Пользователь добавлен')
                }}
            />
            {changePasswordUserId && (
                <ChangePasswordModal
                    open={true}
                    userId={changePasswordUserId}
                    onClose={() => setChangePasswordUserId(null)}
                />
            )}
        </div>
    )
}

export default UsersPage