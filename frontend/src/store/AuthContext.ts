import { createContext } from 'react'

export interface AuthContextType {
    isAuth: boolean
    logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
    isAuth: false,
    logout: () => {}
})