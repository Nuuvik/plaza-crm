import { Modal, Form, Input, message } from 'antd'
import { changePasswordById, changeOwnPassword } from '../../api/auth'
import axios from 'axios'

interface Props {
    open: boolean
    onClose: () => void
    // если передан userId — меняем чужой пароль (admin), иначе свой
    userId?: number
}

const ChangePasswordModal = ({ open, onClose, userId }: Props) => {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

    const isOwnPassword = !userId

    const onFinish = async (values: { currentPassword?: string; newPassword: string }) => {
        try {
            if (isOwnPassword) {
                await changeOwnPassword({
                    currentPassword: values.currentPassword!,
                    newPassword: values.newPassword
                })
            } else {
                await changePasswordById(userId!, { newPassword: values.newPassword })
            }
            messageApi.success('Пароль изменён')
            form.resetFields()
            onClose()
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 400) {
                messageApi.error(e.response?.data?.message || 'Ошибка')
            }
        }
    }

    return (
        <Modal
            title={isOwnPassword ? 'Сменить свой пароль' : 'Сменить пароль пользователя'}
            open={open}
            onCancel={() => {
                form.resetFields()
                onClose()
            }}
            onOk={() => form.submit()}
            okText="Сохранить"
            cancelText="Отмена"
            destroyOnHidden
        >
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={onFinish}>
                {isOwnPassword && (
                    <Form.Item
                        label="Текущий пароль"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Введите текущий пароль' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                )}
                <Form.Item
                    label="Новый пароль"
                    name="newPassword"
                    rules={[{ required: true, message: 'Введите новый пароль' }, { min: 6, message: 'Минимум 6 символов' }]}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ChangePasswordModal