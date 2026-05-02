import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import {AuthProvider} from './store/AuthProvider'
import {ThemeProvider} from './store/ThemeProvider'
import {useAuth} from './store/useAuth'
import {useEffect, useState} from 'react'
import {setLogoutFn} from './api'
import LoginPage from './pages/login/LoginPage'
import CustomersPage from './pages/customers/CustomersPage'
import OrdersPage from './pages/orders/OrdersPage'
import ProductsPage from './pages/products/ProductsPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import UsersPage from './pages/users/UsersPage'
import AuditLogsPage from './pages/audit/AuditLogsPage'
import MainLayout from './components/MainLayout'
import CarsPage from './pages/cars/CarsPage'
import WarehousePage from './pages/warehouse/WarehousePage'
import {getMe} from "./api/auth.ts";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuth } = useAuth()
    return isAuth ? <>{children}</> : <Navigate to="/login" />
}

const AppRoutes = () => {
    const { logout } = useAuth()
    const [defaultPath, setDefaultPath] = useState<string | null>(null)

    useEffect(() => {
        setLogoutFn(logout)
        getMe()
            .then(r => {
                setDefaultPath(r.data.role === 'WAREHOUSE' ? '/warehouse' : '/dashboard')
            })
            .catch(() => setDefaultPath('/dashboard'))
    }, [logout])

    // пока не знаем роль — ничего не рендерим
    if (defaultPath === null) return null

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to={defaultPath} />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="warehouse" element={<WarehousePage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="cars" element={<CarsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App