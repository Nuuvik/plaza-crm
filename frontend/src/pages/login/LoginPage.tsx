import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import { setToken } from '../../store/auth'
import type { LoginRequest } from '../../types'

const LoginPage = () => {
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage()

    const onFinish = async (values: LoginRequest) => {
        try {
            const response = await api.post('/auth/login', values)
            setToken(response.data.token)
            navigate('/')
        } catch {
            messageApi.error('Неверный логин или пароль')
        }
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f0f2f5'
        }}>
            {contextHolder}
            <Card title="Plaza CRM" style={{ width: 360 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Логин"
                        name="username"
                        rules={[{ required: true, message: 'Введите логин' }]}
                    >
                        <Input size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[{ required: true, message: 'Введите пароль' }]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default LoginPage