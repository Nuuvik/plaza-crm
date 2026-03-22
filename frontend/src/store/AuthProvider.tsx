import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import { getToken, setToken, removeToken } from './auth'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuth, setIsAuth] = useState(!!getToken())

    const login = (token: string) => {
        setToken(token)
        setIsAuth(true)
    }

    const logout = () => {
        removeToken()
        setIsAuth(false)
    }

    useEffect(() => {
        const handleStorage = () => setIsAuth(!!getToken())
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    return (
        <AuthContext.Provider value={{ isAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}