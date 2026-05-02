import { useEffect, useState } from 'react'
import { Descriptions, Form, InputNumber, Modal, Tag } from 'antd'
import type { Product, ProductComponent } from '../../types'
import { getBom, getMaxAssemblable } from '../../api/bom'
import { assemble } from '../../api/assembly'
import { extractErrorMessage } from '../../api/utils'
import { message } from 'antd'

interface Props {
    open: boolean
    product: Product | null
    onClose: () => void
    onSuccess: () => void
}

const AssemblyModal = ({ open, product, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm()
    const [bom, setBom] = useState<ProductComponent[]>([])
    const [maxAssemblable, setMaxAssemblable] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (open && product) {
            getBom(product.id).then(r => setBom(r.data))
            getMaxAssemblable(product.id).then(r => setMaxAssemblable(r.data.maxAssemblable))
            setQuantity(1)
            form.resetFields()
        }
    }, [open, product, form])

    const handleSubmit = async () => {
        if (!product) return
        setSubmitting(true)
        try {
            await assemble({ productId: product.id, quantity })
            messageApi.success(`Собрано ${quantity} шт. — склад обновлён`)
            onSuccess()
        } catch (e) {
            messageApi.error(extractErrorMessage(e))
        } finally {
            setSubmitting(false)
        }
    }

    const requiredComponents = bom.map(entry => ({
        name: entry.componentName,
        sku: entry.componentSku,
        required: entry.quantity * quantity,
    }))

    return (
        <Modal
            title={`Сборка: ${product?.name ?? ''}`}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Собрать"
            cancelText="Отмена"
            okButtonProps={{
                loading: submitting,
                disabled: maxAssemblable === 0 || bom.length === 0,
            }}
            destroyOnHidden
        >
            {contextHolder}
            <Form form={form} layout="vertical">
                <Form.Item label="Количество для сборки">
                    <InputNumber
                        min={1}
                        max={maxAssemblable}
                        value={quantity}
                        onChange={(v) => setQuantity(v || 1)}
                        style={{ width: '100%' }}
                        addonAfter="шт."
                    />
                </Form.Item>
            </Form>

            {bom.length === 0 ? (
                <Tag color="red">У товара нет спецификации — сборка невозможна</Tag>
            ) : (
                <>
                    <div style={{ marginBottom: 8, color: '#888', fontSize: 13 }}>
                        Максимально можно собрать:{' '}
                        <Tag color={maxAssemblable > 0 ? 'green' : 'red'}>
                            ≤ {maxAssemblable} шт.
                        </Tag>
                    </div>
                    <Descriptions
                        title="Расход компонентов"
                        size="small"
                        bordered
                        column={1}
                    >
                        {requiredComponents.map(c => (
                            <Descriptions.Item
                                key={c.sku}
                                label={`${c.name} (${c.sku})`}
                            >
                                {c.required} шт.
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                </>
            )}
        </Modal>
    )
}

export default AssemblyModal