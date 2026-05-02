import api from '.'
import type { ProductComponent } from '../types'

export const getBom = (productId: number) =>
    api.get<ProductComponent[]>(`/products/${productId}/bom`)

export const getMaxAssemblable = (productId: number) =>
    api.get<{ maxAssemblable: number }>(`/products/${productId}/bom/max-assemblable`)

export const addOrUpdateBomEntry = (productId: number, data: {
    componentId: number
    quantity: number
}) => api.post<ProductComponent>(`/products/${productId}/bom`, data)

export const removeBomEntry = (productId: number, componentId: number) =>
    api.delete(`/products/${productId}/bom/${componentId}`)