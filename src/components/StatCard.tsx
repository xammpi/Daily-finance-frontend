import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  gradient: string
  textColor?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  textColor = 'text-white',
  onClick
}: StatCardProps) {
  const cardClasses = onClick
    ? 'cursor-pointer hover:-translate-y-2 transition-all duration-300'
    : 'transition-all duration-300'

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl ${cardClasses}`}
      onClick={onClick}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold opacity-90">{title}</span>
        </div>

        <p className={`truncate text-2xl font-bold ${textColor}`}>
          {value}
        </p>

        {subtitle && (
          <p className={`mt-2 text-xs font-medium opacity-90 ${textColor}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
