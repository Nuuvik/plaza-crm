import api from '.'
import type { Customer, Page } from '../types'

export const getCustomers = (params?: {
    name?: string
    phone?: string
    email?: string
    page?: number
    size?: number
}) => api.get<Page<Customer>>('/customers', { params })

export const getCustomerById = (id: number) =>
    api.get<Customer>(`/customers/${id}`)

export const createCustomer = (data: Omit<Customer, 'id'>) =>
    api.post<Customer>('/customers', data)

export const updateCustomer = (id: number, data: Omit<Customer, 'id'>) =>
    api.put<Customer>(`/customers/${id}`, data)

export const deleteCustomer = (id: number) =>
    api.delete(`/customers/${id}`)