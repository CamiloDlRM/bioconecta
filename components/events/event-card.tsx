import Link from 'next/link'
import { CalendarDays, MapPin, Monitor, Building2 } from 'lucide-react'
import { EventCover } from '@/components/events/event-cover'
import { CapacityBar } from '@/components/events/capacity-bar'
import { TypeBadge } from '@/components/events/type-badge'
import { formatEventDate } from '@/lib/format'
import { MODALITY_LABELS } from '@/lib/event-types'
import { cn } from '@/lib/utils'
import type { EventItem } from '@/lib/types'

interface EventCardProps {
  event: EventItem
  className?: string
  /** Variante horizontal compacta para carruseles. */
  headingLevel?: 'h2' | 'h3'
}

export function EventCard({ event, className, headingLevel: Heading = 'h3' }: EventCardProps) {
  const place =
    event.modality === 'virtual' ? 'Evento virtual' : [event.venueName, event.city].filter(Boolean).join(' · ')

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:ring-3 focus-within:ring-ring/50 hover:shadow-md',
        className,
      )}
    >
      <div className="relative">
        <EventCover event={event} className="aspect-[16/9] w-full" />
        {event.isFree && (
          <span className="absolute top-3 right-3 rounded-full bg-card px-2.5 py-0.5 text-sm font-semibold text-primary shadow-sm">
            Gratis
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={event.eventType} />
          {event.modality !== 'presencial' && (
            <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
              <Monitor className="size-3.5" aria-hidden="true" />
              {MODALITY_LABELS[event.modality]}
            </span>
          )}
        </div>

        <Heading className="font-display text-xl leading-snug font-semibold text-balance">
          <Link
            href={`/eventos/${event.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {event.title}
          </Link>
        </Heading>

        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-secondary dark:text-primary" aria-hidden="true" />
            <span>
              <span className="sr-only">Fecha: </span>
              <time dateTime={event.startsAt}>{formatEventDate(event.startsAt)}</time>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-secondary dark:text-primary" aria-hidden="true" />
            <span>
              <span className="sr-only">Lugar: </span>
              {place}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-4 shrink-0 text-secondary dark:text-primary" aria-hidden="true" />
            <span>
              <span className="sr-only">Organiza: </span>
              {event.organizerName}
            </span>
          </li>
        </ul>

        <CapacityBar event={event} className="mt-auto pt-1" />
      </div>
    </article>
  )
}
