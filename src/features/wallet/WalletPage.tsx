import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Receipt,
  Activity
} from 'lucide-react'
import { useBalance } from '@/hooks/useBalance'
import { formatCurrency } from '@/utils'
import Layout from '@/components/Layout'

export default function WalletPage() {
  const { wallet, isLoading } = useBalance()

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" aria-hidden="true" />
            <p className="text-slate-600">Loading wallet details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!wallet) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Wallet className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="text-lg font-medium text-slate-900">No wallet found</p>
            <p className="mt-1 text-sm text-slate-500">Unable to load wallet details</p>
          </div>
        </div>
      </Layout>
    )
  }

  const currencySymbol = wallet.currency.symbol
  const currencyCode = wallet.currency.code

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-8 text-white shadow-2xl">
          {/* Decorative Circles */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Wallet Management</h1>
                <p className="mt-1 text-sm text-white/90">View and manage your wallet details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Balance Warning */}
        {wallet.lowBalanceWarning && (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Low Balance Warning</p>
              <p className="mt-1 text-sm text-orange-600">
                Your balance is below {currencySymbol}100. Consider adding funds to continue tracking expenses.
              </p>
            </div>
          </div>
        )}

        {/* Main Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-10 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold opacity-90">Current Balance</p>
                    <p className="text-xs opacity-75">{wallet.currency.name}</p>
                  </div>
                </div>
                <p className="text-6xl font-bold tracking-tight">
                  {formatCurrency(wallet.amount, currencyCode)}
                </p>
                <p className="mt-4 text-sm font-medium opacity-90">
                  Last transaction: {wallet.lastTransactionDate ? new Date(wallet.lastTransactionDate).toLocaleDateString() : 'No transactions yet'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold opacity-75">Currency</p>
                <p className="text-4xl font-bold">{currencyCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Deposits */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-50" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-50/50" />
            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Total Deposits</p>
              <p className="truncate text-xl font-bold text-slate-900 lg:text-2xl">{wallet.totalDeposits}</p>
              <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-600">Amount Deposited</p>
                <p className="truncate text-base font-bold text-emerald-900">
                  {formatCurrency(wallet.totalDepositAmount, currencyCode)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-50" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-red-50/50" />
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                <TrendingDown className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Total Transactions</p>
              <p className="text-3xl font-bold text-slate-900">{wallet.totalExpenses}</p>
              <div className="mt-4 rounded-xl bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-600">Amount Spent</p>
                <p className="text-lg font-bold text-red-900">
                  {formatCurrency(wallet.totalExpenseAmount, currencyCode)}
                </p>
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-50" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-blue-50/50" />
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Net Activity</p>
              <p className="text-3xl font-bold text-slate-900">
                {wallet.totalDeposits + wallet.totalExpenses}
              </p>
              <div className="mt-4 rounded-xl bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-600">Total Transactions</p>
                <p className="text-lg font-bold text-blue-900">
                  {wallet.totalDeposits} in / {wallet.totalExpenses} out
                </p>
              </div>
            </div>
          </div>

          {/* Average Expense */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-50" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-purple-50/50" />
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Avg Expense</p>
              <p className="text-3xl font-bold text-slate-900">
                {wallet.totalExpenses > 0
                  ? formatCurrency(wallet.totalExpenseAmount / wallet.totalExpenses, currencyCode)
                  : formatCurrency(0, currencyCode)}
              </p>
              <div className="mt-4 rounded-xl bg-purple-50 p-3">
                <p className="text-xs font-semibold text-purple-600">Per Transaction</p>
                <p className="text-lg font-bold text-purple-900">
                  {wallet.totalExpenses} transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Summary Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <Receipt className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Wallet Summary</h2>
              <p className="text-sm text-slate-500">Overview of your financial activity</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Balance Calculation */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Balance Calculation</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Deposited</span>
                  <span className="font-medium text-emerald-600">
                    +{formatCurrency(wallet.totalDepositAmount, currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Spent</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(wallet.totalExpenseAmount, currencyCode)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Current Balance</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(wallet.amount, currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Stats */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Transaction Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Total Deposits</p>
                  <p className="text-lg font-semibold text-slate-900">{wallet.totalDeposits}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Transactions</p>
                  <p className="text-lg font-semibold text-slate-900">{wallet.totalExpenses}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Deposit</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {wallet.totalDeposits > 0
                      ? formatCurrency(wallet.totalDepositAmount / wallet.totalDeposits, currencyCode)
                      : formatCurrency(0, currencyCode)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Expense</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {wallet.totalExpenses > 0
                      ? formatCurrency(wallet.totalExpenseAmount / wallet.totalExpenses, currencyCode)
                      : formatCurrency(0, currencyCode)}
                  </p>
                </div>
              </div>
            </div>

            {/* Currency Info */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Currency Information</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{wallet.currency.name}</p>
                  <p className="text-xs text-slate-500">Currency Code: {wallet.currency.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{wallet.currency.symbol}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-1">
            <Link
              to="/transactions"
              className="group flex items-center gap-4 rounded-xl border border-purple-200 bg-purple-50 p-4 transition-all hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 transition-transform group-hover:scale-110">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-purple-900">View Expenses</p>
                <p className="text-sm text-purple-600">See transaction history</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
