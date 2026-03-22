import { createContext } from 'react'

export interface AuthContextType {
    isAuth: boolean
    login: (token: string) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
    isAuth: false,
    login: () => {},
    logout: () => {}
})