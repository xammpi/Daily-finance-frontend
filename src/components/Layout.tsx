import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  PiggyBank,
  LogOut,
  Plus,
  Wallet
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface LayoutProps {
  children: ReactNode
  onAddExpense?: () => void
}

export default function Layout({ children, onAddExpense }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Categories', href: '/categories', icon: FolderOpen },
    { name: 'Deposit', href: '/deposit', icon: PiggyBank },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleQuickExpense = () => {
    if (onAddExpense) {
      onAddExpense()
    } else {
      navigate('/expenses/new')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Daily Finance</h1>
              <p className="text-xs text-slate-500">Track your expenses</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {user?.username || 'User'}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen p-8">{children}</main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleQuickExpense}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-2xl transition-transform hover:scale-110 hover:shadow-indigo-500/50"
        title="Add Expense"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
