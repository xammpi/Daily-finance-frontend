/**
 * Category API types
 * Request and response types for category endpoints
 */

import type { CategoryType } from '..'

/**
 * Category creation/update request payload
 * @endpoint POST /api/v1/categories
 * @endpoint PUT /api/v1/categories/{id}
 */
export interface CategoryRequest {
  readonly name: string
  readonly description?: string
  readonly type: CategoryType
}
