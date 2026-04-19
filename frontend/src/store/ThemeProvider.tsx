import { useState, useCallback } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { ThemeContext, type ThemeMode } from './ThemeContext'

const STORAGE_KEY = 'plaza-crm-theme'

const getSavedTheme = (): ThemeMode => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(getSavedTheme)

    const toggleTheme = useCallback(() => {
        setThemeMode(prev => {
            const next: ThemeMode = prev === 'light' ? 'dark' : 'light'
            localStorage.setItem(STORAGE_KEY, next)
            return next
        })
    }, [])

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: themeMode === 'dark'
                        ? antdTheme.darkAlgorithm
                        : antdTheme.defaultAlgorithm,
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    )
}