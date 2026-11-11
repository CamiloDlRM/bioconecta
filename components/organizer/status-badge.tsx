import { cn } from '@/lib/utils'
import type { EventStatus } from '@/lib/types'

const STATUS: Record<EventStatus, { label: string; className: string }> = {
  publicado: { label: 'Publicado', className: 'bg-primary/12 text-primary' },
  borrador: { label: 'Borrador', className: 'bg-muted text-muted-foreground' },
  cancelado: { label: 'Cancelado', className: 'bg-coral-soft text-coral-ink' },
}

export function StatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  const s = STATUS[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold', s.className, className)}>
      {s.label}
    </span>
  )
}
