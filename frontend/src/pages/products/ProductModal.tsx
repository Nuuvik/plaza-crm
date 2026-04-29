import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, message } from 'antd'
import type { Product } from '../../types'
import { createProduct, updateProduct } from '../../api/products'
import { extractErrorMessage, setFormServerErrors } from '../../api/utils'

interface Props {
    open: boolean
    product: Product | null
    onClose: () => void
    onSuccess: () => void
}

const ProductModal = ({ open, product, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (open) {
            if (product) {
                form.setFieldsValue(product)
            } else {
                form.resetFields()
            }
        }
    }, [open, product, form])

    const onFinish = async (values: Omit<Product, 'id'>) => {
        try {
            if (product) {
                await updateProduct(product.id, values)
                messageApi.success('Товар обновлён')
            } else {
                await createProduct(values)
                messageApi.success('Товар создан')
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
            title={product ? 'Редактировать товар' : 'Новый товар'}
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
                    label="Артикул" name="sku"
                    rules={[
                        { required: true, message: 'Введите артикул' },
                        { max: 50, message: 'Не более 50 символов' },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Название" name="name"
                    rules={[{ required: true, message: 'Введите название' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Цена" name="price"
                    rules={[
                        { required: true, message: 'Введите цену' },
                        { type: 'number', min: 0.01, message: 'Цена должна быть больше 0' },
                    ]}
                >
                    <InputNumber min={0.01} precision={2} style={{ width: '100%' }} addonAfter="₽" />
                </Form.Item>
                <Form.Item label="Автомобиль" name="car">
                    <Input placeholder="Например: Lada Vesta" />
                </Form.Item>
                <Form.Item label="Дополнительно" name="additions">
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item
                    label="Остаток" name="stockQuantity"
                    rules={[
                        { required: true, message: 'Введите остаток' },
                        { type: 'number', min: 0, message: 'Остаток не может быть отрицательным' },
                    ]}
                >
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="шт." />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ProductModal