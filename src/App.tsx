import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import TransactionListPage from '@/features/expenses/TransactionListPage.tsx'
import CategoryListPage from '@/features/categories/CategoryListPage'
import WalletPage from '@/features/wallet/WalletPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/Toast'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionListPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoryListPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
