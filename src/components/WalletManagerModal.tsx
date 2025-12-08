import { useState, FormEvent } from 'react'
import { X, PiggyBank, Wallet, DollarSign, FileText, AlertCircle } from 'lucide-react'
import { userApi } from '@/api/user'
import { formatCurrency, isValidAmount } from '@/utils'

interface WalletManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
  currencyCode: string
  currencySymbol: string
}

type TabType = 'deposit' | 'withdraw'

export default function WalletManagerModal({
  isOpen,
  onClose,
  onSuccess,
  amount: currentBalance,
  currencyCode,
  currencySymbol,
}: WalletManagerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deposit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValidAmount(amount)) {
      setError('Amount must be greater than 0')
      return
    }

    const transactionAmount = parseFloat(amount)

    // Check balance for withdrawals
    if (activeTab === 'withdraw' && transactionAmount > currentBalance) {
      setError(`Insufficient balance. Available: ${formatCurrency(currentBalance, currencyCode)}`)
      return
    }

    try {
      setIsLoading(true)

      if (activeTab === 'deposit') {
        await userApi.deposit({ amount: transactionAmount })
      } else {
        await userApi.withdraw({
          amount: transactionAmount,
          description: description || undefined,
        })
      }

      // Reset form
      setAmount('')
      setDescription('')

      // Call success callback
      onSuccess()

      // Close modal
      onClose()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to ${activeTab} money`
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setAmount('')
      setDescription('')
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Wallet Manager</h2>
              <p className="text-sm text-slate-500">
                Balance: {formatCurrency(currentBalance, currencyCode)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('deposit')
              setError(null)
            }}
            className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'deposit'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="h-5 w-5" />
            Deposit Money
          </button>
          <button
            onClick={() => {
              setActiveTab('withdraw')
              setError(null)
            }}
            className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'withdraw'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Wallet className="h-5 w-5" />
            Withdraw Money
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Alert */}
          <div
            className={`mb-6 rounded-xl p-4 ${
              activeTab === 'deposit'
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50'
                : 'bg-gradient-to-br from-orange-50 to-red-50'
            }`}
          >
            <p
              className={`text-sm ${
                activeTab === 'deposit' ? 'text-emerald-900' : 'text-orange-900'
              }`}
            >
              {activeTab === 'deposit'
                ? 'Add funds to your balance. The deposited amount will be immediately available.'
                : 'Remove funds from your balance. Make sure you have sufficient balance before proceeding.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <label
              htmlFor="amount"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <DollarSign className="h-4 w-4" />
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-slate-400">
                {currencySymbol}
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-lg transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  activeTab === 'deposit'
                    ? 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === 'deposit'
                ? 'Enter the amount you want to add to your balance'
                : `Available balance: ${formatCurrency(currentBalance, currencyCode)}`}
            </p>
          </div>

          {/* Description Input (Withdraw only) */}
          {activeTab === 'withdraw' && (
            <div className="mb-6">
              <label
                htmlFor="description"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <FileText className="h-4 w-4" />
                Description <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., ATM withdrawal, Cash out"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-slate-500">Optional note about this withdrawal</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-r from-red-500 to-orange-600'
              }`}
            >
              {activeTab === 'deposit' ? (
                <PiggyBank className="h-5 w-5" />
              ) : (
                <Wallet className="h-5 w-5" />
              )}
              {isLoading
                ? 'Processing...'
                : activeTab === 'deposit'
                ? 'Deposit Funds'
                : 'Withdraw Funds'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
