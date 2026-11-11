'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EventCover } from '@/components/events/event-cover'
import { Field, FormSection, nativeFieldClass } from '@/components/forms/form-field'
import { LocationSection } from '@/components/forms/location-section'
import { SustainabilitySection } from '@/components/forms/sustainability-section'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createEvent, updateEvent } from '@/lib/actions'
import { EVENT_TYPES, MODALITY_LABELS } from '@/lib/event-types'
import { emptyEventForm, eventFormSchema, eventToFormValues, type EventFormValues } from '@/lib/validation'
import type { EventItem, EventStatus } from '@/lib/types'

interface EventFormProps {
  event?: EventItem
  organizerName: string
}

export function EventForm({ event, organizerName }: EventFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [submittingStatus, setSubmittingStatus] = useState<EventStatus | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageError(null)
    if (!file) {
      setImageFile(null)
      setPreviewUrl(null)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('La imagen debe ser JPG, PNG o WebP.')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('La imagen no puede pesar más de 5 MB.')
      e.target.value = ''
      return
    }
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? eventToFormValues(event) : emptyEventForm(organizerName),
    mode: 'onTouched',
  })
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form

  const summary = useWatch({ control, name: 'summary' }) ?? ''
  const isFree = useWatch({ control, name: 'isFree' })
  const eventType = useWatch({ control, name: 'eventType' })
  const title = useWatch({ control, name: 'title' })

  const submit = (status: EventStatus) =>
    handleSubmit(
      (values) => {
        setSubmittingStatus(status)
        startTransition(async () => {
          const fd = new FormData()
          fd.set('payload', JSON.stringify(values))
          fd.set('status', status)
          if (imageFile) fd.set('image', imageFile)
          if (removeImage) fd.set('removeImage', '1')
          const result = event ? await updateEvent(event.id, fd) : await createEvent(fd)
          if (!result.ok) {
            toast.error(result.error ?? 'No pudimos guardar el evento.')
            setSubmittingStatus(null)
            return
          }
          toast.success(status === 'publicado' ? 'Evento publicado' : 'Cambios guardados', {
            description: status === 'publicado' ? 'Ya es visible para toda la comunidad.' : 'Tu evento quedó guardado.',
          })
          router.push('/organizador')
          router.refresh()
        })
      },
      () => toast.error('Revisa los campos marcados', { description: 'Hay información por completar o corregir.' }),
    )

  const busy = (status: EventStatus) => pending && submittingStatus === status

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-6">
        <FormSection id="sec-info" title="Información" description="Lo primero que verá la gente al encontrar tu evento.">
          <Field id="title" label="Título" error={errors.title?.message}>
            {(a) => <Input {...a} maxLength={120} placeholder="Siembra de mangle en la Ciénaga de Mallorquín" {...register('title')} />}
          </Field>

          <Field
            id="summary"
            label="Resumen"
            hint={`${summary.length}/280 caracteres. Aparece en las tarjetas del listado.`}
            error={errors.summary?.message}
          >
            {(a) => <Textarea {...a} rows={3} maxLength={280} {...register('summary')} />}
          </Field>

          <Field id="description" label="Descripción" error={errors.description?.message}>
            {(a) => <Textarea {...a} rows={7} {...register('description')} />}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="eventType" label="Tipo de evento" error={errors.eventType?.message}>
              {(a) => (
                <select {...a} className={nativeFieldClass} {...register('eventType')}>
                  {Object.values(EVENT_TYPES).map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field id="modality" label="Modalidad" error={errors.modality?.message}>
              {(a) => (
                <select {...a} className={nativeFieldClass} {...register('modality')}>
                  {Object.entries(MODALITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <Field id="organizerName" label="Organizador mostrado" hint="Nombre que aparecerá públicamente." error={errors.organizerName?.message}>
            {(a) => <Input {...a} {...register('organizerName')} />}
          </Field>
        </FormSection>

        <FormSection id="sec-fecha" title="Fecha y hora" description="Hora de Colombia (America/Bogota).">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="startsAt" label="Inicio" error={errors.startsAt?.message}>
              {(a) => <Input {...a} type="datetime-local" {...register('startsAt')} />}
            </Field>
            <Field id="endsAt" label="Fin" error={errors.endsAt?.message}>
              {(a) => <Input {...a} type="datetime-local" {...register('endsAt')} />}
            </Field>
          </div>
        </FormSection>

        <LocationSection />

        <FormSection id="sec-cupos" title="Cupos y requisitos">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="capacity" label="Cupo máximo" hint="Déjalo vacío si no hay límite." error={errors.capacity?.message}>
              {(a) => (
                <Input
                  {...a}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  {...register('capacity', { setValueAs: (v) => (v === '' || v == null ? null : Number(v)) })}
                />
              )}
            </Field>
            <Field id="contactEmail" label="Correo de contacto" optional error={errors.contactEmail?.message}>
              {(a) => <Input {...a} type="email" autoComplete="email" {...register('contactEmail')} />}
            </Field>
          </div>

          <Field id="requirements" label="Requisitos" optional hint="Ropa, materiales, edad mínima, etc." error={errors.requirements?.message}>
            {(a) => <Textarea {...a} rows={3} {...register('requirements')} />}
          </Field>

          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="isFree"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  El evento es gratuito
                </label>
              )}
            />
            {!isFree && (
              <Field id="priceInfo" label="Valor o información de precio" error={errors.priceInfo?.message}>
                {(a) => <Input {...a} placeholder="$20.000 COP, incluye refrigerio" {...register('priceInfo')} />}
              </Field>
            )}
          </div>

          <Field id="sourceUrl" label="Enlace de la fuente original" optional hint="Publicación de Instagram, página web, etc." error={errors.sourceUrl?.message}>
            {(a) => <Input {...a} type="url" inputMode="url" placeholder="https://…" {...register('sourceUrl')} />}
          </Field>
        </FormSection>

        <FormSection id="sec-imagen" title="Imagen" description="Tu evento usa una portada ilustrada según su tipo hasta que subas una imagen.">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <EventCover
              event={{
                id: 0,
                slug: 'previa',
                eventType,
                title: title || 'Vista previa',
                imageUrl: previewUrl ?? (removeImage ? null : (event?.imageUrl ?? null)),
              }}
              className="aspect-[16/10] w-full rounded-xl sm:w-64"
            />
            <div className="flex flex-1 flex-col gap-3">
              <Field id="image" label="Subir imagen de portada" optional hint="JPG, PNG o WebP de máximo 5 MB. Usa fotos propias o de uso libre, con su crédito.">
                {(a) => (
                  <div className="flex items-center gap-2">
                    <ImagePlus className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <input
                      {...a}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={onImageChange}
                      className={nativeFieldClass + ' py-1.5 file:mr-3'}
                    />
                  </div>
                )}
              </Field>
              {imageError && (
                <p role="alert" className="text-sm font-medium text-coral-ink">
                  {imageError}
                </p>
              )}
              {event?.imageUrl && !imageFile && (
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <Checkbox checked={removeImage} onCheckedChange={(v) => setRemoveImage(v === true)} />
                  Quitar la imagen actual y usar la portada ilustrada
                </label>
              )}
            </div>
          </div>
        </FormSection>

        <SustainabilitySection />

        <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
          <Button type="button" variant="ghost" onClick={() => router.push('/organizador')} disabled={pending}>
            Cancelar
          </Button>
          {(!event || event.status === 'borrador') && (
            <Button type="button" variant="outline" onClick={submit('borrador')} disabled={pending}>
              {busy('borrador') && <Loader2 className="animate-spin" aria-hidden="true" />}
              Guardar borrador
            </Button>
          )}
          {event && event.status !== 'borrador' && (
            <Button
              type="button"
              variant={event.status === 'publicado' ? 'default' : 'outline'}
              onClick={submit(event.status)}
              disabled={pending}
            >
              {busy(event.status) && <Loader2 className="animate-spin" aria-hidden="true" />}
              Guardar cambios
            </Button>
          )}
          {(!event || event.status !== 'publicado') && (
            <Button type="button" onClick={submit('publicado')} disabled={pending}>
              {busy('publicado') && <Loader2 className="animate-spin" aria-hidden="true" />}
              {event?.status === 'cancelado' ? 'Reactivar y publicar' : 'Publicar'}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
