'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createEventPost } from '@/lib/actions'
import { prepareImage, PrepareImageError } from '@/lib/prepare-image'

const MAX_BODY = 1000

export function EventPostForm({ eventId }: { eventId: number }) {
  const [pending, startTransition] = useTransition()
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function clearImage() {
    setFile(null)
    setPreview(null)
    setAlt('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const f = input.files?.[0] ?? null
    setError(null)
    if (!f) return clearImage()
    setPreparing(true)
    try {
      // Reduce las fotos pesadas del celular y borra su ubicación GPS antes de subirlas
      const ready = await prepareImage(f)
      setFile(ready)
      setPreview(URL.createObjectURL(ready))
    } catch (err) {
      setError(err instanceof PrepareImageError ? err.message : 'No pudimos preparar la foto. Prueba con otra.')
      input.value = ''
    } finally {
      setPreparing(false)
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!body.trim() && !file) {
      setError('Escribe un comentario o agrega una foto.')
      return
    }
    const fd = new FormData()
    fd.set('body', body.trim())
    if (file) {
      fd.set('image', file)
      fd.set('imageAlt', alt.trim())
    }
    startTransition(async () => {
      const result = await createEventPost(eventId, fd)
      if (!result.ok) {
        setError(result.error ?? 'No pudimos publicar.')
        return
      }
      toast.success('¡Publicado!', { description: 'Gracias por compartir tu experiencia.' })
      setBody('')
      clearImage()
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="post-body">Comparte cómo te fue o lo que viste</Label>
        <Textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
          rows={3}
          maxLength={MAX_BODY}
          placeholder="Ej.: Vimos tres garzas morenas y sembramos 40 mangles. ¡Gracias al equipo!"
          aria-describedby="post-body-help"
        />
        <p id="post-body-help" className="text-sm text-muted-foreground">
          {body.length}/{MAX_BODY} caracteres
        </p>
      </div>

      {preview ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative w-full overflow-hidden rounded-xl border border-border sm:w-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="aspect-[4/3] w-full object-cover" />
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              onClick={clearImage}
              className="absolute top-2 right-2"
              aria-label="Quitar la foto"
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="post-alt">Describe la foto (para lectores de pantalla)</Label>
            <Input
              id="post-alt"
              value={alt}
              maxLength={200}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Ej.: Voluntarios sembrando mangle en la orilla de la ciénaga"
            />
          </div>
        </div>
      ) : (
        <div>
          <label
            htmlFor="post-image"
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm font-semibold text-primary hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          >
            {preparing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-4" aria-hidden="true" />
            )}
            {preparing ? 'Preparando la foto…' : 'Agregar una foto'}
            <input
              ref={fileRef}
              id="post-image"
              type="file"
              accept="image/*"
              onChange={onFile}
              disabled={preparing}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-sm text-muted-foreground">
            Puedes subir la foto directo del celular: la reducimos automáticamente y le quitamos la ubicación GPS.
            Comparte solo fotos en las que las personas estén de acuerdo en aparecer.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-coral-soft px-3 py-2 text-sm font-medium text-coral-ink">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending || preparing}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          {pending ? 'Publicando…' : 'Publicar'}
        </Button>
      </div>
    </form>
  )
}
