import { useEffect } from 'react'
import { Modal, Form, Input, message } from 'antd'
import type { Customer } from '../../types'
import { createCustomer, updateCustomer } from '../../api/customers'
import axios from "axios";

interface Props {
    open: boolean
    customer: Customer | null
    onClose: () => void
    onSuccess: () => void
}

const CustomerModal = ({ open, customer, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (open) {
            if (customer) {
                form.setFieldsValue(customer)
            } else {
                form.resetFields()
            }
        }
    }, [open, customer, form])

    const onFinish = async (values: Omit<Customer, 'id'>) => {
        try {
            if (customer) {
                await updateCustomer(customer.id, values)
                messageApi.success('Клиент обновлён')
            } else {
                await createCustomer(values)
                messageApi.success('Клиент создан')
            }
            onSuccess()
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 400) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        }
    }

    return (
        <Modal
            title={customer ? 'Редактировать клиента' : 'Новый клиент'}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Сохранить"
            cancelText="Отмена"
            destroyOnHidden
        >
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Имя" name="name" rules={[{ required: true, message: 'Введите имя' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Телефон" name="phone" rules={[{ required: true, message: 'Введите телефон' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Email" name="email">
                    <Input />
                </Form.Item>
                <Form.Item label="Telegram" name="telegram">
                    <Input />
                </Form.Item>
                <Form.Item label="Адрес" name="address">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default CustomerModal