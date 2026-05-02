import api from '.'
import type { AssemblyLog, Page } from '../types'

export const assemble = (data: { productId: number; quantity: number }) =>
    api.post('/assembly', data)

export const getAssemblyLogs = (params?: {
    productId?: number
    page?: number
    size?: number
}) => api.get<Page<AssemblyLog>>('/assembly/logs', { params })