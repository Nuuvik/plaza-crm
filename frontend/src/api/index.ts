import axios from 'axios'
import { notification } from 'antd'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                localStorage.removeItem('token')
                logoutFn?.()
                window.location.href = '/login'
                return Promise.reject(new Error('Token expired'))
            }
        } catch {
            // Невалидный формат токена — сервер вернёт 401, обработаем там
        }
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let logoutFn: (() => void) | null = null
let isRedirectingToLogin = false

export const setLogoutFn = (fn: () => void) => {
    logoutFn = fn
    isRedirectingToLogin = false  // ← сброс при монтировании новой сессии
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!axios.isAxiosError(error)) {
            notification.error({ message: 'Неизвестная ошибка' })
            return Promise.reject(error)
        }

        const status = error.response?.status

        if (status === 401) {
            if (!isRedirectingToLogin) {
                isRedirectingToLogin = true
                localStorage.removeItem('token')
                logoutFn?.()
                window.location.href = '/login'
            }
            return Promise.reject(error)
        }

        if (!error.response) {
            notification.error({
                key: 'no-connection',
                title: 'Нет соединения с сервером'
            })
            return Promise.reject(error)
        }

        if (status === 403) {
            notification.error({
                key: 'forbidden',
                title: 'Недостаточно прав'
            })
            return Promise.reject(error)
        }

        if (status === 500) {
            notification.error({
                key: 'server-error',
                title: 'Внутренняя ошибка сервера'
            })
            return Promise.reject(error)
        }

        // 400, 404 и остальные — пробрасываем дальше, компонент сам обработает
        return Promise.reject(error)
    }
)

export default api