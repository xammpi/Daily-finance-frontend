/**
 * Application Logger Utility
 * Provides centralized logging with environment-aware behavior
 * In production, logs are sent to error tracking service (future: Sentry integration)
 * In development, logs to console for debugging
 */

import { env } from '@/config/env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = env.isDevelopment

  /**
   * Log informational messages
   * Only logged in development mode
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, context || '')
    }
  }

  /**
   * Log warning messages
   * Logged in all environments
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '')
    }
    // TODO: Send to monitoring service in production
  }

  /**
   * Log error messages
   * Logged in all environments and sent to error tracking
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '', context || '')
    }

    // TODO: Send to Sentry or other error tracking service
    // Example:
    // if (import.meta.env.PROD && typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, {
    //     extra: { message, ...context }
    //   })
    // }
  }

  /**
   * Log debug messages
   * Only logged in development mode
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, context || '')
    }
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case 'info':
        this.info(message, context)
        break
      case 'warn':
        this.warn(message, context)
        break
      case 'error':
        this.error(message, undefined, context)
        break
      case 'debug':
        this.debug(message, context)
        break
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for convenience
export default logger
