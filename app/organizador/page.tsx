import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarPlus, Gauge, Leaf, Megaphone, Users } from 'lucide-react'
import { CapacityBar } from '@/components/events/capacity-bar'
import { TypeBadge } from '@/components/events/type-badge'
import { EventRowActions } from '@/components/organizer/event-row-actions'
import { OrganizerGate } from '@/components/organizer/organizer-gate'
import { StatusBadge } from '@/components/organizer/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { getCurrentProfile, getOrganizerEvents } from '@/lib/data'
import { computeFootprint } from '@/lib/footprint'
import { formatEventRange, formatKg } from '@/lib/format'

export const metadata: Metadata = { title: 'Panel de organizador' }

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="size-4 text-secondary" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default async function OrganizerDashboardPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/ingresar?next=/organizador')
  if (profile.role !== 'organizador') return <OrganizerGate />

  const events = await getOrganizerEvents()
  const published = events.filter((e) => e.status === 'publicado')
  const totalRegistered = events.reduce((sum, e) => sum + e.registeredCount, 0)
  const withCapacity = published.filter((e) => e.capacity)
  const occupancy = withCapacity.length
    ? Math.round(withCapacity.reduce((s, e) => s + e.registeredCount / (e.capacity as number), 0) / withCapacity.length * 100)
    : 0
  const footprintKg = published.reduce(
    (sum, e) => (e.sustainability && e.modality !== 'virtual' ? sum + computeFootprint(e.sustainability).totalKg : sum),
    0,
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-secondary">{profile.organizationName ?? 'Organizador'}</p>
          <h1 className="font-display text-4xl font-semibold">Panel de organizador</h1>
          <p className="mt-2 text-muted-foreground">Publica eventos y gestiona a quienes se inscriben.</p>
        </div>
        <Link href="/organizador/eventos/nuevo" className={buttonVariants({ size: 'lg' })}>
          <CalendarPlus aria-hidden="true" />
          Crear evento
        </Link>
      </div>

      <section aria-label="Resumen" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Megaphone} label="Eventos publicados" value={String(published.length)} hint={`${events.length} en total`} />
        <Kpi icon={Users} label="Inscritos totales" value={String(totalRegistered)} />
        <Kpi icon={Gauge} label="Ocupación promedio" value={`${occupancy} %`} hint="Eventos publicados con cupo" />
        <Kpi icon={Leaf} label="Huella total estimada" value={`${formatKg(footprintKg)} kg`} hint="kg CO2e, eventos publicados" />
      </section>

      <section aria-labelledby="mis-eventos" className="mt-10">
        <h2 id="mis-eventos" className="font-display text-2xl font-semibold">
          Mis eventos
        </h2>

        {events.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-xl font-semibold">Aún no has creado eventos</p>
            <p className="text-muted-foreground">Publica tu primera actividad para que la comunidad la encuentre.</p>
            <Link href="/organizador/eventos/nuevo" className={buttonVariants()}>
              Crear mi primer evento
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {events.map((event) => (
              <li key={event.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={event.status} />
                      <TypeBadge type={event.eventType} />
                    </div>
                    <h3 className="mt-2 font-display text-xl leading-tight font-semibold text-balance">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{formatEventRange(event.startsAt, event.endsAt)}</p>
                  </div>
                  <div className="w-full lg:w-64">
                    <CapacityBar event={event} showCounts />
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <EventRowActions event={event} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
