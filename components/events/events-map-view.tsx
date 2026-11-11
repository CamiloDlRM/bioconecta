import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { TypeBadge } from '@/components/events/type-badge'
import { EventMap } from '@/components/map/lazy-maps'
import { formatEventDate } from '@/lib/format'
import type { EventItem } from '@/lib/types'

export function EventsMapView({ events }: { events: EventItem[] }) {
  const mappable = events.filter((e) => e.latitude !== null && e.longitude !== null)
  const withoutLocation = events.length - mappable.length

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div>
        <EventMap events={mappable} className="h-[28rem] overflow-hidden rounded-2xl border border-border md:h-[36rem]" />
        {withoutLocation > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {withoutLocation} {withoutLocation === 1 ? 'evento no tiene' : 'eventos no tienen'} ubicación en el mapa (por
            ejemplo, los virtuales); los encuentras en la lista.
          </p>
        )}
      </div>

      <section aria-labelledby="direcciones" className="rounded-2xl border border-border bg-card p-4">
        <h2 id="direcciones" className="font-display text-lg font-semibold">
          Direcciones de los eventos
        </h2>
        <ul className="mt-3 flex max-h-[32rem] flex-col divide-y divide-border overflow-y-auto">
          {events.map((event) => (
            <li key={event.id} className="py-3 first:pt-0 last:pb-0">
              <TypeBadge type={event.eventType} />
              <Link
                href={`/eventos/${event.slug}`}
                className="mt-1.5 block font-semibold underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {event.title}
              </Link>
              <p className="text-sm text-muted-foreground">{formatEventDate(event.startsAt)}</p>
              <p className="mt-0.5 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {event.modality === 'virtual'
                  ? 'Evento virtual'
                  : [event.venueName, event.address, event.city].filter(Boolean).join(', ')}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
