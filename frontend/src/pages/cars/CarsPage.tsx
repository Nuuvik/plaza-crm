import { useCallback, useEffect, useState } from 'react'
import { Button, message, Popconfirm, Space, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Car } from '../../types'
import { createCar, deleteCar, getCars, updateCar } from '../../api/cars'
import CarModal from './CarModal'

const CarsPage = () => {
    const [cars, setCars] = useState<Car[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCar, setEditingCar] = useState<Car | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getCars({ page, size: 10 })
            setCars(res.data.content)
            setTotal(res.data.page.totalElements)
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        load()
    }, [load])

    const handleDelete = async (id: number) => {
        try {
            await deleteCar(id)
            messageApi.success('Автомобиль удалён')
            load()
        } catch {
            messageApi.error('Не удалось удалить автомобиль')
        }
    }

    const handleEdit = (car: Car) => {
        setEditingCar(car)
        setModalOpen(true)
    }

    const handleCreate = () => {
        setEditingCar(null)
        setModalOpen(true)
    }

    const handleSubmit = async (values: { brand: string; model: string }) => {
        try {
            if (editingCar) {
                await updateCar(editingCar.id, values)
                messageApi.success('Автомобиль обновлён')
            } else {
                await createCar(values)
                messageApi.success('Автомобиль добавлен')
            }
            setModalOpen(false)
            load()
        } catch {
            messageApi.error('Не удалось сохранить автомобиль')
        }
    }

    const columns: ColumnsType<Car> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
        },
        {
            title: 'Марка',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Модель',
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleEdit(record) }}
                    >
                        Изменить
                    </Button>
                    <Popconfirm
                        title="Удалить автомобиль?"
                        description="Товары с этим автомобилем останутся, но потеряют привязку."
                        onConfirm={(e) => { e?.stopPropagation(); handleDelete(record.id) }}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            size="small"
                            danger
                            onClick={(e) => e.stopPropagation()}
                        >
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Новый автомобиль
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={cars}
                rowKey="id"
                loading={loading}
                pagination={{
                    total,
                    current: page + 1,
                    pageSize: 10,
                    showTotal: (t) => `Всего: ${t}`,
                    onChange: (p) => setPage(p - 1),
                }}
                onRow={(record) => ({
                    onClick: () => handleEdit(record),
                    style: { cursor: 'pointer' },
                })}
            />
            <CarModal
                open={modalOpen}
                car={editingCar}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default CarsPage