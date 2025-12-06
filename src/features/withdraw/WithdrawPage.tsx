import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Wallet, DollarSign, CheckCircle, FileText } from 'lucide-react'
import { userApi } from '@/api/user'
import { formatCurrency, isValidAmount } from '@/utils'
import Layout from '@/components/Layout'

export default function WithdrawPage() {
  const navigate = useNavigate()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!isValidAmount(amount)) {
      setError('Amount must be greater than 0')
      return
    }

    const withdrawAmount = parseFloat(amount)

    try {
      setIsLoading(true)
      const updatedUser = await userApi.withdraw({
        amount: withdrawAmount,
        description: description || undefined,
      })
      const currencyCode = updatedUser.wallet.currency.code
      setSuccess(
        `Successfully withdrawn ${formatCurrency(withdrawAmount, currencyCode)}. New balance: ${formatCurrency(updatedUser.wallet.amount, currencyCode)}`
      )
      setAmount('')
      setDescription('')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to withdraw money'
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Withdraw Money</h1>
            <p className="mt-1 text-slate-600">Remove funds from your account balance</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
              <span className="text-xs font-bold">!</span>
            </div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">{success}</p>
              <p className="mt-1 text-sm text-green-600">Redirecting you to the dashboard...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
          {/* Warning Card */}
          <div className="rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-4">
            <p className="text-sm text-orange-900">
              Withdraw funds from your balance. Make sure you have sufficient balance before proceeding.
              This action will reduce your available balance.
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <DollarSign className="h-4 w-4" />
              Amount to Withdraw <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0.00"
                disabled={isLoading || !!success}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Enter the amount you want to withdraw from your balance
            </p>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="h-4 w-4" />
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., ATM withdrawal, Cash out"
                disabled={isLoading || !!success}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Optional note about this withdrawal
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <Wallet className="h-5 w-5" />
              {isLoading ? 'Processing...' : success ? 'Redirecting...' : 'Withdraw Funds'}
            </button>
            {!success && (
              <Link
                to="/dashboard"
                className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>

        {/* Quick Tips */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-3 font-semibold text-slate-900">Important Notes</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>Withdrawals are processed instantly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>You must have sufficient balance to complete the withdrawal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>Your balance will be updated immediately after withdrawal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>A description is optional but helps track your transactions</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
