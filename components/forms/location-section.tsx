'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { AlertCircle, Loader2, LocateFixed, MapPinCheck } from 'lucide-react'
import { Field, FormSection, nativeFieldClass } from '@/components/forms/form-field'
import { LocationPickerMap } from '@/components/map/lazy-maps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EVENT_TYPES } from '@/lib/event-types'
import type { EventFormValues } from '@/lib/validation'

const CITY_SUGGESTIONS = ['Barranquilla', 'Puerto Colombia', 'Soledad', 'Malambo', 'Galapa']
const DEBOUNCE_MS = 1200

type GeoStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'found'; label: string; precision: 'exacta' | 'aproximada' }
  | { state: 'notfound' }
  | { state: 'error'; message: string }

export function LocationSection() {
  const {
    register,
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useFormContext<EventFormValues>()
  const modality = useWatch({ control, name: 'modality' })
  const eventType = useWatch({ control, name: 'eventType' })
  const latitude = useWatch({ control, name: 'latitude' })
  const longitude = useWatch({ control, name: 'longitude' })
  const address = useWatch({ control, name: 'address' })
  const venueName = useWatch({ control, name: 'venueName' })
  const city = useWatch({ control, name: 'city' })
  const physical = modality !== 'virtual'
  const online = modality !== 'presencial'

  const [geo, setGeo] = useState<GeoStatus>({ state: 'idle' })
  const [focusKey, setFocusKey] = useState(0)
  const lastQuery = useRef('')
  const abortRef = useRef<AbortController | null>(null)

  const setCoords = useCallback(
    (lat: number | null, lng: number | null) => {
      setValue('latitude', lat, { shouldDirty: true, shouldValidate: lat !== null })
      setValue('longitude', lng, { shouldDirty: true })
    },
    [setValue],
  )

  /** Busca la dirección / el lugar en OpenStreetMap y mueve el marcador. */
  const locate = useCallback(
    async (force: boolean) => {
      const query = {
        address: (address ?? '').trim(),
        venue: (venueName ?? '').trim(),
        city: (city ?? '').trim(),
      }
      if (query.address.length < 4 && query.venue.length < 4) {
        if (force) setGeo({ state: 'error', message: 'Escribe primero el nombre del lugar o la dirección.' })
        return
      }
      const key = JSON.stringify(query)
      if (!force && key === lastQuery.current) return
      lastQuery.current = key

      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setGeo({ state: 'loading' })
      try {
        const res = await fetch(`/api/geocode?${new URLSearchParams(query)}`, { signal: ctrl.signal })
        const data = await res.json()
        if (!res.ok) {
          setGeo({ state: 'error', message: data.error ?? 'No pudimos consultar el mapa en este momento.' })
          return
        }
        if (!data.found) {
          setGeo({ state: 'notfound' })
          return
        }
        setCoords(data.lat, data.lng)
        setFocusKey((k) => k + 1)
        setGeo({ state: 'found', label: data.label, precision: data.precision })
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setGeo({ state: 'error', message: 'No pudimos consultar el mapa en este momento.' })
        }
      }
    },
    [address, venueName, city, setCoords],
  )

  // Ubicación automática: cuando el organizador deja de escribir la dirección o el lugar
  const userEditedPlace = Boolean(dirtyFields.address || dirtyFields.venueName || dirtyFields.city)
  useEffect(() => {
    if (!physical || !userEditedPlace) return
    const t = setTimeout(() => void locate(false), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [physical, userEditedPlace, locate])

  useEffect(() => () => abortRef.current?.abort(), [])

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
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Ubicación en el mapa</p>
                <p id="map-help" className="text-sm text-pretty text-muted-foreground">
                  Al escribir el nombre del lugar o la dirección, ubicamos el punto automáticamente. Si no queda exacto,
                  haz clic en el mapa o arrastra el marcador.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void locate(true)}
                disabled={geo.state === 'loading'}
              >
                {geo.state === 'loading' ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <LocateFixed aria-hidden="true" />
                )}
                Ubicar dirección
              </Button>
            </div>

            <p role="status" aria-live="polite" className="min-h-5 text-sm">
              {geo.state === 'loading' && (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Buscando la dirección en el mapa…
                </span>
              )}
              {geo.state === 'found' && (
                <span className="inline-flex items-start gap-1.5 text-primary">
                  <MapPinCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    {geo.precision === 'exacta' ? 'Ubicamos' : 'Ubicación aproximada (calle o zona):'}{' '}
                    <strong className="font-semibold">{geo.label}</strong>. Si no es el punto exacto, arrastra el marcador.
                  </span>
                </span>
              )}
              {geo.state === 'notfound' && (
                <span className="inline-flex items-start gap-1.5 text-coral-ink">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  No encontramos esa dirección en el mapa. Prueba con el nombre del lugar o marca el punto haciendo clic.
                </span>
              )}
              {geo.state === 'error' && (
                <span className="inline-flex items-start gap-1.5 text-coral-ink">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {geo.message}
                </span>
              )}
            </p>

            <LocationPickerMap
              className="h-72 overflow-hidden rounded-2xl border border-border"
              latitude={latitude}
              longitude={longitude}
              color={EVENT_TYPES[eventType].color}
              onChange={(lat, lng) => setCoords(lat, lng)}
              focusKey={focusKey}
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
