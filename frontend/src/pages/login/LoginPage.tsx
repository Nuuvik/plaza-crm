import {Button, Card, Form, Input, theme} from 'antd'
import {useNavigate} from 'react-router-dom'
import api from '../../api'
import {useAuth} from '../../store/useAuth'
import type {LoginRequest} from '../../types'

const LoginPage = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form] = Form.useForm()
    const { token } = theme.useToken()

    const onFinish = async (values: LoginRequest) => {
        try {
            const response = await api.post('/auth/login', values)
            login(response.data.token)
            navigate('/')
        } catch {
            // показываем ошибку на поле пароля — не раскрываем, что именно неверно
            form.setFields([
                { name: 'password', errors: ['Неверный логин или пароль'] }
            ])
        }
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: token.colorBgLayout,
        }}>
            <Card title="Plaza CRM" style={{ width: 360 }}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
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