import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { EventForm } from '@/components/forms/event-form'
import { OrganizerGate } from '@/components/organizer/organizer-gate'
import { getCurrentProfile } from '@/lib/data'

export const metadata: Metadata = { title: 'Nuevo evento' }

export default async function NewEventPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/ingresar?next=/organizador/eventos/nuevo')
  if (profile.role !== 'organizador') return <OrganizerGate />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/organizador" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al panel
      </Link>
      <h1 className="mt-3 font-display text-4xl font-semibold">Nuevo evento</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Completa la información. Puedes guardarlo como borrador y publicarlo después.</p>
      <EventForm organizerName={profile.organizationName ?? profile.fullName} />
    </div>
  )
}
