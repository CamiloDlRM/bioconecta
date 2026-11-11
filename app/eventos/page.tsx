import type { Metadata } from 'next'
import { SearchX } from 'lucide-react'
import { EventCard } from '@/components/events/event-card'
import { EventsMapView } from '@/components/events/events-map-view'
import { FiltersPanel } from '@/components/events/filters-panel'
import { ViewToggle } from '@/components/events/view-toggle'
import { getCities, getEvents } from '@/lib/data'
import { countActiveFilters, parseFilters, parseView, type SearchParams } from '@/lib/filters'
import { Suspense } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Eventos',
  description:
    'Explora charlas, talleres, siembras, limpiezas y voluntariados por la biodiversidad en Barranquilla y el Atlántico.',
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const filters = parseFilters(sp)
  const view = parseView(sp)
  const [events, cities] = await Promise.all([getEvents(filters), getCities()])
  const activeCount = countActiveFilters(filters)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-balance">Eventos por la biodiversidad</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Encuentra tu próxima jornada de siembra, charla o limpieza en Barranquilla y alrededores.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <FiltersPanel filters={filters} cities={cities} activeCount={activeCount} resultCount={events.length} />

        <section aria-label="Resultados" className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p role="status" aria-live="polite" className="font-medium">
              {events.length === 0
                ? 'Sin resultados'
                : `${events.length} ${events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`}
            </p>
            <Suspense fallback={null}>
              <ViewToggle view={view} />
            </Suspense>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <SearchX className="size-7" aria-hidden="true" />
              </span>
              <h2 className="font-display text-2xl font-semibold">No encontramos eventos con esos filtros</h2>
              <p className="max-w-md text-pretty text-muted-foreground">
                Prueba ampliando las fechas, quitando algún tipo de evento o revisando la ortografía de tu búsqueda.
              </p>
              {activeCount > 0 && (
                <Link href="/eventos" className={cn(buttonVariants({ variant: 'outline' }))}>
                  Quitar todos los filtros
                </Link>
              )}
            </div>
          ) : view === 'mapa' ? (
            <EventsMapView events={events} />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
