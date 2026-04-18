import api from '.'
import type { Product, Page } from '../types'

export const getProducts = (params?: {
    name?: string
    sku?: string
    car?: string
    page?: number
    size?: number
    sort?: string
}) => api.get<Page<Product>>('/products', { params })

export const getArchivedProducts = (params?: {
    name?: string
    sku?: string
    car?: string
    page?: number
    size?: number
    sort?: string
}) => api.get<Page<Product>>('/products/archived', { params })

export const getProductOrdersCount = (id: number) =>
    api.get<{ count: number }>(`/products/${id}/orders-count`)

export const createProduct = (data: Omit<Product, 'id' | 'archived'>) =>
    api.post<Product>('/products', data)

export const updateProduct = (id: number, data: Omit<Product, 'id' | 'archived'>) =>
    api.put<Product>(`/products/${id}`, data)

export const deleteProduct = (id: number) =>
    api.delete(`/products/${id}`)

export const archiveProduct = (id: number) =>
    api.patch<Product>(`/products/${id}/archive`)

export const unarchiveProduct = (id: number) =>
    api.patch<Product>(`/products/${id}/unarchive`)