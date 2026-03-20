import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, message } from 'antd'
import type { Product } from '../../types'
import { createProduct, updateProduct } from '../../api/products'

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
            product ? form.setFieldsValue(product) : form.resetFields()
        }
    }, [open, product])

    const onFinish = async (values: Omit<Product, 'id'>) => {
        try {
            product
                ? await updateProduct(product.id, values)
                : await createProduct(values)
            messageApi.success(product ? 'Товар обновлён' : 'Товар создан')
            onSuccess()
        } catch (e: any) {
            messageApi.error(e.response?.data?.message || 'Ошибка')
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
                <Form.Item label="SKU" name="sku" rules={[{ required: true, message: 'Введите SKU' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Цена" name="price" rules={[{ required: true, message: 'Введите цену' }]}>
                    <InputNumber min={0.01} precision={2} style={{ width: '100%' }} addonAfter="₽" />
                </Form.Item>
                <Form.Item label="Автомобиль" name="car">
                    <Input placeholder="Например: Toyota Camry" />
                </Form.Item>
                <Form.Item label="Остаток" name="stockQuantity" rules={[{ required: true, message: 'Введите остаток' }]}>
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="шт." />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ProductModal