import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, Space, Popconfirm, message, Tag } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { Customer } from '../../types'
import { getCustomers, deleteCustomer } from '../../api/customers'
import CustomerModal from './CustomerModal'
import CustomerOrdersModal from './CustomerOrdersModal'
import { useDebouncedCallback } from 'use-debounce'
import axios from 'axios'

const CustomersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const search = searchParams.get('name') ?? ''

    const [customers, setCustomers] = useState<Customer[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [messageApi, contextHolder] = message.useMessage()
    const [ordersCustomer, setOrdersCustomer] = useState<Customer | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getCustomers({ name: search || undefined, page, size: 10 })
            setCustomers(res.data.content)
            setTotal(res.data.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => {
        load()
    }, [load])

    const handleDelete = async (id: number) => {
        try {
            await deleteCustomer(id)
            messageApi.success('Клиент удалён')
            load()
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 400) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        }
    }

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer)
        setModalOpen(true)
    }

    const handleCreate = () => {
        setEditingCustomer(null)
        setModalOpen(true)
    }

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', String(newPage))
            return prev
        })
    }

    const handleSearch = useDebouncedCallback((val: string) => {
        setSearchParams(prev => {
            if (val) {
                prev.set('name', val)
            } else {
                prev.delete('name')
            }
            prev.set('page', '1')
            return prev
        })
    }, 300)

    const columns: ColumnsType<Customer> = [
        { title: 'Имя', dataIndex: 'name', key: 'name' },
        { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Telegram', dataIndex: 'telegram', key: 'telegram',
            render: (v) => v ? <Tag color="blue">{v}</Tag> : '—' },
        { title: 'Адрес', dataIndex: 'address', key: 'address',
            render: (v) => v || '—' },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => setOrdersCustomer(record)}>
                        Заказы
                    </Button>
                    <Button size="small" onClick={() => handleEdit(record)}>Изменить</Button>
                    <Popconfirm
                        title="Удалить клиента?"
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
                <Input
                    placeholder="Поиск по имени"
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    defaultValue={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                    onClear={() => handleSearch('')}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Новый клиент
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={customers}
                rowKey="id"
                loading={loading}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    onChange: handlePageChange
                }}
            />
            <CustomerModal
                open={modalOpen}
                customer={editingCustomer}
                onClose={() => setModalOpen(false)}
                onSuccess={() => { setModalOpen(false); load() }}
            />
            {ordersCustomer && (
                <CustomerOrdersModal
                    customerId={ordersCustomer.id}
                    customerName={ordersCustomer.name}
                    onClose={() => setOrdersCustomer(null)}
                />
            )}
        </div>
    )
}

export default CustomersPage