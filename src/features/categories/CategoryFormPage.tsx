import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Tag, Save } from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import Layout from '@/components/Layout'
import type { Category } from '@/types'

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setIsFetching(true)

      if (id) {
        const category: Category = await categoriesApi.getById(Number(id))
        setName(category.name)
        setDescription(category.description || '')
      }
    } catch (err) {
      setError('Failed to load category data')
      console.error(err)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const categoryData = {
      name,
      description: description || undefined,
    }

    try {
      setIsLoading(true)
      if (isEditMode) {
        await categoriesApi.update(Number(id), categoryData)
      } else {
        await categoriesApi.create(categoryData)
      }
      navigate('/categories')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="text-slate-600">Loading category...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back Button */}
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <Tag className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditMode ? 'Edit Category' : 'New Category'}
            </h1>
            <p className="mt-1 text-slate-600">
              {isEditMode
                ? 'Update your category details'
                : 'Create a new category to organize your expenses'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g., Groceries, Transportation, Entertainment"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Add a brief description for this category..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <Save className="h-5 w-5" />
              {isLoading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
            </button>
            <Link
              to="/categories"
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}
