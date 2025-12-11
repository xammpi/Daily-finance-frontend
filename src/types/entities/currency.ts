/**
 * Currency entity types
 */

/**
 * Currency entity
 * Represents a currency in the system with its code, name, and symbol
 */
export interface Currency {
  readonly id: number
  readonly code: string
  readonly name: string
  readonly symbol: string
}
