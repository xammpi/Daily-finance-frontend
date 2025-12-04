import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wallet, User, Mail, Lock, UserPlus, ArrowLeft, Globe } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { SUPPORTED_CURRENCIES } from '@/types'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currencyId, setCurrencyId] = useState(1) // Default to USD
  const [validationError, setValidationError] = useState('')
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError('')

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long')
      return
    }

    try {
      await register({ username, email, password, firstName, lastName, currencyId })
      navigate('/dashboard')
    } catch (err) {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Daily Finance</h1>
          <p className="mt-2 text-slate-600">Start tracking your expenses today</p>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="mt-1 text-sm text-slate-600">Sign up to get started with Daily Finance</p>
          </div>

          {(error || validationError) && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                <span className="text-xs font-bold">!</span>
              </div>
              <p className="text-sm font-medium">{error || validationError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User className="h-4 w-4" />
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4" />
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4" />
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currency" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Globe className="h-4 w-4" />
                Currency
              </label>
              <select
                id="currency"
                required
                value={currencyId}
                onChange={(e) => setCurrencyId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Select your preferred currency for tracking expenses
              </p>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <Lock className="h-4 w-4" />
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <UserPlus className="h-5 w-5" />
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Join thousands of users tracking their expenses</p>
        </div>
      </div>
    </div>
  )
}
