import api from '.'
import type { Order, Page } from '../types'

export const getOrders = (params?: {
    status?: string
    customerId?: number
    page?: number
    size?: number
}) => api.get<Page<Order>>('/orders', { params })

export const getOrderById = (id: number) =>
    api.get<Order>(`/orders/${id}`)

export const createOrder = (data: { customerId: number; items: { productId: number; quantity: number }[] }) =>
    api.post<Order>('/orders', data)

export const deleteOrder = (id: number) =>
    api.delete(`/orders/${id}`)

export const confirmOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/confirm`)

export const cancelOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/cancel`)

export const payOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/pay`)

export const shipOrder = (id: number) =>
    api.patch<Order>(`/orders/${id}/ship`)

export const updateNotes = (id: number, notes: string) =>
    api.patch<Order>(`/orders/${id}/notes`, { notes })

export const addItem = (orderId: number, productId: number, quantity: number) =>
    api.post<Order>(`/orders/${orderId}/items`, { productId, quantity })

export const removeItem = (orderId: number, productId: number) =>
    api.delete<Order>(`/orders/${orderId}/items/${productId}`)

export const getOrdersByCustomer = (customerId: number, params?: {
    page?: number
    size?: number
}) => api.get<Page<Order>>(`/customers/${customerId}/orders`, { params })