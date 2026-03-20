import api from '.'

export interface StatsResponse {
    totalOrders: number
    totalCustomers: number
    totalRevenue: number
    ordersByStatus: Record<string, number>
    newCustomersThisMonth: number
    newOrdersThisMonth: number
}

export const getStats = () => api.get<StatsResponse>('/stats')