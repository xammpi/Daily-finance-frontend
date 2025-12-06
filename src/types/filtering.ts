/**
 * Generic Filtering, Sorting, and Pagination System
 *
 * This module provides a type-safe, reusable system for filtering, sorting,
 * and paginating any entity type in the application.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Filter field types supported by the system
 */
export type FilterType =
  | 'text'          // Text input (e.g., search by name)
  | 'number'        // Number input (e.g., amount)
  | 'date'          // Date input (e.g., transaction date)
  | 'dateRange'     // Date range (start & end dates)
  | 'select'        // Dropdown select (e.g., category)
  | 'multiSelect'   // Multiple selection
  | 'boolean'       // Checkbox/toggle
  | 'numberRange'   // Number range (min & max)

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Base filter parameters that apply to all entities
 */
export interface BaseFilterParams {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: SortDirection
}

/**
 * Generic paginated response
 */
export interface GenericPaginatedResponse<T> {
  content: T[]
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

// ============================================================================
// Filter Configuration
// ============================================================================

/**
 * Option for select/multiSelect filters
 */
export interface FilterOption {
  label: string
  value: string | number
}

/**
 * Quick filter preset (e.g., "Today", "This Week", "This Month")
 */
export interface QuickFilter<T extends BaseFilterParams> {
  label: string
  icon?: string
  getFilters: () => Partial<T>
}

/**
 * Configuration for a single filter field
 */
export interface FilterFieldConfig<T extends BaseFilterParams> {
  /**
   * Unique key for this filter (matches API parameter name)
   */
  key: keyof T

  /**
   * Display label for the filter
   */
  label: string

  /**
   * Type of filter input
   */
  type: FilterType

  /**
   * Placeholder text for input
   */
  placeholder?: string

  /**
   * Options for select/multiSelect types
   */
  options?: FilterOption[] | (() => Promise<FilterOption[]>)

  /**
   * Icon to display next to label
   */
  icon?: string

  /**
   * Default value
   */
  defaultValue?: any

  /**
   * Validation rules
   */
  validation?: {
    min?: number
    max?: number
    required?: boolean
    pattern?: RegExp
  }

  /**
   * For dateRange and numberRange types
   */
  rangeConfig?: {
    startKey: keyof T
    endKey: keyof T
    startLabel: string
    endLabel: string
  }

  /**
   * Grid column span (for responsive layout)
   */
  colSpan?: 1 | 2 | 3 | 4
}

/**
 * Configuration for sorting
 */
export interface SortConfig {
  /**
   * Available sort fields
   */
  fields: {
    key: string
    label: string
    defaultDirection?: SortDirection
  }[]

  /**
   * Default sort field
   */
  defaultField?: string

  /**
   * Default sort direction
   */
  defaultDirection?: SortDirection
}

/**
 * Complete filter configuration for an entity
 */
export interface FilterConfig<T extends BaseFilterParams> {
  /**
   * Filter fields configuration
   */
  fields: FilterFieldConfig<T>[]

  /**
   * Quick filter presets
   */
  quickFilters?: QuickFilter<T>[]

  /**
   * Sort configuration
   */
  sortConfig?: SortConfig

  /**
   * Pagination settings
   */
  pagination?: {
    defaultSize?: number
    sizeOptions?: number[]
  }

  /**
   * Search configuration (client-side search on results)
   */
  searchConfig?: {
    enabled: boolean
    placeholder?: string
    searchFields: (keyof T)[]
  }
}

// ============================================================================
// Filter State Management
// ============================================================================

/**
 * Current filter state
 */
export interface FilterState<T extends BaseFilterParams> {
  filters: T
  searchTerm: string
  showFilters: boolean
}

/**
 * Filter actions
 */
export interface FilterActions<T extends BaseFilterParams> {
  setFilter: (key: keyof T, value: any) => void
  setFilters: (filters: Partial<T>) => void
  clearFilters: () => void
  setSearchTerm: (term: string) => void
  toggleFilters: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (field: string, direction: SortDirection) => void
}

/**
 * Complete filter hook return type
 */
export interface UseFilterReturn<T extends BaseFilterParams, E> {
  // Data
  data: GenericPaginatedResponse<E> | null
  isLoading: boolean
  error: string | null

  // Filter state
  filters: T
  searchTerm: string
  showFilters: boolean

  // Actions
  setFilter: (key: keyof T, value: any) => void
  setFilters: (filters: Partial<T>) => void
  clearFilters: () => void
  setSearchTerm: (term: string) => void
  toggleFilters: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (field: string, direction: SortDirection) => void
  refresh: () => void

  // Computed
  hasActiveFilters: boolean
  filteredData: E[]
}

// ============================================================================
// API Function Type
// ============================================================================

/**
 * Generic API filter function signature
 */
export type FilterApiFn<T extends BaseFilterParams, E> = (
  params: T
) => Promise<GenericPaginatedResponse<E>>

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for FilterBuilder component
 */
export interface FilterBuilderProps<T extends BaseFilterParams> {
  config: FilterConfig<T>
  filters: T
  searchTerm: string
  showFilters: boolean
  onFilterChange: (key: keyof T, value: any) => void
  onFiltersChange: (filters: Partial<T>) => void
  onSearchChange: (term: string) => void
  onToggleFilters: () => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  isLoading?: boolean
}

/**
 * Props for PaginationControls component
 */
export interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalElements: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  sizeOptions?: number[]
  isFirst: boolean
  isLast: boolean
  hasNext: boolean
  hasPrevious: boolean
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Extract filter params from entity-specific filter type
 */
export type ExtractFilters<T extends BaseFilterParams> = Omit<T, keyof BaseFilterParams>

/**
 * Make all filter fields optional
 */
export type OptionalFilters<T> = {
  [K in keyof T]?: T[K]
}
