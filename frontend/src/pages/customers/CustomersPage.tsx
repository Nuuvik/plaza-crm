import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Popconfirm, message, Tag } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Customer } from '../../types'
import { getCustomers, deleteCustomer } from '../../api/customers'
import CustomerModal from './CustomerModal'
import CustomerOrdersModal from './CustomerOrdersModal'
import { useDebouncedCallback } from 'use-debounce'

const CustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [messageApi, contextHolder] = message.useMessage()
    const [ordersCustomer, setOrdersCustomer] = useState<Customer | null>(null)

    const load = async (p = page, s = search) => {
        setLoading(true)
        try {
            const res = await getCustomers({ name: s || undefined, page: p, size: 10 })
            setCustomers(res.data.content)
            setTotal(res.data.totalElements)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (id: number) => {
        await deleteCustomer(id)
        messageApi.success('Клиент удалён')
        load()
    }

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer)
        setModalOpen(true)
    }

    const handleCreate = () => {
        setEditingCustomer(null)
        setModalOpen(true)
    }

    const handleSearch = useDebouncedCallback((val: string) => {
        setPage(0)
        load(0, val)
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
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        handleSearch(e.target.value)
                    }}
                    allowClear
                    onClear={() => {
                        setSearch('')
                        handleSearch('')
                    }}
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
                    onChange: (p) => { setPage(p - 1); load(p - 1) }
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