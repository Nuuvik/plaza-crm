import api from '.'
import type { Page } from '../types'

export interface AuditLog {
    id: number
    entityType: string
    entityId: number
    action: string
    username: string
    createdAt: string
}

export const getAuditLogs = (params?: {
    entityType?: string
    username?: string
    from?: string
    to?: string
    page?: number
    size?: number
}) => api.get<Page<AuditLog>>('/audit-logs', { params })