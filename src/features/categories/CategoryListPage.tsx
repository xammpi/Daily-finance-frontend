import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Search,
  TrendingUp,
  TrendingDown,
  Filter,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import { CriteriaBuilder } from '@/utils/CriteriaBuilder'
import { Category } from '@/types'
import { CategoryType } from '@/types'
import type { PaginatedResponse } from '@/types'
import CategoryModal from '@/components/CategoryModal.tsx'
import ConfirmDialog from '@/components/ConfirmDialog'
import { extractErrorMessage } from '@/utils/errorHandler'
import { toast } from '@/lib/toast'
import { useDebounce } from '@/hooks'
import { SEARCH_MIN_CHARACTERS, DEFAULT_PAGE_SIZE_CATEGORIES } from '@/constants'

import { logger } from '@/utils/logger'
const categoryColors = [
  { gradient: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700' },
  { gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
  { gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
  { gradient: 'from-violet-500 to-fuchsia-600', bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700' },
  { gradient: 'from-slate-500 to-blue-600', bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-700' },
  { gradient: 'from-blue-600 to-cyan-600', bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700' },
  { gradient: 'from-indigo-600 to-blue-700', bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-700' },
  { gradient: 'from-purple-600 to-pink-600', bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700' },
  { gradient: 'from-violet-600 to-purple-700', bg: 'bg-violet-600', light: 'bg-violet-50', text: 'text-violet-700' },
  { gradient: 'from-blue-500 to-purple-600', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
  { gradient: 'from-indigo-600 to-violet-700', bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-700' },
  { gradient: 'from-slate-600 to-indigo-700', bg: 'bg-slate-600', light: 'bg-slate-50', text: 'text-slate-700' },
]

// Filter interface for categories
interface CategoryFilterParams {
  type?: CategoryType
  page?: number
  size?: number
}

export default function CategoryListPage() {
  const navigate = useNavigate()
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Category> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategory] = useState<number | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  // Filter state
  const [filters, setFilters] = useState<CategoryFilterParams>({
    type: undefined,
    page: 0,
    size: DEFAULT_PAGE_SIZE_CATEGORIES
  })

  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'createdAt'>('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')

  // Text search state
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const handleOpenModal = (categoryId?: number) => {
    setEditingCategory(categoryId)
    setIsModalOpen(true)
  }

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/transactions?category=${categoryId}`)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(undefined)
  }

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build search criteria
      const builder = new CriteriaBuilder()

      // Add text search on name if search term exists
      if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= SEARCH_MIN_CHARACTERS) {
        builder.like('name', debouncedSearchTerm.trim())
      }

      // Add type filter if selected
      if (filters.type) {
        builder.equals('type', filters.type)
      }

      const searchRequest = builder.buildRequest({
        page: filters.page ?? 0,
        size: filters.size ?? DEFAULT_PAGE_SIZE_CATEGORIES,
        sortBy: sortBy,
        sortOrder: sortOrder
      })

      const data = await categoriesApi.search(searchRequest)
      setPaginatedData(data)
    } catch (err) {
      setError('Failed to load categories')
      logger.error('Error occurred', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters.type, filters.page, filters.size, sortBy, sortOrder, debouncedSearchTerm])

  const handleModalSuccess = async () => {
    await fetchCategories()
  }

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  const handleDelete = (id: number, name: string) => {
    setDeleteTarget({ id, name })
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await categoriesApi.delete(deleteTarget.id)
      toast.success('Category deleted successfully')
      await fetchCategories()
    } catch (err) {
      logger.error('Failed to delete category', err)
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleTypeFilter = (type?: CategoryType) => {
    setFilters((prev: CategoryFilterParams) => ({ ...prev, type, page: 0 }))
  }

  const clearFilters = () => {
    setSearchTerm('') // useDebounce hook will automatically update debouncedSearchTerm
    setFilters({
      type: undefined,
      page: 0,
      size: filters.size
    })
    setShowFilters(false)
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev: CategoryFilterParams) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newSize: number) => {
    setFilters((prev: CategoryFilterParams) => ({ ...prev, size: newSize, page: 0 }))
  }

  // Get categories from paginated data
  const categories = paginatedData?.content || []

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length]
  }

  const getCategoryTypeConfig = (type: CategoryType) => {
    if (type === CategoryType.INCOME) {
      return {
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Income'
      }
    }
    return {
      icon: TrendingDown,
      gradient: 'from-red-500 to-orange-600',
      bg: 'bg-red-500',
      light: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Expense'
    }
  }

  const hasActiveFilters = (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2) || filters.type

  if (isLoading && !paginatedData) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" aria-hidden="true" />
            <p className="text-slate-600">Loading categories...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center" role="alert" aria-live="assertive">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100" aria-hidden="true">
              <FolderOpen className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout onAddTransaction={() => handleOpenModal()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-8 text-white shadow-2xl">
          {/* Decorative Circles */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                <FolderOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Categories</h1>
                <p className="mt-1 text-sm text-white/90">
                  {paginatedData?.totalElements || 0} categor{paginatedData?.totalElements !== 1 ? 'ies' : 'y'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search categories (min 2 characters)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setFilters((prev: CategoryFilterParams) => ({ ...prev, page: 0 }))
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Search categories by name or description"
              />
              {searchTerm.trim() && searchTerm.trim().length < 2 && (
                <div className="absolute left-0 top-full mt-1 rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-700 shadow-sm">
                  Enter at least 2 characters to search
                </div>
              )}
            </div>

            {/* Filter and Sort Controls - Horizontal Scroll on Mobile */}
            <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:overflow-x-visible md:px-0">
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-xl border px-4 py-3 font-medium transition-colors md:px-6 ${
                    showFilters || hasActiveFilters
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="h-5 w-5" />
                  <span className="whitespace-nowrap">Filters</span>
                  {hasActiveFilters && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                      {[
                        debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2 ? debouncedSearchTerm : null,
                        filters.type
                      ].filter(Boolean).length}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'createdAt')}
                  className="flex-shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:px-4"
                >
                  <option value="name">Sort by Name</option>
                  <option value="type">Sort by Type</option>
                  <option value="createdAt">Sort by Date</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                  className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 md:px-4"
                  title={sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'ASC' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Filter className="h-5 w-5" />
                  Filter Categories
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Filter Buttons - Horizontal Scroll on Mobile */}
              <div className="mb-4 -mx-6 overflow-x-auto px-6 scrollbar-hide">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTypeFilter(undefined)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      !filters.type
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All Categories
                  </button>
                  <button
                    onClick={() => handleTypeFilter(CategoryType.INCOME)}
                    className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      filters.type === CategoryType.INCOME
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Income
                  </button>
                  <button
                    onClick={() => handleTypeFilter(CategoryType.EXPENSE)}
                    className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      filters.type === CategoryType.EXPENSE
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-red-50'
                    }`}
                  >
                    <TrendingDown className="h-4 w-4" />
                    Expense
                  </button>
                </div>
              </div>

              {/* Filter Inputs */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Page Size */}
                <div>
                  <label htmlFor="pageSize" className="mb-2 block text-sm font-medium text-slate-700">
                    Per Page
                  </label>
                  <select
                    id="pageSize"
                    value={filters.size}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="12">12 per page</option>
                    <option value="24">24 per page</option>
                    <option value="48">48 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display & Clear */}
              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 p-3">
                  <div className="text-sm text-indigo-900">
                    <span className="font-medium">Active filters applied</span>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-16 text-center shadow-xl">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20" />

            <div className="relative">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
                <FolderOpen className="h-12 w-12 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">
                {searchTerm || hasActiveFilters ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="mb-8 text-base text-slate-600">
                {searchTerm || hasActiveFilters
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                  : 'Start organizing your transactions by creating your first category'}
              </p>
              {!searchTerm && !hasActiveFilters && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Category
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => {
                const color = getCategoryColor(index)
                const typeConfig = getCategoryTypeConfig(category.type)
                const TypeIcon = typeConfig.icon

                return (
                  <div
                    key={category.id}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Gradient Header - Clickable */}
                    <div
                      onClick={() => handleCategoryClick(category.id)}
                      className={`relative h-32 bg-gradient-to-br ${color.gradient} p-6 cursor-pointer`}
                    >
                      <div className="absolute inset-0 bg-black/5" />
                      <div className="relative flex h-full flex-col justify-between">
                        {/* Category Type Badge */}
                        <div className="flex justify-end">
                          <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${typeConfig.text}`}>
                            <TypeIcon className="h-3.5 w-3.5" />
                            {typeConfig.label}
                          </span>
                        </div>

                        {/* Category Icon */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                          <Tag className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div
                        onClick={() => handleCategoryClick(category.id)}
                        className="cursor-pointer"
                      >
                        <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                          {category.name}
                        </h3>

                        {category.description ? (
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                            {category.description}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm italic text-slate-400">
                            No description
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex gap-2">
                        <button
                          onClick={() => handleOpenModal(category.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
                          aria-label={`Edit ${category.name} category`}
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-100"
                          aria-label={`Delete ${category.name} category`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {paginatedData && paginatedData.totalPages > 1 && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-center">
                  <Pagination
                    currentPage={paginatedData.currentPage}
                    totalPages={paginatedData.totalPages}
                    onPageChange={handlePageChange}
                    isFirst={paginatedData.first}
                    isLast={paginatedData.last}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">
                    Page {paginatedData.currentPage + 1} of {paginatedData.totalPages}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    {categories.length} of {paginatedData.totalElements} categories
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        categoryId={editingCategoryId}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deleteTarget?.name}"?\n\nThis action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        variant="danger"
      />
    </Layout>
  )
}