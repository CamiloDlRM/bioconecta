'use client'

import { useMemo } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { CheckCircle2, Leaf, TriangleAlert, Video } from 'lucide-react'
import { Field, FormSection } from '@/components/forms/form-field'
import { FootprintSummary } from '@/components/sustainability/footprint-summary'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { computeFootprint, MATERIAL_LABELS, TRANSPORT_LABELS } from '@/lib/footprint'
import type { EventFormValues } from '@/lib/validation'

type MixKey = keyof typeof TRANSPORT_LABELS
const MIX_KEYS = Object.keys(TRANSPORT_LABELS) as MixKey[]
type MaterialKey = keyof typeof MATERIAL_LABELS
const MATERIAL_KEYS = Object.keys(MATERIAL_LABELS) as MaterialKey[]

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

function TransportMix() {
  const { control, setValue, getValues, formState } = useFormContext<EventFormValues>()
  const mix = useWatch({ control, name: 'sustainability.transportMix' })
  const sum = Math.round(MIX_KEYS.reduce((acc, k) => acc + num(mix?.[k]), 0))
  const valid = sum === 100
  const mixError = formState.errors.sustainability?.transportMix?.message

  const set = (key: MixKey, value: number) =>
    setValue(`sustainability.transportMix.${key}`, Math.max(0, Math.min(100, Math.round(value))), {
      shouldDirty: true,
      shouldValidate: formState.isSubmitted,
    })

  const normalize = () => {
    const current = getValues('sustainability.transportMix')
    const total = MIX_KEYS.reduce((acc, k) => acc + num(current[k]), 0)
    if (total <= 0) {
      MIX_KEYS.forEach((k) => set(k, 25))
      return
    }
    let assigned = 0
    MIX_KEYS.forEach((k, i) => {
      const value = i === MIX_KEYS.length - 1 ? 100 - assigned : Math.round((num(current[k]) / total) * 100)
      assigned += value
      set(k, value)
    })
  }

  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <legend className="px-1 text-sm font-semibold">¿Cómo llegará la gente? (% de asistentes)</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {MIX_KEYS.map((key) => {
          const id = `mix-${key}`
          const value = num(mix?.[key])
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium">
                  {TRANSPORT_LABELS[key]}
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    id={id}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => set(key, e.target.valueAsNumber || 0)}
                    className="h-9 w-20 text-right"
                  />
                  <span aria-hidden="true" className="text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <Slider
                value={[value]}
                min={0}
                max={100}
                step={5}
                thumbLabel={`${TRANSPORT_LABELS[key]}, porcentaje`}
                onValueChange={(v) => set(key, Array.isArray(v) ? v[0] : v)}
              />
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          className={
            valid
              ? 'flex items-center gap-1.5 text-sm font-semibold text-primary'
              : 'flex items-center gap-1.5 text-sm font-semibold text-destructive'
          }
        >
          {valid ? (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          ) : (
            <TriangleAlert className="size-4" aria-hidden="true" />
          )}
          {valid ? 'La mezcla suma 100 %' : `La mezcla suma ${sum} %. Debe sumar 100 %.`}
        </p>
        {!valid && (
          <Button type="button" variant="outline" size="sm" onClick={normalize}>
            Ajustar a 100 %
          </Button>
        )}
      </div>
      {mixError && !valid && <p className="text-sm font-medium text-destructive">{mixError}</p>}
    </fieldset>
  )
}

export function SustainabilitySection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EventFormValues>()
  const modality = useWatch({ control, name: 'modality' })
  const include = useWatch({ control, name: 'includeSustainability' })
  const inputs = useWatch({ control, name: 'sustainability' })

  const result = useMemo(() => computeFootprint(inputs), [inputs])
  const err = errors.sustainability

  if (modality === 'virtual') {
    return (
      <FormSection id="sec-sostenibilidad" title="Ficha de sostenibilidad">
        <p className="flex items-start gap-2 text-muted-foreground">
          <Video className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Los eventos 100 % virtuales no generan huella por desplazamiento, por lo que no se calcula la ficha.
        </p>
      </FormSection>
    )
  }

  return (
    <FormSection
      id="sec-sostenibilidad"
      title="Ficha de sostenibilidad"
      description="Estima la huella de carbono de tu evento. Es opcional, pero ayuda a quienes asisten a decidir y a ti a reducir impacto."
    >
      <Controller
        control={control}
        name="includeSustainability"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 text-sm font-medium">
            <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} className="mt-0.5" />
            <span>Incluir la ficha de sostenibilidad en la página del evento</span>
          </label>
        )}
      />

      {include && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="sus-attendees" label="Asistentes esperados" error={err?.attendees?.message}>
              {(a) => <Input {...a} type="number" inputMode="numeric" min={0} {...register('sustainability.attendees', { valueAsNumber: true })} />}
            </Field>
            <Field
              id="sus-distance"
              label="Distancia promedio de ida (km)"
              hint="Se calcula ida y vuelta automáticamente."
              error={err?.avgDistanceKm?.message}
            >
              {(a) => <Input {...a} type="number" inputMode="decimal" min={0} step="0.5" {...register('sustainability.avgDistanceKm', { valueAsNumber: true })} />}
            </Field>
          </div>

          <TransportMix />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="sus-kw" label="Potencia de equipos (kW)" hint="Sonido, luces, proyector…" error={err?.equipmentKw?.message}>
              {(a) => <Input {...a} type="number" inputMode="decimal" min={0} step="0.1" {...register('sustainability.equipmentKw', { valueAsNumber: true })} />}
            </Field>
            <Field id="sus-hours" label="Horas de uso de equipos" error={err?.hours?.message}>
              {(a) => <Input {...a} type="number" inputMode="decimal" min={0} step="0.5" {...register('sustainability.hours', { valueAsNumber: true })} />}
            </Field>
          </div>

          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold">Materiales (cantidades)</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {MATERIAL_KEYS.map((key) => (
                <Field
                  key={key}
                  id={`mat-${key}`}
                  label={MATERIAL_LABELS[key]}
                  error={err?.materials?.[key]?.message}
                >
                  {(a) => <Input {...a} type="number" inputMode="numeric" min={0} {...register(`sustainability.materials.${key}`, { valueAsNumber: true })} />}
                </Field>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl bg-muted/60 p-4 sm:p-5" aria-live="polite">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <Leaf className="size-4 text-primary" aria-hidden="true" />
              Vista previa de la huella
            </h3>
            <FootprintSummary result={result} />
          </div>
        </>
      )}
    </FormSection>
  )
}
