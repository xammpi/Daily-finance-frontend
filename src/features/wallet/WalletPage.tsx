import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Settings,
  Receipt,
  Activity
} from 'lucide-react'
import { useBalance } from '@/hooks/useBalance'
import { formatCurrency } from '@/utils'
import Layout from '@/components/Layout'
import WalletManagerModal from '@/components/WalletManagerModal'

export default function WalletPage() {
  const { wallet, refresh, isLoading } = useBalance()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleModalSuccess = async () => {
    await refresh()
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Wallet Management</h1>
          <p className="mt-1 text-slate-600">View and manage your wallet details</p>
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
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                >
                  <Settings className="h-4 w-4" />
                  Manage Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Balance Card */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Current Balance</p>
                  <p className="text-xs opacity-75">{wallet.currency.name}</p>
                </div>
              </div>
              <p className="text-5xl font-bold">
                {formatCurrency(wallet.currentBalance, currencyCode)}
              </p>
              <p className="mt-2 text-sm opacity-75">
                Last transaction: {wallet.lastTransactionDate ? new Date(wallet.lastTransactionDate).toLocaleDateString() : 'No transactions yet'}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs opacity-75">Currency</p>
              <p className="text-2xl font-bold">{currencyCode}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <Settings className="h-5 w-5" />
              Wallet Manager
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Deposits */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Deposits</p>
                <p className="text-2xl font-bold text-slate-900">{wallet.totalDeposits}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600">Amount Deposited</p>
              <p className="text-lg font-semibold text-emerald-900">
                {formatCurrency(wallet.totalDepositAmount, currencyCode)}
              </p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900">{wallet.totalExpenses}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-xs text-red-600">Amount Spent</p>
              <p className="text-lg font-semibold text-red-900">
                {formatCurrency(wallet.totalExpenseAmount, currencyCode)}
              </p>
            </div>
          </div>

          {/* Net Balance */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Net Activity</p>
                <p className="text-2xl font-bold text-slate-900">
                  {wallet.totalDeposits + wallet.totalExpenses}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-blue-600">Total Transactions</p>
              <p className="text-lg font-semibold text-blue-900">
                {wallet.totalDeposits} in / {wallet.totalExpenses} out
              </p>
            </div>
          </div>

          {/* Average Expense */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Expense</p>
                <p className="text-2xl font-bold text-slate-900">
                  {wallet.totalExpenses > 0
                    ? formatCurrency(wallet.totalExpenseAmount / wallet.totalExpenses, currencyCode)
                    : formatCurrency(0, currencyCode)}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-purple-50 p-3">
              <p className="text-xs text-purple-600">Per Transaction</p>
              <p className="text-lg font-semibold text-purple-900">
                {wallet.totalExpenses} transactions
              </p>
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
                      {formatCurrency(wallet.currentBalance, currencyCode)}
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
                  <p className="text-xs text-slate-500">Total Expenses</p>
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
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-left transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 transition-transform group-hover:scale-110">
                <Settings className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-indigo-900">Manage Wallet</p>
                <p className="text-sm text-indigo-600">Deposit or withdraw funds</p>
              </div>
            </button>

            <Link
              to="/expenses"
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

      {/* Wallet Manager Modal */}
      <WalletManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        currentBalance={wallet.currentBalance}
        currencyCode={wallet.currency.code}
        currencySymbol={wallet.currency.symbol}
      />
    </Layout>
  )
}
