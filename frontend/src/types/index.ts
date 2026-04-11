export interface LoginRequest {
    username: string
    password: string
}

export interface User {
    id: number
    username: string
    role: 'ADMIN' | 'MANAGER'
    createdAt: string
}

export interface Customer {
    id: number
    name: string
    email: string
    phone: string
    telegram: string
    address: string
}

export interface Product {
    id: number
    sku: string
    name: string
    price: number
    car: string
    stockQuantity: number
    archived: boolean
}

export interface OrderItem {
    productId: number
    sku: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export interface OrderListItem {
    id: number
    customerId: number
    customerName: string
    status: 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
    totalPrice: number
    createdAt: string
    notes: string
    paid: boolean
}

export interface Order {
    id: number
    customerId: number
    customerName: string
    status: 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
    totalPrice: number
    createdAt: string
    notes: string
    paid: boolean
    items: OrderItem[]
}

export interface PageMeta {
    totalElements: number
    totalPages: number
    size: number
    number: number
}

export interface Page<T> {
    content: T[]
    page: PageMeta
}