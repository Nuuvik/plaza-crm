import { useEffect } from 'react'
import { Form, Input, InputNumber, Modal } from 'antd'
import type { Component } from '../../types'
import { createComponent, updateComponent } from '../../api/components'
import { extractErrorMessage, setFormServerErrors } from '../../api/utils'
import { message } from 'antd'

interface Props {
    open: boolean
    component: Component | null
    onClose: () => void
    onSuccess: () => void
}

const ComponentModal = ({ open, component, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (open) {
            if (component) {
                form.setFieldsValue(component)
            } else {
                form.resetFields()
            }
        }
    }, [open, component, form])

    const onFinish = async (values: { sku: string; name: string; stockQuantity: number }) => {
        try {
            if (component) {
                await updateComponent(component.id, values)
                messageApi.success('Компонент обновлён')
            } else {
                await createComponent(values)
                messageApi.success('Компонент создан')
            }
            onSuccess()
        } catch (e: unknown) {
            if (!setFormServerErrors(form, e)) {
                messageApi.error(extractErrorMessage(e))
            }
        }
    }

    return (
        <Modal
            title={component ? 'Редактировать компонент' : 'Новый компонент'}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Сохранить"
            cancelText="Отмена"
            destroyOnHidden
        >
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Артикул"
                    name="sku"
                    rules={[
                        { required: true, message: 'Введите артикул' },
                        { max: 50, message: 'Не более 50 символов' },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Название"
                    name="name"
                    rules={[{ required: true, message: 'Введите название' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Начальный остаток"
                    name="stockQuantity"
                    rules={[
                        { required: true, message: 'Введите остаток' },
                        { type: 'number', min: 0, message: 'Не может быть отрицательным' },
                    ]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="шт." />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ComponentModal