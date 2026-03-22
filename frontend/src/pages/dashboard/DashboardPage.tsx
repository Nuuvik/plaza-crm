import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Tag } from 'antd'
import {
    TeamOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    RiseOutlined,
} from '@ant-design/icons'
import { getStats, type StatsResponse } from '../../api/stats'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../constants/orderStatus'


const DashboardPage = () => {
    const [stats, setStats] = useState<StatsResponse | null>(null)

    useEffect(() => {
        getStats().then(r => setStats(r.data))
    }, [])

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Всего заказов"
                            value={stats?.totalOrders ?? '—'}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Всего клиентов"
                            value={stats?.totalCustomers ?? '—'}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Выручка"
                            value={stats?.totalRevenue ?? '—'}
                            prefix={<DollarOutlined />}
                            suffix="₽"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Новых заказов в этом месяце"
                            value={stats?.newOrdersThisMonth ?? '—'}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12}>
                    <Card title="Новых клиентов в этом месяце">
                        <Statistic
                            value={stats?.newCustomersThisMonth ?? '—'}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card title="Заказы по статусам">
                        {stats?.ordersByStatus
                            ? Object.entries(stats.ordersByStatus).map(([status, count]) => (
                                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Tag color={ORDER_STATUS_COLORS[status]}>{ORDER_STATUS_LABELS[status]}</Tag>
                                    <span>{count} шт.</span>
                                </div>
                            ))
                            : '—'
                        }
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default DashboardPage