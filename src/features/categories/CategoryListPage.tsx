import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Search,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import Layout from '@/components/Layout'

import { Category } from '@/types/category.ts'
import { CategoryType } from '@/types/category'
import CategoryModal from '@/components/CategoryModal.tsx'

const categoryColors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-amber-500 to-amber-600',
  'from-yellow-500 to-yellow-600',
  'from-lime-500 to-lime-600',
  'from-green-500 to-green-600',
  'from-emerald-500 to-emerald-600',
  'from-teal-500 to-teal-600',
  'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600',
]

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategory] = useState<number | undefined>(undefined)

  const handleOpenModal = (categoryId?: number) => {
    setEditingCategory(categoryId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(undefined)
  }

  const handleModalSuccess = () => {
    fetchCategories()
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err) {
      setError('Failed to load categories')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      await categoriesApi.delete(id)
      fetchCategories()
    } catch (err: any) {
      console.error(err)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length]
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="text-slate-600">Loading categories...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <FolderOpen className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
            <p className="mt-1 text-slate-600">
              {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FolderOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mb-2 text-lg font-medium text-slate-900">
              {searchTerm ? 'No categories found' : 'No categories yet'}
            </p>
            <p className="mb-6 text-slate-500">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create categories to organize your finances'}
            </p>
            {!searchTerm && (
              <Link
                to="/categories/new"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
                Create Your First Category
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
              >
                {/* Color accent */}
                <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${getCategoryColor(index)}`} />

                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getCategoryColor(index)} shadow-lg`}>
                        <Tag className="h-6 w-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{category.name}</h3>

                          {/* --- NEW: Transaction Type Badge --- */}
                          {category.type === CategoryType.INCOME ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              <TrendingUp className="h-3 w-3" />
                              Income
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                              <TrendingDown className="h-3 w-3" />
                              Expense
                            </span>
                          )}
                          {/* ----------------------------------- */}

                        </div>
                        {category.description && (
                          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenModal(category.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-50 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        categoryId={editingCategoryId}
      />
    </Layout>
  )
}