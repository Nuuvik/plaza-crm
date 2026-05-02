import api from '.'
import type { User, Page } from '../types'

export const getMe = () => api.get<User>('/users/me')

export const getUsers = (params?: { page?: number; size?: number; sort?: string }) =>
    api.get<Page<User>>('/users', { params })

export const registerUser = (data: { username: string; password: string; role: 'ADMIN' | 'MANAGER' | 'WAREHOUSE' }) =>
    api.post('/auth/register', data)

export const changeOwnPassword = (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/password', data)

export const changePasswordById = (id: number, data: { newPassword: string }) =>
    api.patch(`/auth/${id}/password`, data)