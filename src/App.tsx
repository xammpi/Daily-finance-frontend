import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/Toast'

// Lazy load all route components for better performance
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const TransactionListPage = lazy(() => import('@/features/expenses/TransactionListPage'))
const CategoryListPage = lazy(() => import('@/features/categories/CategoryListPage'))
const WalletPage = lazy(() => import('@/features/wallet/WalletPage'))
const AccountPage = lazy(() => import('@/features/account/AccountPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-lg font-medium text-slate-700">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionListPage /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoryListPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
