import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (_page: number) => void
  isFirst: boolean
  isLast: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isFirst,
  isLast
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(0)

      if (currentPage <= 3) {
        // Near the start: show 1 2 3 4 5 ... last
        for (let i = 1; i < 5; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages - 1)
      } else if (currentPage >= totalPages - 4) {
        // Near the end: show 1 ... 95 96 97 98 99
        pages.push('ellipsis')
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle: show 1 ... 5 6 7 ... 99
        pages.push('ellipsis')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('ellipsis')
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {/* First page button */}
      <button
        onClick={() => onPageChange(0)}
        disabled={isFirst}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Go to first page"
        title="First page"
      >
        <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Go to previous page"
        title="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-slate-400"
            >
              ...
            </span>
          )
        }

        const isActive = page === currentPage

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-3 font-medium transition-colors ${
              isActive
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            aria-label={`${isActive ? 'Current page, ' : ''}Go to page ${page + 1}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page + 1}
          </button>
        )
      })}

      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Go to next page"
        title="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Last page button */}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={isLast}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Go to last page"
        title="Last page"
      >
        <ChevronsRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
