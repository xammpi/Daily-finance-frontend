import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, PiggyBank, DollarSign, CheckCircle } from 'lucide-react'
import { userApi } from '@/api/user'
import Layout from '@/components/Layout'

export default function DepositPage() {
  const navigate = useNavigate()

  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const depositAmount = parseFloat(amount)

    if (depositAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    try {
      setIsLoading(true)
      const updatedUser = await userApi.deposit({ amount: depositAmount })
      setSuccess(
        `Successfully deposited ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: updatedUser.wallet.currency.code,
        }).format(depositAmount)}. New balance: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: updatedUser.wallet.currency.code,
        }).format(updatedUser.wallet.amount)}`
      )
      setAmount('')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deposit money')
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
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <PiggyBank className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Deposit Money</h1>
            <p className="mt-1 text-slate-600">Add funds to your account balance</p>
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
          {/* Info Card */}
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <p className="text-sm text-emerald-900">
              Add funds to your balance to track your expenses. The deposited amount will be immediately
              available in your account.
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <DollarSign className="h-4 w-4" />
              Amount to Deposit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0.00"
                disabled={isLoading || !!success}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Enter the amount you want to add to your balance
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <PiggyBank className="h-5 w-5" />
              {isLoading ? 'Processing...' : success ? 'Redirecting...' : 'Deposit Funds'}
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
          <h3 className="mb-3 font-semibold text-slate-900">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              <span>Deposits are processed instantly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              <span>Your balance will be updated immediately after deposit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              <span>Track your spending and deposits from the dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
