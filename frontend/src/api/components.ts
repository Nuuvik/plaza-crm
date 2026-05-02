import api from '.'
import type { Component, Page } from '../types'

export interface ComponentRequest {
    sku: string
    name: string
    stockQuantity: number
}

export const getComponents = (params?: {
    name?: string
    sku?: string
    page?: number
    size?: number
}) => api.get<Page<Component>>('/components', { params })

export const getComponentById = (id: number) =>
    api.get<Component>(`/components/${id}`)

export const createComponent = (data: ComponentRequest) =>
    api.post<Component>('/components', data)

export const updateComponent = (id: number, data: ComponentRequest) =>
    api.put<Component>(`/components/${id}`, data)

export const deleteComponent = (id: number) =>
    api.delete(`/components/${id}`)

export const adjustStock = (id: number, quantity: number) =>
    api.patch<Component>(`/components/${id}/stock`, { quantity })