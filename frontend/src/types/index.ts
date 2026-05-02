export interface LoginRequest {
    username: string
    password: string
}

export interface User {
    id: number
    username: string
    role: 'ADMIN' | 'MANAGER' | 'WAREHOUSE'
    createdAt: string
}

export interface Customer {
    id: number
    name: string
    email: string
    phone: string
    telegram: string
    address: string
    createdAt: string
}

export interface Product {
    id: number
    sku: string
    name: string
    price: number
    car: Car | null
    stockQuantity: number
    additions: string
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
    source: string
    paymentDate: string | null
    paymentMethod: string | null
    items: OrderItem[]
}

export interface Car {
    id: number
    brand: string
    model: string
}

export interface PageMeta {
    totalElements: number
    totalPages: number
    size: number
    number: number
}

export interface Component {
    id: number
    sku: string
    name: string
    stockQuantity: number
}

export interface ProductComponent {
    id: number
    componentId: number
    componentSku: string
    componentName: string
    quantity: number
}

export interface AssemblyLog {
    id: number
    productId: number
    productName: string
    quantity: number
    username: string
    createdAt: string
}

export interface Page<T> {
    content: T[]
    page: PageMeta
}