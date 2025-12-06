/**
 * Hook for displaying toast notifications
 */

import { useState, useCallback } from 'react'
import type { ToastType } from '@/components/Toast'

interface ToastOptions {
  message: string
  type: ToastType
  duration?: number
}

interface Toast extends ToastOptions {
  id: string
}

interface UseToastReturn {
  toasts: Toast[]
  showToast: (options: ToastOptions) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

/**
 * Hook for managing toast notifications
 *
 * @example
 * function MyComponent() {
 *   const { success, error } = useToast()
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData()
 *       success('Data saved successfully!')
 *     } catch (err) {
 *       error('Failed to save data')
 *     }
 *   }
 * }
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { ...options, id }

    setToasts((prev) => [...prev, toast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: 'success', duration })
    },
    [showToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: 'error', duration })
    },
    [showToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: 'warning', duration })
    },
    [showToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: 'info', duration })
    },
    [showToast]
  )

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  }
}
