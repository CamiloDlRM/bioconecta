import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EventCard } from '@/components/events/event-card'
import type { EventItem } from '@/lib/types'

export function ThisWeek({ events, isFallback }: { events: EventItem[]; isFallback: boolean }) {
  return (
    <section aria-labelledby="esta-semana" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="esta-semana" className="font-display text-3xl font-semibold text-balance sm:text-4xl">
            {isFallback ? 'Próximos eventos en Barranquilla' : 'Esta semana en Barranquilla'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isFallback
              ? 'Aún no hay eventos esta semana; mira lo que viene.'
              : 'Planes para los próximos siete días. Los cupos vuelan.'}
          </p>
        </div>
        <Link
          href="/eventos"
          className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Ver todos los eventos <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <li key={event.id}>
            <EventCard event={event} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  )
}
