'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { EVENT_TYPE_LIST, MODALITY_LABELS } from '@/lib/event-types'
import { WHEN_LABELS } from '@/lib/filters'
import { cn } from '@/lib/utils'
import type { EventFilters, EventType, Modality } from '@/lib/types'

const nativeField =
  'h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface FiltersFormProps {
  filters: EventFilters
  cities: string[]
  activeCount: number
}

export function FiltersForm({ filters, cities, activeCount }: FiltersFormProps) {
  const uid = useId()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(filters.q ?? '')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setQ(filters.q ?? '')
  }, [filters.q])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function onSearchChange(value: string) {
    setQ(value)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => update({ q: value.trim() || null }), 350)
  }

  function toggleType(type: EventType) {
    const current = new Set(filters.types ?? [])
    if (current.has(type)) current.delete(type)
    else current.add(type)
    update({ tipo: current.size ? [...current].join(',') : null })
  }

  function clearAll() {
    const params = new URLSearchParams()
    const view = searchParams.get('vista')
    if (view) params.set('vista', view)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const id = (name: string) => `${uid}-${name}`

  return (
    <form
      role="search"
      aria-label="Filtrar eventos"
      onSubmit={(e) => {
        e.preventDefault()
        if (timer.current) clearTimeout(timer.current)
        update({ q: q.trim() || null })
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('q')}>Buscar</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id={id('q')}
            type="search"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tema, lugar u organizador"
            className={cn(nativeField, 'pl-9')}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Cuándo</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(WHEN_LABELS) as (keyof typeof WHEN_LABELS)[]).map((key) => {
            const active = filters.when === key
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => update({ cuando: active ? null : key, desde: null, hasta: null })}
                className={cn(
                  'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted',
                )}
              >
                {WHEN_LABELS[key]}
              </button>
            )
          })}
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor={id('desde')} className="text-sm text-muted-foreground">
              Desde
            </Label>
            <input
              id={id('desde')}
              type="date"
              value={filters.from ?? ''}
              max={filters.to}
              onChange={(e) => update({ desde: e.target.value || null, cuando: null })}
              className={nativeField}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={id('hasta')} className="text-sm text-muted-foreground">
              Hasta
            </Label>
            <input
              id={id('hasta')}
              type="date"
              value={filters.to ?? ''}
              min={filters.from}
              onChange={(e) => update({ hasta: e.target.value || null, cuando: null })}
              className={nativeField}
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('ciudad')}>Ciudad</Label>
        <select
          id={id('ciudad')}
          value={filters.city ?? ''}
          onChange={(e) => update({ ciudad: e.target.value || null })}
          className={nativeField}
        >
          <option value="">Todas las ciudades</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Tipo de evento</legend>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPE_LIST.map((t) => {
            const active = filters.types?.includes(t.value) ?? false
            const Icon = t.icon
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => toggleType(t.value)}
                className={cn(
                  'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('modalidad')}>Modalidad</Label>
        <select
          id={id('modalidad')}
          value={filters.modality ?? ''}
          onChange={(e) => update({ modalidad: (e.target.value as Modality) || null })}
          className={nativeField}
        >
          <option value="">Cualquier modalidad</option>
          {(Object.keys(MODALITY_LABELS) as Modality[]).map((m) => (
            <option key={m} value={m}>
              {MODALITY_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-h-9 items-center gap-3">
        <Checkbox
          id={id('gratis')}
          checked={filters.freeOnly ?? false}
          onCheckedChange={(v) => update({ gratis: v === true ? '1' : null })}
        />
        <Label htmlFor={id('gratis')} className="cursor-pointer">
          Solo gratuitos
        </Label>
      </div>

      {activeCount > 0 && (
        <Button type="button" variant="outline" onClick={clearAll}>
          <X aria-hidden="true" />
          Limpiar filtros ({activeCount})
        </Button>
      )}
    </form>
  )
}
