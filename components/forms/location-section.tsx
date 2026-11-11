'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { Field, FormSection, nativeFieldClass } from '@/components/forms/form-field'
import { LocationPickerMap } from '@/components/map/lazy-maps'
import { Input } from '@/components/ui/input'
import { EVENT_TYPES } from '@/lib/event-types'
import type { EventFormValues } from '@/lib/validation'

const CITY_SUGGESTIONS = ['Barranquilla', 'Puerto Colombia', 'Soledad', 'Malambo', 'Galapa']

export function LocationSection() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<EventFormValues>()
  const modality = useWatch({ control, name: 'modality' })
  const eventType = useWatch({ control, name: 'eventType' })
  const latitude = useWatch({ control, name: 'latitude' })
  const longitude = useWatch({ control, name: 'longitude' })
  const physical = modality !== 'virtual'
  const online = modality !== 'presencial'

  const setCoords = (lat: number | null, lng: number | null) => {
    setValue('latitude', lat, { shouldDirty: true })
    setValue('longitude', lng, { shouldDirty: true })
  }

  return (
    <FormSection id="sec-lugar" title="Lugar" description="Dónde se realiza el evento o cómo conectarse.">
      <Field id="city" label="Ciudad o municipio" error={errors.city?.message}>
        {(a) => (
          <>
            <Input {...a} list="ciudades" autoComplete="off" {...register('city')} />
            <datalist id="ciudades">
              {CITY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </>
        )}
      </Field>

      {physical && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="venueName" label="Nombre del lugar" error={errors.venueName?.message}>
              {(a) => <Input {...a} placeholder="Ecoparque Ciénaga de Mallorquín" {...register('venueName')} />}
            </Field>
            <Field id="address" label="Dirección o punto de encuentro" optional error={errors.address?.message}>
              {(a) => <Input {...a} placeholder="Km 5 vía Barranquilla – Puerto Colombia" {...register('address')} />}
            </Field>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold">Ubicación en el mapa</p>
              <p id="map-help" className="text-sm text-muted-foreground">
                Haz clic en el mapa o arrastra el marcador para fijar el punto. También puedes escribir las coordenadas.
              </p>
            </div>
            <LocationPickerMap
              className="h-72 overflow-hidden rounded-2xl border border-border"
              latitude={latitude}
              longitude={longitude}
              color={EVENT_TYPES[eventType].color}
              onChange={(lat, lng) => setCoords(lat, lng)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="latitude" label="Latitud" error={errors.latitude?.message}>
                {(a) => (
                  <input
                    {...a}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className={nativeFieldClass}
                    value={latitude ?? ''}
                    onChange={(e) => setCoords(e.target.value === '' ? null : Number(e.target.value), longitude)}
                  />
                )}
              </Field>
              <Field id="longitude" label="Longitud">
                {(a) => (
                  <input
                    {...a}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className={nativeFieldClass}
                    value={longitude ?? ''}
                    onChange={(e) => setCoords(latitude, e.target.value === '' ? null : Number(e.target.value))}
                  />
                )}
              </Field>
            </div>
          </div>
        </>
      )}

      {online && (
        <Field id="onlineUrl" label="Enlace de la sesión virtual" error={errors.onlineUrl?.message}>
          {(a) => <Input {...a} type="url" inputMode="url" placeholder="https://meet.google.com/…" {...register('onlineUrl')} />}
        </Field>
      )}
    </FormSection>
  )
}
