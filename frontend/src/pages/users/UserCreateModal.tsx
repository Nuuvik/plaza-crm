import { Modal, Form, Input, Select, message } from 'antd'
import { registerUser } from '../../api/auth'
import { extractErrorMessage, setFormServerErrors } from '../../api/utils'

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const UserCreateModal = ({ open, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

    const onFinish = async (values: { username: string; password: string; role: 'ADMIN' | 'MANAGER' | 'WAREHOUSE' }) => {
        try {
            await registerUser(values)
            messageApi.success('Пользователь создан')
            form.resetFields()
            onSuccess()
        } catch (e: unknown) {
            if (!setFormServerErrors(form, e)) {
                messageApi.error(extractErrorMessage(e))
            }
        }
    }

    return (
        <Modal
            title="Новый пользователь"
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Создать"
            cancelText="Отмена"
            destroyOnHidden
        >
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Логин" name="username"
                    rules={[
                        { required: true, message: 'Введите логин' },
                        { min: 2, message: 'Минимум 2 символа' },
                        { max: 50, message: 'Не более 50 символов' },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль' }, { min: 6, message: 'Минимум 6 символов' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Роль"
                    name="role"
                    rules={[{ required: true, message: 'Выберите роль' }]}
                >
                    <Select options={[
                        { value: 'ADMIN', label: 'Администратор' },
                        { value: 'MANAGER', label: 'Менеджер' },
                        { value: 'WAREHOUSE', label: 'Работник склада' },
                    ]} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UserCreateModal