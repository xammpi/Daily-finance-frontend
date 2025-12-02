import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userApi } from '@/api/user'

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
          currency: updatedUser.currency,
        }).format(depositAmount)}. New balance: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: updatedUser.currency,
        }).format(updatedUser.balance)}`
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Deposit Money</h1>
          <p className="text-gray-600 mt-1">Add funds to your balance</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Deposit
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
              disabled={isLoading || !!success}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the amount you want to add to your balance
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : success ? 'Redirecting...' : 'Deposit Funds'}
            </button>
            {!success && (
              <Link
                to="/dashboard"
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-center transition-colors"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>

        <div className="mt-6">
          <Link
            to="/dashboard"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
