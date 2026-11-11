import { Users } from 'lucide-react'
import { getCapacity } from '@/lib/capacity'
import { cn } from '@/lib/utils'
import type { EventItem } from '@/lib/types'

interface CapacityBarProps {
  event: Pick<EventItem, 'capacity' | 'registeredCount'>
  className?: string
  /** Muestra el detalle "12 de 40 inscritos" bajo la barra. */
  showCounts?: boolean
}

export function CapacityBar({ event, className, showCounts = false }: CapacityBarProps) {
  const info = getCapacity(event)

  const tone =
    info.state === 'agotado' || info.state === 'ultimos' ? 'text-coral-ink' : 'text-muted-foreground'
  const fill = info.state === 'agotado' || info.state === 'ultimos' ? 'bg-coral' : 'bg-secondary'

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <p className={cn('flex items-center gap-1.5 text-sm font-semibold', tone)}>
        <Users className="size-4 shrink-0" aria-hidden="true" />
        {info.label}
      </p>
      {event.capacity !== null && (
        <>
          <div
            role="progressbar"
            aria-label="Cupos ocupados"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={info.percent}
            aria-valuetext={`${event.registeredCount} de ${event.capacity} cupos ocupados`}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div className={cn('h-full rounded-full', fill)} style={{ width: `${info.percent}%` }} />
          </div>
          {showCounts && (
            <p className="text-sm text-muted-foreground">
              {event.registeredCount} de {event.capacity} personas inscritas
            </p>
          )}
        </>
      )}
    </div>
  )
}
