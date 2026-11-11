import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { EventCover } from '@/components/events/event-cover'
import { TypeBadge } from '@/components/events/type-badge'
import { buttonVariants } from '@/components/ui/button'
import { EVENT_TYPE_LIST } from '@/lib/event-types'
import { formatEventDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EventItem } from '@/lib/types'

const fieldClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function Hero({ featured }: { featured: EventItem[] }) {
  const [a, b] = featured

  return (
    <section aria-labelledby="hero-title" className="contour-bg relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Barranquilla y el Caribe colombiano
          </p>
          <h1
            id="hero-title"
            className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Todos los eventos por la biodiversidad, en un solo lugar
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Charlas, talleres, siembras de manglar, limpiezas de playa y voluntariados. Encuéntralos, inscríbete y recibe
            un recordatorio, sin rebuscar en Instagram ni en cadenas de WhatsApp.
          </p>

          <form
            action="/eventos"
            method="get"
            role="search"
            aria-label="Buscar eventos"
            className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <label htmlFor="hero-q" className="sr-only">
                Buscar por nombre, lugar u organizador
              </label>
              <input id="hero-q" name="q" type="search" placeholder="Busca por tema, lugar u organizador" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="hero-tipo" className="sr-only">
                Tipo de evento
              </label>
              <select id="hero-tipo" name="tipo" defaultValue="" className={cn(fieldClass, 'sm:w-52')}>
                <option value="">Todos los tipos</option>
                {EVENT_TYPE_LIST.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl')}>
              <Search aria-hidden="true" />
              Buscar
            </button>
          </form>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-muted-foreground">O explora por tipo de actividad</p>
            <ul className="flex flex-wrap gap-2">
              {EVENT_TYPE_LIST.map((t) => {
                const Icon = t.icon
                return (
                  <li key={t.value}>
                    <Link
                      href={`/eventos?tipo=${t.value}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <Icon className="size-4" style={{ color: t.inkVar }} aria-hidden="true" />
                      {t.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {a && (
          <div aria-label="Próximos eventos destacados" role="group" className="relative mx-auto hidden w-full max-w-md grid-cols-2 items-end gap-4 lg:grid">
            {[a, b].filter(Boolean).map((event, i) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                className={cn(
                  'group flex flex-col gap-3 rounded-t-[999px] rounded-b-2xl border border-border bg-card p-2 pb-4 shadow-sm transition-shadow hover:shadow-md',
                  i === 1 && 'mb-10',
                )}
              >
                <EventCover event={event} className="aspect-[3/4] w-full rounded-t-[999px] rounded-b-xl" />
                <div className="flex flex-col items-start gap-1.5 px-2">
                  <TypeBadge type={event.eventType} />
                  <span className="font-display text-base leading-snug font-semibold text-balance group-hover:underline">
                    {event.title}
                  </span>
                  <span className="text-sm text-muted-foreground">{formatEventDate(event.startsAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:hidden">
        <Link href="/eventos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Ver todos los eventos <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
