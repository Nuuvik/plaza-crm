import { Form, InputNumber, Modal, message } from 'antd'
import type { Component } from '../../types'
import { adjustStock } from '../../api/components'
import { extractErrorMessage } from '../../api/utils'

interface Props {
    open: boolean
    component: Component | null
    onClose: () => void
    onSuccess: () => void
}

const StockAdjustModal = ({ open, component, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

    const onFinish = async (values: { quantity: number }) => {
        if (!component) return
        try {
            await adjustStock(component.id, values.quantity)
            messageApi.success(`Добавлено ${values.quantity} шт. на склад`)
            form.resetFields()
            onSuccess()
        } catch (e: unknown) {
            messageApi.error(extractErrorMessage(e))
        }
    }

    return (
        <Modal
            title={`Приход: ${component?.name ?? ''}`}
            open={open}
            onCancel={() => { form.resetFields(); onClose() }}
            onOk={() => form.submit()}
            okText="Принять"
            cancelText="Отмена"
            destroyOnHidden
        >
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Количество"
                    name="quantity"
                    rules={[
                        { required: true, message: 'Введите количество' },
                        { type: 'number', min: 1, message: 'Минимум 1 шт.' },
                    ]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} addonAfter="шт." />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default StockAdjustModal