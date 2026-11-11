'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { BellRing, CalendarCheck, CheckCircle2, Loader2, Lock, XCircle } from 'lucide-react'
import { CalendarButtons } from '@/components/events/calendar-buttons'
import { CancelRegistrationButton } from '@/components/events/cancel-registration-button'
import { CapacityBar } from '@/components/events/capacity-bar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerToEvent } from '@/lib/actions'
import { getCapacity } from '@/lib/capacity'
import { cn } from '@/lib/utils'
import type { EventItem, Profile, Registration } from '@/lib/types'

interface RegistrationCardProps {
  event: Pick<EventItem, 'id' | 'slug' | 'title' | 'capacity' | 'registeredCount' | 'status' | 'isFree' | 'priceInfo'>
  profile: Profile | null
  registration: Registration | null
  isPast: boolean
  googleUrl: string
  icsUrl: string
}

export function RegistrationCard({ event, profile, registration, isPast, googleUrl, icsUrl }: RegistrationCardProps) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const capacity = getCapacity(event)
  const soldOut = capacity.state === 'agotado'
  const confirmed = registration?.status === 'confirmada'
  const nextPath = `/eventos/${event.slug}`

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('accept', accepted ? 'on' : '')
    startTransition(async () => {
      const result = await registerToEvent(event.id, formData)
      if (result.ok) {
        setDone(true)
        toast.success('¡Inscripción confirmada!')
      } else {
        setError(result.error ?? 'No pudimos completar tu inscripción.')
      }
    })
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setError(null)
      setDone(false)
    }
  }

  return (
    <aside
      aria-label="Inscripción al evento"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div>
        <p className="font-display text-2xl font-semibold">{event.isFree ? 'Entrada gratuita' : (event.priceInfo ?? 'Con costo')}</p>
        <CapacityBar event={event} className="mt-3" showCounts />
      </div>

      {event.status === 'cancelado' ? (
        <p className="flex items-start gap-2 rounded-xl bg-coral-soft p-3 text-sm font-medium text-coral-ink">
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Este evento fue cancelado por la organización.
        </p>
      ) : isPast ? (
        <p className="rounded-xl bg-muted p-3 text-sm font-medium text-muted-foreground">Este evento ya terminó.</p>
      ) : confirmed && registration ? (
        <div className="flex flex-col gap-3">
          <p className="flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Ya estás inscrito en este evento.
          </p>
          <CalendarButtons googleUrl={googleUrl} icsUrl={icsUrl} size="sm" />
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellRing className="size-4 shrink-0" aria-hidden="true" />
            Te recordaremos 1 día antes.
          </p>
          <CancelRegistrationButton registrationId={registration.id} eventTitle={event.title} />
        </div>
      ) : !profile ? (
        <div className="flex flex-col gap-3">
          <Link href={`/ingresar?next=${encodeURIComponent(nextPath)}`} className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
            <Lock aria-hidden="true" />
            Ingresa para inscribirte
          </Link>
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link
              href={`/registro?next=${encodeURIComponent(nextPath)}`}
              className="font-semibold text-primary underline underline-offset-4"
            >
              Crea una gratis
            </Link>
            .
          </p>
        </div>
      ) : soldOut ? (
        <Button size="lg" disabled className="w-full">
          Cupos agotados
        </Button>
      ) : (
        <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
          <CalendarCheck aria-hidden="true" />
          Inscribirme
        </Button>
      )}

      {profile && (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            {done ? (
              <div className="flex flex-col gap-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <CheckCircle2 className="size-6 text-primary" aria-hidden="true" />
                    ¡Inscripción confirmada!
                  </DialogTitle>
                  <DialogDescription>
                    Ya tienes tu cupo en «{event.title}». Añádelo a tu calendario para no olvidarlo.
                  </DialogDescription>
                </DialogHeader>
                <CalendarButtons googleUrl={googleUrl} icsUrl={icsUrl} size="sm" />
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BellRing className="size-4 shrink-0" aria-hidden="true" />
                  Te recordaremos 1 día antes.
                </p>
                <Button variant="secondary" onClick={() => handleOpenChange(false)}>
                  Listo
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Inscripción</DialogTitle>
                  <DialogDescription>Confirma tus datos para reservar tu cupo en «{event.title}».</DialogDescription>
                </DialogHeader>

                {error && (
                  <p role="alert" className="rounded-xl bg-coral-soft p-3 text-sm font-medium text-coral-ink">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-name">Nombre completo</Label>
                  <Input id="reg-name" name="fullName" autoComplete="name" required defaultValue={profile.fullName} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-email">Correo electrónico</Label>
                  <Input id="reg-email" name="email" type="email" autoComplete="email" required defaultValue={profile.email} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reg-phone">
                    Celular <span className="font-normal text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input id="reg-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="300 123 4567" />
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-0.5" />
                  <span className="text-pretty">
                    Acepto que la organización use mis datos para gestionar mi asistencia y enviarme recordatorios de este
                    evento.
                  </span>
                </label>

                <Button type="submit" size="lg" disabled={pending}>
                  {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
                  Confirmar inscripción
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </aside>
  )
}
