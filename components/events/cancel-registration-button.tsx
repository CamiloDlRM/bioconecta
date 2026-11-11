'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cancelRegistration } from '@/lib/actions'

interface CancelRegistrationButtonProps {
  registrationId: number
  eventTitle: string
  size?: 'sm' | 'default'
}

export function CancelRegistrationButton({ registrationId, eventTitle, size = 'default' }: CancelRegistrationButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const result = await cancelRegistration(registrationId)
      if (result.ok) {
        toast.success('Inscripción cancelada', { description: 'Liberamos tu cupo. ¡Esperamos verte en otro evento!' })
        setOpen(false)
      } else {
        toast.error(result.error ?? 'No pudimos cancelar tu inscripción.')
      }
    })
  }

  return (
    <>
      <Button type="button" variant="destructive" size={size} onClick={() => setOpen(true)}>
        Cancelar inscripción
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar tu inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejarás de estar inscrito en «{eventTitle}» y tu cupo quedará disponible para otras personas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mantener inscripción</AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={confirm} disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Sí, cancelar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
