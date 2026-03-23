import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthProvider'
import { useAuth } from './store/useAuth'
import { useEffect } from 'react'
import { setLogoutFn } from './api'
import LoginPage from './pages/login/LoginPage'
import CustomersPage from './pages/customers/CustomersPage'
import OrdersPage from './pages/orders/OrdersPage'
import ProductsPage from './pages/products/ProductsPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import MainLayout from './components/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuth } = useAuth()
  return isAuth ? <>{children}</> : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { logout } = useAuth()

  useEffect(() => {
    setLogoutFn(logout)
  }, [logout])

  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  )
}

function App() {
  return (
      <AuthProvider>
          <ErrorBoundary>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
          </ErrorBoundary>
      </AuthProvider>
  )
}

export default App