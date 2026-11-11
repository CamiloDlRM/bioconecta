import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { OrganizerGate } from '@/components/organizer/organizer-gate'
import { RegistrationsTable } from '@/components/organizer/registrations-table'
import { getCurrentProfile, getEventRegistrations, getOrganizerEventById } from '@/lib/data'
import { formatEventRange } from '@/lib/format'

export const metadata: Metadata = { title: 'Inscritos' }

export default async function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getCurrentProfile()
  if (!profile) redirect(`/ingresar?next=/organizador/eventos/${id}/inscritos`)
  if (profile.role !== 'organizador') return <OrganizerGate />

  const eventId = Number(id)
  if (!Number.isInteger(eventId)) notFound()
  const event = await getOrganizerEventById(eventId)
  if (!event) notFound()
  const registrations = await getEventRegistrations(eventId)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/organizador" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al panel
      </Link>
      <h1 className="mt-3 font-display text-4xl font-semibold text-balance">Inscritos</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        {event.title} · {formatEventRange(event.startsAt, event.endsAt)}
      </p>
      <RegistrationsTable registrations={registrations} eventSlug={event.slug} capacity={event.capacity} />
    </div>
  )
}
