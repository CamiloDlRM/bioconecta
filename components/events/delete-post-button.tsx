'use client'

import { useState, useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { deleteEventPost } from '@/lib/actions'

export function DeletePostButton({ postId, authorName }: { postId: number; authorName: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const result = await deleteEventPost(postId)
      if (result.ok) {
        toast.success('Publicación eliminada')
        setOpen(false)
      } else {
        toast.error(result.error ?? 'No pudimos eliminar la publicación.')
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Eliminar la publicación de ${authorName}`}
        className="text-muted-foreground hover:text-coral-ink"
      >
        <Trash2 aria-hidden="true" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta publicación?</AlertDialogTitle>
            <AlertDialogDescription>El comentario y la foto se borrarán de forma permanente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Volver</AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={confirm} disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Sí, eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
