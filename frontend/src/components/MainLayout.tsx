import { useEffect, useState } from 'react'
import { Layout, Menu, Button, theme, Popconfirm, Avatar, Space } from 'antd'
import {
    DashboardOutlined,
    TeamOutlined,
    ShoppingCartOutlined,
    BoxPlotOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { removeToken } from '../store/auth'
import { getMe } from '../api/auth'
import type { User } from '../types'

const { Sider, Content, Header } = Layout

const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Дашборд' },
    { key: '/customers', icon: <TeamOutlined />, label: 'Клиенты' },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Заказы' },
    { key: '/products', icon: <BoxPlotOutlined />, label: 'Товары' },
]

const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { token } = theme.useToken()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        getMe().then(r => setUser(r.data))
    }, [])

    const handleLogout = () => {
        removeToken()
        navigate('/login')
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider theme="dark" width={220}>
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 'bold',
                    borderBottom: '1px solid #303030'
                }}>
                    Plaza CRM
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{
                    background: token.colorBgContainer,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingInline: 24,
                    gap: 12,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                }}>
                    {user && (
                        <Space>
                            <Avatar icon={<UserOutlined />} />
                            <span>{user.username}</span>
                            <span style={{ color: token.colorTextSecondary, fontSize: 12 }}>
                {user.role}
              </span>
                        </Space>
                    )}
                    <Popconfirm
                        title="Выйти из системы?"
                        onConfirm={handleLogout}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button icon={<LogoutOutlined />}>Выйти</Button>
                    </Popconfirm>
                </Header>
                <Content style={{ margin: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout