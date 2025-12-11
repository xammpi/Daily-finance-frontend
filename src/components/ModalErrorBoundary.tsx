import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { logger } from '@/utils/logger'

interface Props {
  children: ReactNode
  onError?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary specifically designed for modal components
 * Shows error UI within the modal instead of breaking the entire page
 */
export class ModalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Modal error caught by boundary', error, { errorInfo })
    this.props.onError?.()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">
            Something went wrong
          </h3>
          <p className="mb-4 text-sm text-slate-600">
            An unexpected error occurred in this component.
          </p>
          {this.state.error && (
            <div className="mb-4 max-w-md rounded-lg bg-slate-100 p-3">
              <p className="break-all text-xs font-mono text-slate-700">
                {this.state.error.message}
              </p>
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 font-medium text-white transition-transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
