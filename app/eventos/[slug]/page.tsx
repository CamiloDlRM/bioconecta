import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  Info,
  Mail,
  MapPin,
  Monitor,
  Navigation,
  Ticket,
  User,
} from 'lucide-react'
import { CapacityBar } from '@/components/events/capacity-bar'
import { EventCover } from '@/components/events/event-cover'
import { RegistrationCard } from '@/components/events/registration-card'
import { TypeBadge } from '@/components/events/type-badge'
import { EventMap } from '@/components/map/lazy-maps'
import { FootprintCard } from '@/components/sustainability/footprint-card'
import { buttonVariants } from '@/components/ui/button'
import { getCurrentProfile, getEventBySlug, getMyRegistrationForEvent } from '@/lib/data'
import { googleCalendarUrl, icsPath } from '@/lib/calendar'
import { MODALITY_LABELS } from '@/lib/event-types'
import { formatDuration, formatEventRange, formatLongDate, isPast } from '@/lib/format'
import { cn } from '@/lib/utils'

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return { title: 'Evento no encontrado' }
  return { title: event.title, description: event.summary }
}

function Fact({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="font-medium text-pretty">{children}</dd>
      </div>
    </div>
  )
}

export default async function EventDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const [profile, registration] = await Promise.all([getCurrentProfile(), getMyRegistrationForEvent(event.id)])

  const hasCoords = event.latitude !== null && event.longitude !== null
  const directionsUrl = hasCoords
    ? `https://www.openstreetmap.org/directions?route=${encodeURIComponent(`;${event.latitude},${event.longitude}`)}`
    : null
  const address = [event.venueName, event.address, event.city].filter(Boolean).join(', ')
  const priceText = event.isFree ? 'Gratis' : (event.priceInfo ?? 'Con costo')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/eventos"
        className="mb-5 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a eventos
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <article className="flex min-w-0 flex-col gap-8">
          <EventCover event={event} className="aspect-[16/8] w-full overflow-hidden rounded-3xl" />

          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={event.eventType} />
              <span className="rounded-full border border-border px-3 py-0.5 text-sm font-medium">
                {MODALITY_LABELS[event.modality]}
              </span>
              {event.isDemo && (
                <span className="rounded-full bg-muted px-3 py-0.5 text-sm font-medium text-muted-foreground">
                  Evento de demostración
                </span>
              )}
              {event.status === 'cancelado' && (
                <span className="rounded-full bg-coral-soft px-3 py-0.5 text-sm font-semibold text-coral-ink">Cancelado</span>
              )}
            </div>
            <h1 className="font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl">{event.title}</h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4" aria-hidden="true" />
              Organiza <span className="font-semibold text-foreground">{event.organizerName}</span>
            </p>
            <p className="text-lg leading-relaxed text-pretty">{event.summary}</p>
          </header>

          <dl className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
            <Fact icon={CalendarDays} label="Fecha y hora">
              <span className="capitalize">{formatLongDate(event.startsAt)}</span>
              <br />
              <span className="text-sm font-normal text-muted-foreground">
                {formatEventRange(event.startsAt, event.endsAt)}
              </span>
            </Fact>
            <Fact icon={Clock} label="Duración">
              {formatDuration(event.startsAt, event.endsAt)}
            </Fact>
            <Fact icon={event.modality === 'virtual' ? Monitor : MapPin} label="Lugar">
              {event.modality === 'virtual' ? 'Evento virtual' : address || event.city}
            </Fact>
            <Fact icon={Ticket} label="Costo">
              {priceText}
            </Fact>
          </dl>

          <section aria-labelledby="sobre-evento" className="flex flex-col gap-3">
            <h2 id="sobre-evento" className="font-display text-2xl font-semibold">
              Sobre el evento
            </h2>
            <div className="flex flex-col gap-3 leading-relaxed text-pretty">
              {event.description.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {event.requirements && (
            <section aria-labelledby="requisitos" className="rounded-2xl border border-border bg-muted/50 p-6">
              <h2 id="requisitos" className="flex items-center gap-2 font-display text-xl font-semibold">
                <Info className="size-5 text-primary" aria-hidden="true" />
                Requisitos y recomendaciones
              </h2>
              <p className="mt-2 leading-relaxed text-pretty">{event.requirements}</p>
            </section>
          )}

          <section aria-labelledby="ubicacion" className="flex flex-col gap-4">
            <h2 id="ubicacion" className="font-display text-2xl font-semibold">
              Dónde será
            </h2>
            {event.modality !== 'presencial' && event.onlineUrl && (
              <p className="flex flex-wrap items-center gap-2">
                <Monitor className="size-4" aria-hidden="true" />
                {registration ? (
                  <a
                    href={event.onlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline underline-offset-4"
                  >
                    Entrar a la sesión virtual<span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                ) : (
                  <span>El enlace de la sesión virtual se muestra cuando te inscribes.</span>
                )}
              </p>
            )}
            {event.modality !== 'virtual' && (
              <>
                <address className="flex items-start gap-2 not-italic">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{address || event.city}</span>
                </address>
                {hasCoords && (
                  <>
                    <EventMap
                      events={[event]}
                      linkToEvent={false}
                      className="h-72 overflow-hidden rounded-2xl border border-border"
                    />
                    {directionsUrl && (
                      <div>
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ variant: 'outline' }))}
                        >
                          <Navigation aria-hidden="true" />
                          Cómo llegar
                          <span className="sr-only"> (OpenStreetMap, se abre en una pestaña nueva)</span>
                        </a>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>

          {(event.sourceUrl || event.contactEmail) && (
            <section aria-label="Más información" className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {event.sourceUrl && (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-primary underline underline-offset-4"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Fuente: publicación original
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              )}
              {event.contactEmail && (
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-primary underline underline-offset-4"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {event.contactEmail}
                </a>
              )}
            </section>
          )}

          <FootprintCard event={event} />
        </article>

        <aside aria-label="Inscripción" className="lg:sticky lg:top-24">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Cupos</h2>
              <CapacityBar event={event} showCounts className="mt-3" />
            </div>
            <RegistrationCard
              event={event}
              profile={profile}
              registration={registration}
              isPast={isPast(event.endsAt)}
              googleUrl={googleCalendarUrl(event)}
              icsUrl={icsPath(event)}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
