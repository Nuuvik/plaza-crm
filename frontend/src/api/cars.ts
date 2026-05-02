import api from '.'
import type { Car, Page } from '../types'

export interface CarRequest {
    brand: string
    model: string
}

export const getCars = (params?: { page?: number; size?: number }) =>
    api.get<Page<Car>>('/cars', { params })

export const createCar = (data: CarRequest) =>
    api.post<Car>('/cars', data)

export const updateCar = (id: number, data: CarRequest) =>
    api.put<Car>(`/cars/${id}`, data)

export const deleteCar = (id: number) =>
    api.delete(`/cars/${id}`)