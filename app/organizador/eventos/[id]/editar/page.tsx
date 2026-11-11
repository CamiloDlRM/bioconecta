import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { EventForm } from '@/components/forms/event-form'
import { OrganizerGate } from '@/components/organizer/organizer-gate'
import { StatusBadge } from '@/components/organizer/status-badge'
import { getCurrentProfile, getOrganizerEventById } from '@/lib/data'

export const metadata: Metadata = { title: 'Editar evento' }

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getCurrentProfile()
  if (!profile) redirect(`/ingresar?next=/organizador/eventos/${id}/editar`)
  if (profile.role !== 'organizador') return <OrganizerGate />

  const eventId = Number(id)
  if (!Number.isInteger(eventId)) notFound()
  const event = await getOrganizerEventById(eventId)
  if (!event) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/organizador" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al panel
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-semibold">Editar evento</h1>
        <StatusBadge status={event.status} />
      </div>
      <p className="mt-2 mb-8 text-muted-foreground text-pretty">{event.title}</p>
      <EventForm event={event} organizerName={event.organizerName} />
    </div>
  )
}
