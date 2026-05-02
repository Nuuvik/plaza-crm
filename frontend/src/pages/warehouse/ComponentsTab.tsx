import { useCallback, useEffect, useState } from 'react'
import { Button, Input, message, Popconfirm, Space, Table, Tag } from 'antd'
import { ClearOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Component } from '../../types'
import { deleteComponent, getComponents } from '../../api/components'
import ComponentModal from './ComponentModal'
import StockAdjustModal from './StockAdjustModal'
import { useDebouncedCallback } from 'use-debounce'
import { extractErrorMessage } from '../../api/utils'
import {getMe} from "../../api/auth.ts";

const ComponentsTab = () => {
    const [components, setComponents] = useState<Component[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [nameInput, setNameInput] = useState('')
    const [skuInput, setSkuInput] = useState('')
    const [nameFilter, setNameFilter] = useState('')
    const [skuFilter, setSkuFilter] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingComponent, setEditingComponent] = useState<Component | null>(null)
    const [adjustComponent, setAdjustComponent] = useState<Component | null>(null)
    const [messageApi, contextHolder] = message.useMessage()
    const [isAdmin, setIsAdmin] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getComponents({
                name: nameFilter || undefined,
                sku: skuFilter || undefined,
                page,
                size: 10,
            })
            setComponents(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page, nameFilter, skuFilter])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        getMe().then(r => setIsAdmin(r.data.role === 'ADMIN'))
    }, [])

    const handleNameChange = useDebouncedCallback((v: string) => {
        setNameFilter(v)
        setPage(0)
    }, 300)

    const handleSkuChange = useDebouncedCallback((v: string) => {
        setSkuFilter(v)
        setPage(0)
    }, 300)

    const handleReset = () => {
        setNameInput('')
        setSkuInput('')
        setNameFilter('')
        setSkuFilter('')
        setPage(0)
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteComponent(id)
            messageApi.success('Компонент удалён')
            load()
        } catch (e) {
            messageApi.error(extractErrorMessage(e))
        }
    }

    const hasFilters = !!(nameFilter || skuFilter)

    const columns: ColumnsType<Component> = [
        {
            title: 'Артикул',
            dataIndex: 'sku',
            key: 'sku',
            render: (v) => <Tag color="blue">{v}</Tag>,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Остаток',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            render: (v) => (
                <Tag color={v > 0 ? 'green' : 'red'}>{v} шт.</Tag>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {/* приход — все роли */}
                    <Button
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation()
                            setAdjustComponent(record)
                        }}
                    >
                        Приход
                    </Button>

                    {/* изменить и удалить — только ADMIN */}
                    {isAdmin && (
                        <>
                            <Button
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingComponent(record)
                                    setModalOpen(true)
                                }}
                            >
                                Изменить
                            </Button>
                            <Popconfirm
                                title="Удалить компонент?"
                                description="Компонент будет удалён если не используется в спецификациях."
                                onConfirm={(e) => { e?.stopPropagation(); handleDelete(record.id) }}
                                okText="Да"
                                cancelText="Нет"
                            >
                                <Button
                                    size="small"
                                    danger
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Удалить
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <div>
            {contextHolder}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Input
                    placeholder="Название"
                    style={{ width: 200 }}
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); handleNameChange(e.target.value) }}
                    allowClear
                    onClear={() => { setNameInput(''); handleNameChange('') }}
                />
                <Input
                    placeholder="Артикул"
                    style={{ width: 160 }}
                    value={skuInput}
                    onChange={(e) => { setSkuInput(e.target.value); handleSkuChange(e.target.value) }}
                    allowClear
                    onClear={() => { setSkuInput(''); handleSkuChange('') }}
                />
                {hasFilters && (
                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                        Сбросить
                    </Button>
                )}
                <div style={{ marginLeft: 'auto' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => { setEditingComponent(null); setModalOpen(true) }}
                    >
                        Новый компонент
                    </Button>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={components}
                rowKey="id"
                loading={loading}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    showTotal: (t) => `Всего: ${t}`,
                    onChange: (p) => setPage(p - 1),
                }}
                onRow={(record) => ({
                    onClick: isAdmin ? () => { setEditingComponent(record); setModalOpen(true) } : undefined,
                    style: { cursor: isAdmin ? 'pointer' : 'default' },
                })}
            />
            <ComponentModal
                open={modalOpen}
                component={editingComponent}
                onClose={() => setModalOpen(false)}
                onSuccess={() => { setModalOpen(false); load() }}
            />
            <StockAdjustModal
                open={adjustComponent !== null}
                component={adjustComponent}
                onClose={() => setAdjustComponent(null)}
                onSuccess={() => { setAdjustComponent(null); load() }}
            />
        </div>
    )
}

export default ComponentsTab