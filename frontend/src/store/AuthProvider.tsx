import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext.ts'
import { getToken, removeToken } from './auth'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuth, setIsAuth] = useState(!!getToken())

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
        <AuthContext.Provider value={{ isAuth, logout }}>
            {children}
        </AuthContext.Provider>
    )
}