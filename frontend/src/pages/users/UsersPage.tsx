import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { User } from '../../types'
import { getUsers } from '../../api/auth'
import UserCreateModal from './UserCreateModal'
import ChangePasswordModal from './ChangePasswordModal'

const UsersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1

    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [changePasswordUserId, setChangePasswordUserId] = useState<number | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getUsers({ page, size: 10 })
            setUsers(res.data.content)
            setTotal(res.data.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        load()
    }, [load])

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', String(newPage))
            return prev
        })
    }

    const columns: ColumnsType<User> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Логин', dataIndex: 'username', key: 'username' },
        {
            title: 'Роль', dataIndex: 'role', key: 'role',
            render: (v) => (
                <Tag color={v === 'ADMIN' ? 'red' : 'blue'}>
                    {v === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                </Tag>
            )
        },
        {
            title: 'Дата создания', dataIndex: 'createdAt', key: 'createdAt',
            render: (v) => new Date(v).toLocaleDateString('ru-RU')
        },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => setChangePasswordUserId(record.id)}>
                        Сменить пароль
                    </Button>
                </Space>
            )
        }
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
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    onChange: handlePageChange
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