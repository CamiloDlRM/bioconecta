'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, Loader2, Pencil, Send, Trash2, Users, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { deleteEvent, setEventStatus } from '@/lib/actions'
import type { EventItem } from '@/lib/types'

type Confirm = 'cancelar' | 'eliminar' | null

export function EventRowActions({ event }: { event: Pick<EventItem, 'id' | 'slug' | 'title' | 'status'> }) {
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [pending, startTransition] = useTransition()

  function publish() {
    startTransition(async () => {
      const result = await setEventStatus(event.id, 'publicado')
      if (result.ok) toast.success('Evento publicado')
      else toast.error(result.error ?? 'No pudimos publicar el evento.')
    })
  }

  function run(kind: Exclude<Confirm, null>) {
    startTransition(async () => {
      const result = kind === 'cancelar' ? await setEventStatus(event.id, 'cancelado') : await deleteEvent(event.id)
      if (result.ok) {
        toast.success(kind === 'cancelar' ? 'Evento cancelado' : 'Evento eliminado')
        setConfirm(null)
      } else {
        toast.error(result.error ?? 'No pudimos completar la acción.')
      }
    })
  }

  const outline = buttonVariants({ variant: 'outline', size: 'sm' })

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/organizador/eventos/${event.id}/editar`} className={outline}>
          <Pencil aria-hidden="true" />
          Editar
        </Link>
        <Link href={`/organizador/eventos/${event.id}/inscritos`} className={outline}>
          <Users aria-hidden="true" />
          Ver inscritos
        </Link>
        {event.status === 'publicado' && (
          <Link href={`/eventos/${event.slug}`} className={outline}>
            <Eye aria-hidden="true" />
            Ver público
          </Link>
        )}
        {event.status !== 'publicado' && (
          <Button type="button" size="sm" onClick={publish} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
            {event.status === 'cancelado' ? 'Reactivar' : 'Publicar'}
          </Button>
        )}
        {event.status === 'publicado' && (
          <Button type="button" variant="outline" size="sm" onClick={() => setConfirm('cancelar')} disabled={pending}>
            <XCircle aria-hidden="true" />
            Cancelar
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirm('eliminar')} disabled={pending}>
          <Trash2 aria-hidden="true" />
          Eliminar
        </Button>
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === 'eliminar' ? '¿Eliminar este evento?' : '¿Cancelar este evento?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === 'eliminar'
                ? `«${event.title}» y todas sus inscripciones se eliminarán de forma permanente.`
                : `«${event.title}» dejará de aceptar inscripciones y se mostrará como cancelado.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Volver</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending} onClick={() => confirm && run(confirm)}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              {confirm === 'eliminar' ? 'Sí, eliminar' : 'Sí, cancelar evento'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
