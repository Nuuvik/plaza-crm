import axios from "axios";

export const extractErrorMessage = (e: unknown, fallback = 'Ошибка'): string => {
    if (!axios.isAxiosError(e) || !e.response?.data) return fallback
    const data = e.response.data
    if (data?.errors) {
        return Object.values(data.errors as Record<string, string>).join(', ')
    }
    return data?.message ?? fallback
}