import { useCallback, useEffect, useState } from 'react'
import { Button, Input, message, Popconfirm, Space, Table, Tag } from 'antd'
import { ClearOutlined, PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { Customer } from '../../types'
import { deleteCustomer, getCustomers } from '../../api/customers'
import CustomerModal from './CustomerModal'
import CustomerOrdersModal from './CustomerOrdersModal'
import { useDebouncedCallback } from 'use-debounce'
import { extractErrorMessage } from '../../api/utils'

const CustomersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get('page') ?? '1') - 1
    const nameParam = searchParams.get('name') ?? ''
    const phoneParam = searchParams.get('phone') ?? ''
    const emailParam = searchParams.get('email') ?? ''

    const [customers, setCustomers] = useState<Customer[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [messageApi, contextHolder] = message.useMessage()
    const [ordersCustomer, setOrdersCustomer] = useState<Customer | null>(null)

    const [nameInput, setNameInput] = useState(nameParam)
    const [phoneInput, setPhoneInput] = useState(phoneParam)
    const [emailInput, setEmailInput] = useState(emailParam)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getCustomers({
                name: nameParam || undefined,
                phone: phoneParam || undefined,
                email: emailParam || undefined,
                page,
                size: 10,
            })
            setCustomers(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, nameParam, phoneParam, emailParam])

    useEffect(() => {
        setNameInput(nameParam)
        setPhoneInput(phoneParam)
        setEmailInput(emailParam)
    }, [nameParam, phoneParam, emailParam])

    useEffect(() => {
        load()
    }, [load])

    const updateParam = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value) prev.set(key, value)
            else prev.delete(key)
            prev.set('page', '1')
            return prev
        })
    }

    const handleNameChange = useDebouncedCallback((v: string) => updateParam('name', v), 300)
    const handlePhoneChange = useDebouncedCallback((v: string) => updateParam('phone', v), 300)
    const handleEmailChange = useDebouncedCallback((v: string) => updateParam('email', v), 300)

    const handleReset = () => {
        setNameInput('')
        setPhoneInput('')
        setEmailInput('')
        setSearchParams({ page: '1' })
    }

    const hasFilters = !!(nameParam || phoneParam || emailParam)

    const handleDelete = async (id: number) => {
        try {
            await deleteCustomer(id)
            messageApi.success('Клиент удалён')
            load()
        } catch (e) {
            messageApi.error(extractErrorMessage(e))
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

    const columns: ColumnsType<Customer> = [
        { title: 'Имя', dataIndex: 'name', key: 'name' },
        { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email', render: (v) => v || '—' },
        {
            title: 'Telegram', dataIndex: 'telegram', key: 'telegram',
            render: (v) => v ? <Tag color="blue">{v}</Tag> : '—'
        },
        {
            title: 'Адрес', dataIndex: 'address', key: 'address',
            render: (v) => v || '—'
        },
        {
            title: 'Действия', key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setOrdersCustomer(record) }}>
                        Заказы
                    </Button>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); handleEdit(record) }}>
                        Изменить
                    </Button>
                    <Popconfirm
                        title="Удалить клиента?"
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
                <Input
                    placeholder="Имя"
                    style={{ width: 200 }}
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); handleNameChange(e.target.value) }}
                    allowClear
                    onClear={() => { setNameInput(''); handleNameChange('') }}
                />
                <Input
                    placeholder="Телефон"
                    style={{ width: 180 }}
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value); handlePhoneChange(e.target.value) }}
                    allowClear
                    onClear={() => { setPhoneInput(''); handlePhoneChange('') }}
                />
                <Input
                    placeholder="Email"
                    style={{ width: 200 }}
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); handleEmailChange(e.target.value) }}
                    allowClear
                    onClear={() => { setEmailInput(''); handleEmailChange('') }}
                />
                {hasFilters && (
                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                        Сбросить
                    </Button>
                )}
                <div style={{ marginLeft: 'auto' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Новый клиент
                    </Button>
                </div>
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
                onRow={(record) => ({
                    onClick: () => handleEdit(record),
                    style: { cursor: 'pointer' },
                })}
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