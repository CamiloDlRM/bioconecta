import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BellRing, CalendarSearch, Clock, MapPin } from 'lucide-react'
import { EventCover } from '@/components/events/event-cover'
import { TypeBadge } from '@/components/events/type-badge'
import { CalendarButtons } from '@/components/events/calendar-buttons'
import { CancelRegistrationButton } from '@/components/events/cancel-registration-button'
import { buttonVariants } from '@/components/ui/button'
import { getCurrentProfile, getMyRegistrations } from '@/lib/data'
import { googleCalendarUrl, icsPath } from '@/lib/calendar'
import { countdownLabel, formatEventRange, isPast, isWithinHours, reminderPrefix } from '@/lib/format'
import type { EventItem, Registration } from '@/lib/types'

export const metadata: Metadata = { title: 'Mis inscripciones' }

type Row = Registration & { event: EventItem }

function RegistrationRow({ row, past }: { row: Row; past?: boolean }) {
  const { event } = row
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row">
      <div className="w-full shrink-0 sm:w-48">
        <EventCover event={event} className="aspect-[16/10] rounded-xl" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={event.eventType} />
          {!past && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-sm font-semibold text-secondary">
              <Clock className="size-3.5" aria-hidden="true" />
              {countdownLabel(event.startsAt)}
            </span>
          )}
          {event.status === 'cancelado' && (
            <span className="rounded-full bg-coral-soft px-2.5 py-0.5 text-sm font-semibold text-coral-ink">
              Evento cancelado
            </span>
          )}
        </div>
        <div>
          <h3 className="font-display text-xl leading-tight font-semibold text-balance">
            <Link href={`/eventos/${event.slug}`} className="rounded-sm hover:underline">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{formatEventRange(event.startsAt, event.endsAt)}</p>
          <p className="mt-0.5 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {event.modality === 'virtual' ? 'Evento virtual' : [event.venueName, event.city].filter(Boolean).join(' · ')}
          </p>
        </div>
        {!past && row.status === 'confirmada' && (
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <CalendarButtons googleUrl={googleCalendarUrl(event)} icsUrl={icsPath(event)} size="sm" />
            <CancelRegistrationButton registrationId={row.id} eventTitle={event.title} size="sm" />
          </div>
        )}
      </div>
    </li>
  )
}

export default async function MyRegistrationsPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/ingresar?next=/mis-inscripciones')

  const all = (await getMyRegistrations()).filter((r) => r.status === 'confirmada')
  const upcoming = all.filter((r) => !isPast(r.event.endsAt))
  const past = all.filter((r) => isPast(r.event.endsAt)).reverse()
  const soon = upcoming.filter((r) => isWithinHours(r.event.startsAt, 48))

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Mis inscripciones</h1>
      <p className="mt-2 text-muted-foreground">Hola, {profile.fullName.split(' ')[0]}. Estos son los eventos en los que participarás.</p>

      {soon.length > 0 && (
        <div role="status" className="mt-6 flex flex-col gap-2 rounded-2xl border border-accent/50 bg-accent/10 p-4">
          {soon.map((r) => (
            <p key={r.id} className="flex items-start gap-2 text-sm font-medium">
              <BellRing className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
              <span>
                {reminderPrefix(r.event.startsAt)}{' '}
                <Link href={`/eventos/${r.event.slug}`} className="font-semibold underline underline-offset-4">
                  {r.event.title}
                </Link>
                . {formatEventRange(r.event.startsAt, r.event.endsAt)}.
              </span>
            </p>
          ))}
        </div>
      )}

      <section aria-labelledby="proximos" className="mt-10">
        <h2 id="proximos" className="font-display text-2xl font-semibold">
          Próximos
        </h2>
        {upcoming.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <CalendarSearch className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="font-display text-xl font-semibold">Aún no tienes inscripciones</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Explora los eventos de biodiversidad en Barranquilla y reserva tu cupo.
            </p>
            <Link href="/eventos" className={buttonVariants()}>
              Explorar eventos
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {upcoming.map((r) => (
              <RegistrationRow key={r.id} row={r} />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="pasados" className="mt-12">
          <h2 id="pasados" className="font-display text-2xl font-semibold">
            Pasados
          </h2>
          <ul className="mt-4 flex flex-col gap-4 opacity-90">
            {past.map((r) => (
              <RegistrationRow key={r.id} row={r} past />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
