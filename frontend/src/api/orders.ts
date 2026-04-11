import api from '.'
import type { Order, OrderListItem, Page } from '../types'

export const getOrders = (params?: {
    status?: string
    customerId?: number
    page?: number
    size?: number
}) => api.get<Page<OrderListItem>>('/orders', { params })

export const getOrderById = (id: number) =>
    api.get<Order>(`/orders/${id}`)

export const createOrder = (data: {
    customerId: number
    items: { productId: number; quantity: number }[]
    source?: string
    paymentMethod?: string
    paymentDate?: string
    notes?: string
}) => api.post<Order>('/orders', data)

export const deleteOrder = (id: number) =>
    api.delete(`/orders/${id}`)

export const confirmOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/confirm`)

export const cancelOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/cancel`)

export const shipOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/ship`)

export const completeOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/complete`)

export const updatePayment = (id: number, paid: boolean) =>
    api.patch<Order>(`/orders/${id}/payment`, { paid })

export const addItem = (orderId: number, productId: number, quantity: number) =>
    api.post<Order>(`/orders/${orderId}/items`, { productId, quantity })

export const updateItem = (orderId: number, productId: number, quantity: number) =>
    api.put<Order>(`/orders/${orderId}/items`, { productId, quantity })

export const removeItem = (orderId: number, productId: number) =>
    api.delete<Order>(`/orders/${orderId}/items/${productId}`)

export const getOrdersByCustomer = (customerId: number, params?: {
    page?: number
    size?: number
}) => api.get<Page<OrderListItem>>(`/customers/${customerId}/orders`, { params })

export const updateInfo = (id: number, data: {
    notes?: string
    source?: string
    paymentMethod?: string | null
    paymentDate?: string | null
}) => api.patch<Order>(`/orders/${id}/info`, data)
