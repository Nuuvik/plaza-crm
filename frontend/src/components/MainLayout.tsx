import { useEffect, useState } from 'react'
import { Layout, Menu, Button, theme, Popconfirm, Avatar, Dropdown, Space, Tooltip } from 'antd'
import {
    DashboardOutlined,
    TeamOutlined,
    ShoppingCartOutlined,
    BoxPlotOutlined,
    LogoutOutlined,
    UserOutlined,
    UsergroupAddOutlined,
    LockOutlined,
    AuditOutlined,
    SettingOutlined,
    SunOutlined,
    MoonOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { removeToken } from '../store/auth'
import { getMe } from '../api/auth'
import { useTheme } from '../store/useTheme'
import type { User } from '../types'
import ChangePasswordModal from '../pages/users/ChangePasswordModal'

const { Sider, Content, Header } = Layout

const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { token } = theme.useToken()
    const { themeMode, toggleTheme } = useTheme()
    const [user, setUser] = useState<User | null>(null)
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)

    useEffect(() => {
        getMe().then(r => setUser(r.data))
    }, [])

    const handleLogout = () => {
        removeToken()
        navigate('/login')
    }

    const adminPaths = ['/users', '/audit-logs']
    const defaultOpenKeys = adminPaths.includes(location.pathname) ? ['admin'] : []

    const menuItems = [
        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Дашборд' },
        { key: '/customers', icon: <TeamOutlined />, label: 'Клиенты' },
        { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Заказы' },
        { key: '/products', icon: <BoxPlotOutlined />, label: 'Товары' },
        ...(user?.role === 'ADMIN'
            ? [
                {
                    key: 'admin',
                    icon: <SettingOutlined />,
                    label: 'Служебные',
                    children: [
                        { key: '/users', icon: <UsergroupAddOutlined />, label: 'Пользователи' },
                        { key: '/audit-logs', icon: <AuditOutlined />, label: 'Логи' },
                    ],
                },
            ]
            : []),
    ]

    const userDropdownItems = [
        {
            key: 'change-password',
            icon: <LockOutlined />,
            label: 'Сменить пароль',
            onClick: () => setChangePasswordOpen(true),
        },
    ]

    return (
        <Layout style={{ height: '100%' }}>
            <Sider
                theme="dark"
                width={220}
                style={{ height: '100%', overflow: 'auto', flexShrink: 0 }}
            >
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'bold',
                        borderBottom: '1px solid #303030',
                        flexShrink: 0,
                    }}
                >
                    Plaza CRM
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={defaultOpenKeys}
                    items={menuItems}
                    onClick={({ key }) => {
                        if (key !== 'admin') navigate(key)
                    }}
                />
            </Sider>
            <Layout style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Header
                    style={{
                        background: token.colorBgContainer,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        paddingInline: 24,
                        gap: 12,
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        flexShrink: 0,
                    }}
                >
                    <Tooltip title={themeMode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
                        <Button
                            type="text"
                            icon={themeMode === 'light' ? <MoonOutlined /> : <SunOutlined />}
                            onClick={toggleTheme}
                        />
                    </Tooltip>

                    {user && (
                        <Dropdown menu={{ items: userDropdownItems }} trigger={['click']}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar icon={<UserOutlined />} />
                                <span>{user.username}</span>
                                <span style={{ color: token.colorTextSecondary, fontSize: 12 }}>
                                    {user.role}
                                </span>
                            </Space>
                        </Dropdown>
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
                <Content
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: 24,
                        minHeight: 0,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>

            <ChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
            />
        </Layout>
    )
}

export default MainLayout