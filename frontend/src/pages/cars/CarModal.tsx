import { useEffect } from 'react'
import { Form, Input, Modal } from 'antd'
import type { Car } from '../../types'

interface Props {
    open: boolean
    car: Car | null
    onClose: () => void
    onSubmit: (values: { brand: string; model: string }) => Promise<void>
}

const CarModal = ({ open, car, onClose, onSubmit }: Props) => {
    const [form] = Form.useForm()

    useEffect(() => {
        if (open) {
            if (car) {
                form.setFieldsValue(car)
            } else {
                form.resetFields()
            }
        }
    }, [open, car, form])

    return (
        <Modal
            title={car ? 'Редактировать автомобиль' : 'Новый автомобиль'}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Сохранить"
            cancelText="Отмена"
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item
                    label="Марка"
                    name="brand"
                    rules={[
                        { required: true, message: 'Введите марку' },
                        { max: 100, message: 'Не более 100 символов' },
                    ]}
                >
                    <Input placeholder="Lada" />
                </Form.Item>
                <Form.Item
                    label="Модель"
                    name="model"
                    rules={[
                        { required: true, message: 'Введите модель' },
                        { max: 100, message: 'Не более 100 символов' },
                    ]}
                >
                    <Input placeholder="Vesta" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default CarModal