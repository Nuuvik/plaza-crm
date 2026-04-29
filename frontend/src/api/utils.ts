import axios from "axios";
import type { FormInstance } from "antd";

export const extractErrorMessage = (e: unknown, fallback = 'Ошибка'): string => {
    if (!axios.isAxiosError(e) || !e.response?.data) return fallback
    const data = e.response.data
    if (data?.errors) {
        return Object.values(data.errors as Record<string, string>).join(', ')
    }
    return data?.message ?? fallback
}

// Проставляет серверные ошибки прямо на поля формы.
// Возвращает true, если удалось распарсить field-errors.
export const setFormServerErrors = (form: FormInstance, e: unknown): boolean => {
    if (!axios.isAxiosError(e) || e.response?.status !== 400) return false
    const data = e.response?.data
    if (data?.errors && typeof data.errors === 'object') {
        form.setFields(
            Object.entries(data.errors as Record<string, string>).map(
                ([name, error]) => ({ name, errors: [error] })
            )
        )
        return true
    }
    return false
}