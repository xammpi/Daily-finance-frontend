/**
 * Custom hook for common modal behavior
 * Handles body scroll prevention, focus management, and keyboard interactions
 */

import { useEffect, RefObject } from 'react'

interface UseModalBehaviorOptions {
  isOpen: boolean
  onClose: () => void
  modalRef: RefObject<HTMLDivElement | null>
  firstInputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
}

/**
 * Provides common modal behaviors:
 * - Prevents body scroll when modal is open
 * - Auto-focuses first input on open
 * - Closes modal on Escape key
 * - Implements focus trap with Tab key navigation
 */
export function useModalBehavior({
  isOpen,
  onClose,
  modalRef,
  firstInputRef,
}: UseModalBehaviorOptions) {
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

  // Focus management and keyboard handling
  useEffect(() => {
    if (!isOpen) return

    // Autofocus first input when modal opens
    const focusTimer = setTimeout(() => {
      firstInputRef.current?.focus()
    }, 100)

    // Handle Escape key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Focus trap: keep focus within modal
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        // Shift+Tab on first element: go to last
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        // Tab on last element: go to first
        e.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTabKey)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTabKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
}
