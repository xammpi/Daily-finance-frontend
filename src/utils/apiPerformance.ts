/**
 * API Performance Monitoring Utility
 * Tracks API response times and provides insights into backend performance
 * Based on backend optimization guide recommendations
 */

interface ApiCallMetrics {
  endpoint: string
  duration: number
  timestamp: Date
  success: boolean
}

class ApiPerformanceMonitor {
  private metrics: ApiCallMetrics[] = []
  private maxMetrics = 100 // Keep last 100 metrics

  /**
   * Track an API call and measure its performance
   * @param endpoint - API endpoint name (e.g., 'search_transactions')
   * @param fn - Async function to execute
   * @returns Result of the function
   */
  async track<T>(endpoint: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    let success = true

    try {
      const result = await fn()
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = performance.now() - start

      this.addMetric({
        endpoint,
        duration,
        timestamp: new Date(),
        success
      })

      // Log slow requests (>200ms)
      if (duration > 200) {
        console.warn(`⚠️ Slow API call: ${endpoint} took ${duration.toFixed(0)}ms`)
      } else if (duration < 100) {
        console.log(`⚡ Fast API call: ${endpoint} took ${duration.toFixed(0)}ms`)
      }
    }
  }

  /**
   * Add a metric to the history
   */
  private addMetric(metric: ApiCallMetrics): void {
    this.metrics.push(metric)

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * Get average response time for a specific endpoint
   */
  getAverageTime(endpoint?: string): number {
    const filtered = endpoint
      ? this.metrics.filter(m => m.endpoint === endpoint && m.success)
      : this.metrics.filter(m => m.success)

    if (filtered.length === 0) return 0

    const total = filtered.reduce((sum, m) => sum + m.duration, 0)
    return total / filtered.length
  }

  /**
   * Get 95th percentile response time
   */
  get95thPercentile(endpoint?: string): number {
    const filtered = endpoint
      ? this.metrics.filter(m => m.endpoint === endpoint && m.success)
      : this.metrics.filter(m => m.success)

    if (filtered.length === 0) return 0

    const sorted = filtered.map(m => m.duration).sort((a, b) => a - b)
    const index = Math.floor(sorted.length * 0.95)
    return sorted[index] || 0
  }

  /**
   * Get cache hit rate (calls < 20ms are likely cached)
   */
  getCacheHitRate(): number {
    const totalCalls = this.metrics.filter(m => m.success).length
    if (totalCalls === 0) return 0

    const cachedCalls = this.metrics.filter(m => m.success && m.duration < 20).length
    return (cachedCalls / totalCalls) * 100
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const successfulCalls = this.metrics.filter(m => m.success)
    const failedCalls = this.metrics.filter(m => !m.success)

    return {
      totalCalls: this.metrics.length,
      successfulCalls: successfulCalls.length,
      failedCalls: failedCalls.length,
      averageResponseTime: this.getAverageTime(),
      p95ResponseTime: this.get95thPercentile(),
      cacheHitRate: this.getCacheHitRate(),
      slowCalls: successfulCalls.filter(m => m.duration > 200).length
    }
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const summary = this.getSummary()

    console.group('📊 API Performance Summary')
    console.log(`Total API calls: ${summary.totalCalls}`)
    console.log(`Success rate: ${((summary.successfulCalls / summary.totalCalls) * 100).toFixed(1)}%`)
    console.log(`Average response time: ${summary.averageResponseTime.toFixed(0)}ms`)
    console.log(`95th percentile: ${summary.p95ResponseTime.toFixed(0)}ms`)
    console.log(`Cache hit rate: ${summary.cacheHitRate.toFixed(1)}%`)
    console.log(`Slow calls (>200ms): ${summary.slowCalls}`)
    console.groupEnd()
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
  }
}

// Export singleton instance
export const apiPerformance = new ApiPerformanceMonitor()

// Export for debugging in browser console
if (typeof window !== 'undefined') {
  ;(window as any).apiPerformance = apiPerformance
}
