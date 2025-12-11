import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Wallet, User, Mail, Lock, UserPlus, ArrowLeft, Globe,
  Loader2, AlertCircle, ChevronDown, Check, Search, X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { currenciesApi } from '@/api/currencies'

import { logger } from '@/utils/logger'
// --- Types ---
interface RegisterFormData {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  currencyId: number | string
}

interface Currency {
  id: number
  code: string
  name: string
  symbol: string
}

// --- Custom Searchable Dropdown Component ---
interface CurrencySelectProps {
  currencies: Currency[]
  value: number | string
  onChange: (_id: number) => void
  loading: boolean
}

const CurrencySelect = ({ currencies, value, onChange, loading }: CurrencySelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Find selected currency object for display
  const selectedCurrency = currencies.find(c => c.id === value)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter currencies
  const filteredCurrencies = currencies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (id: number) => {
    onChange(id)
    setIsOpen(false)
    setSearchTerm('') // Optional: Reset search on select
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger Button (Looks like an input) */}
      <button
        type="button"
        id="currency-select"
        disabled={loading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
        } ${loading ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        aria-label="Select currency"
      >
        <span className={`block truncate ${!selectedCurrency ? 'text-slate-400' : 'text-slate-900'}`}>
          {loading
            ? "Loading currencies..."
            : selectedCurrency
              ? `${selectedCurrency.symbol} ${selectedCurrency.name} (${selectedCurrency.code})`
              : "Select a currency"
          }
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-100">

          {/* Search Input Sticky Header */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search USD, Euro..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                aria-label="Search currencies by name or code"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* List Options */}
          <ul className="max-h-60 overflow-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {filteredCurrencies.length === 0 ? (
              <li className="px-4 py-3 text-center text-sm text-slate-500">
                No currency found
              </li>
            ) : (
              filteredCurrencies.map((currency) => {
                const isSelected = currency.id === value
                return (
                  <li key={currency.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(currency.id)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-indigo-50 ${
                        isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-6 text-center font-mono text-xs text-slate-400 bg-slate-100 rounded px-1">
                          {currency.symbol}
                        </span>
                        {currency.name}
                        <span className="text-xs text-slate-400">({currency.code})</span>
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// --- Main Page Component ---
export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading: authLoading, error: authError, clearError } = useAuth()

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [currenciesLoading, setCurrenciesLoading] = useState(true)
  const [currencyError, setCurrencyError] = useState<string | null>(null)

  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    currencyId: ''
  })

  const [validationError, setValidationError] = useState('')

  // Fetch currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setCurrenciesLoading(true)
        const data = await currenciesApi.getAll()
        setCurrencies(data)
        setCurrencyError(null)
      } catch (err) {
        setCurrencyError('Failed to load currencies')
        logger.error('Error occurred', err)
      } finally {
        setCurrenciesLoading(false)
      }
    }
    void fetchCurrencies()
  }, [])

  // Auto-select USD logic
  useEffect(() => {
    if (currencies.length > 0 && formData.currencyId === '') {
      const defaultCurrency = currencies.find((c: Currency) => c.code === 'USD') || currencies[0]
      setFormData(prev => ({ ...prev, currencyId: defaultCurrency.id }))
    }
  }, [currencies, formData.currencyId])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (validationError) setValidationError('')
    if (authError) clearError()
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Specialized handler for the custom currency dropdown
  const handleCurrencyChange = (id: number) => {
    setFormData(prev => ({ ...prev, currencyId: id }))
    if (validationError) setValidationError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setValidationError('')
    clearError()

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long')
      return
    }

    if (!formData.currencyId) {
      setValidationError('Please select a valid currency')
      return
    }

    try {
      const { confirmPassword: _confirmPassword, currencyId, ...apiData } = formData
      await register({ ...apiData, currencyId: Number(currencyId) })
      navigate('/dashboard')
    } catch (err) {
      logger.error("Registration failed", err)
    }
  }

  const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
  const labelClasses = "mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
  const displayError = authError || validationError || currencyError

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md my-8">

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Daily Finance</h1>
          <p className="mt-2 text-slate-600">Start tracking your expenses today</p>
        </header>

        {/* Card */}
        <main className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="mt-1 text-sm text-slate-600">Enter your details below to sign up</p>
          </div>

          {displayError && (
            <div className="mb-6 flex animate-in fade-in slide-in-from-top-2 items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label htmlFor="username" className={labelClasses}><User className="h-4 w-4" /> Username</label>
              <input id="username" name="username" type="text" required autoComplete="username"
                     value={formData.username} onChange={handleChange} className={inputClasses} placeholder="Choose a username" />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClasses}><Mail className="h-4 w-4" /> Email Address</label>
              <input id="email" name="email" type="email" required autoComplete="email"
                     value={formData.email} onChange={handleChange} className={inputClasses} placeholder="you@example.com" />
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className={labelClasses}><User className="h-4 w-4" /> First Name</label>
                <input id="firstName" name="firstName" type="text" required autoComplete="given-name"
                       value={formData.firstName} onChange={handleChange} className={inputClasses} placeholder="John" />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClasses}><User className="h-4 w-4" /> Last Name</label>
                <input id="lastName" name="lastName" type="text" required autoComplete="family-name"
                       value={formData.lastName} onChange={handleChange} className={inputClasses} placeholder="Doe" />
              </div>
            </div>

            {/* Custom Currency Dropdown with Search */}
            <div>
              <label htmlFor="currency-select" className={labelClasses}>
                <Globe className="h-4 w-4" /> Currency
              </label>
              <CurrencySelect
                currencies={currencies}
                loading={currenciesLoading}
                value={formData.currencyId}
                onChange={handleCurrencyChange}
              />
              <p className="mt-2 text-xs text-slate-500">
                This will be the default currency for your dashboard.
              </p>
            </div>

            {/* Passwords */}
            <div>
              <label htmlFor="password" className={labelClasses}><Lock className="h-4 w-4" /> Password</label>
              <input id="password" name="password" type="password" required autoComplete="new-password"
                     value={formData.password} onChange={handleChange} className={inputClasses} placeholder="At least 6 characters" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClasses}><Lock className="h-4 w-4" /> Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password"
                     value={formData.confirmPassword} onChange={handleChange} className={inputClasses} placeholder="Confirm your password" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading || currenciesLoading}
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {authLoading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Creating account...</>
              ) : (
                <><UserPlus className="h-5 w-5 transition-transform group-hover:translate-x-1" /> Sign Up</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}