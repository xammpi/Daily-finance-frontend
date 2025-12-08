import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Something went wrong
            </h2>
            <p className="text-slate-600 mb-6 text-center">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-700 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-105 transition-transform"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
