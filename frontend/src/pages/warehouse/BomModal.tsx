import { useCallback, useEffect, useState } from 'react'
import { Button, InputNumber, Modal, Popconfirm, Select, Table, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { Component, ProductComponent } from '../../types'
import { getBom, addOrUpdateBomEntry, removeBomEntry } from '../../api/bom'
import { getComponents } from '../../api/components'
import { extractErrorMessage } from '../../api/utils'
import { message } from 'antd'

interface Props {
    open: boolean
    productId: number
    productName: string
    onClose: () => void
}

const BomModal = ({ open, productId, productName, onClose }: Props) => {
    const [bom, setBom] = useState<ProductComponent[]>([])
    const [components, setComponents] = useState<Component[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const [editingQuantities, setEditingQuantities] = useState<Record<number, number>>({})


    const loadBom = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getBom(productId)
            setBom(res.data)
            // инициализируем количества
            const quantities: Record<number, number> = {}
            res.data.forEach(entry => {
                quantities[entry.componentId] = entry.quantity
            })
            setEditingQuantities(quantities)
        } finally {
            setLoading(false)
        }
    }, [productId])

    useEffect(() => {
        if (open) {
            loadBom()
            getComponents({ size: 200 }).then(r => setComponents(r.data.content))
        }
    }, [open, loadBom])

    const handleAdd = async () => {
        if (!selectedComponentId) return
        setSubmitting(true)
        try {
            await addOrUpdateBomEntry(productId, {
                componentId: selectedComponentId,
                quantity,
            })
            messageApi.success('Компонент добавлен в спецификацию')
            setSelectedComponentId(null)
            setQuantity(1)
            loadBom()
        } catch (e) {
            messageApi.error(extractErrorMessage(e))
        } finally {
            setSubmitting(false)
        }
    }

    const handleRemove = async (componentId: number) => {
        try {
            await removeBomEntry(productId, componentId)
            messageApi.success('Компонент удалён из спецификации')
            loadBom()
        } catch (e) {
            messageApi.error(extractErrorMessage(e))
        }
    }

    const handleQuantityChange = async (componentId: number, newQuantity: number) => {
        try {
            await addOrUpdateBomEntry(productId, { componentId, quantity: newQuantity })
            messageApi.success('Количество обновлено')
            loadBom()
        } catch (e) {
            messageApi.error(extractErrorMessage(e))
        }
    }

    const usedComponentIds = new Set(bom.map(b => b.componentId))

    const columns = [
        {
            title: 'Артикул',
            dataIndex: 'componentSku',
            key: 'componentSku',
            render: (v: string) => <Tag color="blue">{v}</Tag>,
        },
        {
            title: 'Название',
            dataIndex: 'componentName',
            key: 'componentName',
        },
        {
            title: 'Количество',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (_: number, record: ProductComponent) => (
                <InputNumber
                    min={1}
                    value={editingQuantities[record.componentId] ?? record.quantity}
                    onChange={(v) => {
                        setEditingQuantities(prev => ({
                            ...prev,
                            [record.componentId]: v || 1,
                        }))
                    }}
                    onBlur={() => {
                        const newQty = editingQuantities[record.componentId]
                        if (newQty && newQty !== record.quantity) {
                            handleQuantityChange(record.componentId, newQty)
                        }
                    }}
                    style={{ width: 90 }}
                    addonAfter="шт."
                />
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 60,
            render: (_: unknown, record: ProductComponent) => (
                <Popconfirm
                    title="Удалить из спецификации?"
                    onConfirm={() => handleRemove(record.componentId)}
                    okText="Да"
                    cancelText="Нет"
                >
                    <Button size="small" danger>✕</Button>
                </Popconfirm>
            ),
        },
    ]

    return (
        <Modal
            title={`Спецификация: ${productName}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            destroyOnHidden
        >
            {contextHolder}
            <Table
                columns={columns}
                dataSource={bom}
                rowKey="componentId"
                loading={loading}
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
                locale={{ emptyText: 'Спецификация пуста' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
                <Select
                    showSearch
                    placeholder="Выберите компонент"
                    value={selectedComponentId}
                    onChange={setSelectedComponentId}
                    style={{ flex: 1 }}
                    filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    options={components
                        .filter(c => !usedComponentIds.has(c.id))
                        .map(c => ({
                            value: c.id,
                            label: `${c.name} (${c.sku})`,
                        }))
                    }
                />
                <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(v) => setQuantity(v || 1)}
                    style={{ width: 90 }}
                    addonAfter="шт."
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    disabled={!selectedComponentId || submitting}
                    loading={submitting}
                >
                    Добавить
                </Button>
            </div>
        </Modal>
    )
}

export default BomModal