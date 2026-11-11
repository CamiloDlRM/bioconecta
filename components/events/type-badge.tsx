import { EVENT_TYPES } from '@/lib/event-types'
import { cn } from '@/lib/utils'
import type { EventType } from '@/lib/types'

interface TypeBadgeProps {
  type: EventType
  className?: string
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const meta = EVENT_TYPES[type]
  const Icon = meta.icon
  return (
    <span
      className={cn('inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold', className)}
      style={{
        color: meta.inkVar,
        backgroundColor: `color-mix(in srgb, ${meta.cssVar} 16%, var(--card))`,
      }}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
