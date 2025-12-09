import { useState, FormEvent, useEffect } from 'react'
import { X, PiggyBank, Wallet, DollarSign, FileText, AlertCircle, Globe } from 'lucide-react'
import { userApi } from '@/api/user'
import { currenciesApi } from '@/api/currencies'
import { formatCurrency, isValidAmount } from '@/utils'
import type { Currency } from '@/types'

interface WalletManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
  currencyCode: string
  currencySymbol: string
  currentCurrency: Currency
}

type TabType = 'deposit' | 'withdraw' | 'currency'

export default function WalletManagerModal({
  isOpen,
  onClose,
  onSuccess,
  amount: currentBalance,
  currencyCode,
  currencySymbol,
  currentCurrency,
}: WalletManagerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deposit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Currency management state
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number>(currentCurrency.id)
  const [currencySearch, setCurrencySearch] = useState('')

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fetch currencies when modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'currency') {
      fetchCurrencies()
    }
  }, [isOpen, activeTab])

  const fetchCurrencies = async () => {
    try {
      const data = await currenciesApi.getAll()
      setCurrencies(data)
    } catch (err) {
      console.error('Failed to fetch currencies:', err)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Handle currency change
    if (activeTab === 'currency') {
      if (selectedCurrencyId === currentCurrency.id) {
        setError('Please select a different currency')
        return
      }

      try {
        setIsLoading(true)
        await userApi.updateCurrency({ currencyId: selectedCurrencyId })

        // Call success callback
        onSuccess()

        // Close modal
        onClose()
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to update currency'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Handle deposit/withdraw
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
      setCurrencySearch('')
      setSelectedCurrencyId(currentCurrency.id)
      onClose()
    }
  }

  // Filter currencies based on search
  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.code.toLowerCase().includes(currencySearch.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-6">
          {/* Decorative Circles */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Wallet Manager</h2>
                <p className="mt-1 text-sm text-white/90">
                  Current Balance: {formatCurrency(currentBalance, currencyCode)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/20 hover:text-white disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('deposit')
              setError(null)
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'deposit'
                ? 'text-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="h-5 w-5" />
            Deposit Money
            {activeTab === 'deposit' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('withdraw')
              setError(null)
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'withdraw'
                ? 'text-red-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wallet className="h-5 w-5" />
            Withdraw Money
            {activeTab === 'withdraw' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-600" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('currency')
              setError(null)
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'currency'
                ? 'text-indigo-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Globe className="h-5 w-5" />
            Change Currency
            {activeTab === 'currency' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
            )}
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Alert */}
          {activeTab !== 'currency' && (
            <div
              className={`mb-6 rounded-xl border p-4 shadow-sm ${
                activeTab === 'deposit'
                  ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
                  : 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  activeTab === 'deposit' ? 'text-emerald-900' : 'text-orange-900'
                }`}
              >
                {activeTab === 'deposit'
                  ? '💰 Add funds to your balance. The deposited amount will be immediately available.'
                  : '⚠️ Remove funds from your balance. Make sure you have sufficient balance before proceeding.'}
              </p>
            </div>
          )}

          {/* Currency Info Alert */}
          {activeTab === 'currency' && (
            <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-indigo-900">
                🌍 Change your wallet currency. Your current balance will remain the same, but will be displayed in the new currency.
              </p>
              <div className="mt-3 rounded-lg bg-white/60 p-3">
                <p className="text-xs font-semibold text-indigo-700">Current Currency:</p>
                <p className="text-lg font-bold text-indigo-900">
                  {currentCurrency.name} ({currentCurrency.code}) {currentCurrency.symbol}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4 text-red-700 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-md">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Amount Input */}
          {activeTab !== 'currency' && (
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
          )}

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

          {/* Currency Selection */}
          {activeTab === 'currency' && (
            <div className="mb-6">
              <label htmlFor="currencySearch" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Globe className="h-4 w-4" />
                Search Currency
              </label>
              <input
                id="currencySearch"
                type="text"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Search by name or code..."
              />
              <p className="mt-2 text-sm text-slate-500">Filter currencies by name or code</p>

              {/* Currency List */}
              <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 scrollbar-hide" style={{ scrollBehavior: 'auto' }}>
                {filteredCurrencies.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-4">No currencies found</p>
                ) : (
                  <div className="space-y-1">
                    {filteredCurrencies.map((currency) => {
                      const isSelected = selectedCurrencyId === currency.id
                      const isCurrent = currency.id === currentCurrency.id
                      return (
                        <button
                          key={currency.id}
                          type="button"
                          onClick={() => setSelectedCurrencyId(currency.id)}
                          disabled={isCurrent}
                          className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${
                            isCurrent
                              ? 'cursor-not-allowed border-slate-300 bg-slate-200 opacity-60'
                              : isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-transparent bg-white hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold">
                              {currency.symbol}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                                {currency.name}
                              </p>
                              <p className={`text-xs ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {currency.code}
                              </p>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="flex-shrink-0 rounded-full bg-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
                              Current
                            </span>
                          )}
                          {isSelected && !isCurrent && (
                            <span className="flex-shrink-0 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                              Selected
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-red-500 to-orange-600'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600'
              }`}
            >
              {activeTab === 'deposit' ? (
                <PiggyBank className="h-5 w-5" />
              ) : activeTab === 'withdraw' ? (
                <Wallet className="h-5 w-5" />
              ) : (
                <Globe className="h-5 w-5" />
              )}
              {isLoading
                ? 'Processing...'
                : activeTab === 'deposit'
                ? 'Deposit Funds'
                : activeTab === 'withdraw'
                ? 'Withdraw Funds'
                : 'Update Currency'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
