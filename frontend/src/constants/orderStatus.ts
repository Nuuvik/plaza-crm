export const ORDER_STATUS_COLORS: Record<string, string> = {
    NEW: 'blue',
    CONFIRMED: 'orange',
    SHIPPED: 'purple',
    COMPLETED: 'green',
    CANCELLED: 'red',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
    NEW: 'Новый',
    CONFIRMED: 'Подтверждён',
    SHIPPED: 'Отправлен',
    COMPLETED: 'Выполнен',
    CANCELLED: 'Отменён',
}

// Допустимые переходы статусов
export const STATUS_TRANSITIONS: Record<string, string[]> = {
    NEW: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
}