import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EventMap } from '@/components/map/lazy-maps'
import { EVENT_TYPE_LIST } from '@/lib/event-types'
import type { EventItem } from '@/lib/types'

export function MapPreview({ events }: { events: EventItem[] }) {
  return (
    <section aria-labelledby="mapa-eventos" className="border-t border-border bg-muted/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center gap-4">
          <h2 id="mapa-eventos" className="font-display text-3xl font-semibold text-balance sm:text-4xl">
            Mira qué pasa cerca de ti
          </h2>
          <p className="text-pretty text-muted-foreground">
            Del Ecoparque Ciénaga de Mallorquín al Malecón del Río: cada marcador es un evento próximo. También puedes
            ver la lista con direcciones.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Leyenda del mapa">
            {EVENT_TYPE_LIST.map((t) => (
              <li key={t.value} className="flex items-center gap-2 text-sm">
                <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label}
              </li>
            ))}
          </ul>
          <Link
            href="/eventos?vista=mapa"
            className="inline-flex min-h-9 w-fit items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
          >
            Abrir el mapa completo <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <EventMap events={events} className="h-96 overflow-hidden rounded-2xl border border-border" />
      </div>
    </section>
  )
}
