import api from '.'
import type { Product, Page } from '../types'

export const getProducts = (params?: {
    name?: string
    sku?: string
    car?: string
    page?: number
    size?: number
}) => api.get<Page<Product>>('/products', { params })

export const createProduct = (data: Omit<Product, 'id'>) =>
    api.post<Product>('/products', data)

export const updateProduct = (id: number, data: Omit<Product, 'id'>) =>
    api.put<Product>(`/products/${id}`, data)

export const deleteProduct = (id: number) =>
    api.delete(`/products/${id}`)