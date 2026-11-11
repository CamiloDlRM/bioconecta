import { EVENT_TYPES } from './event-types'
import type { EventFilters, EventType, Modality } from './types'

export type SearchParams = Record<string, string | string[] | undefined>

const WHEN_VALUES = ['hoy', 'fin-de-semana', 'semana', 'mes'] as const
const MODALITIES: Modality[] = ['presencial', 'virtual', 'hibrido']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export const WHEN_LABELS: Record<NonNullable<EventFilters['when']>, string> = {
  hoy: 'Hoy',
  'fin-de-semana': 'Este fin de semana',
  semana: 'Próximos 7 días',
  mes: 'Este mes',
}

/** Convierte los searchParams de la URL (en español) en filtros de datos. */
export function parseFilters(sp: SearchParams): EventFilters {
  const q = first(sp.q)?.trim()
  const types = (first(sp.tipo) ?? '')
    .split(',')
    .filter((t): t is EventType => t in EVENT_TYPES)
  const city = first(sp.ciudad)?.trim()
  const from = first(sp.desde)
  const to = first(sp.hasta)
  const modality = first(sp.modalidad) as Modality | undefined
  const when = first(sp.cuando) as (typeof WHEN_VALUES)[number] | undefined

  return {
    q: q || undefined,
    types: types.length ? types : undefined,
    city: city || undefined,
    from: from && DATE_RE.test(from) ? from : undefined,
    to: to && DATE_RE.test(to) ? to : undefined,
    modality: modality && MODALITIES.includes(modality) ? modality : undefined,
    freeOnly: first(sp.gratis) === '1' ? true : undefined,
    when: when && WHEN_VALUES.includes(when) ? when : undefined,
  }
}

export function parseView(sp: SearchParams): 'lista' | 'mapa' {
  return first(sp.vista) === 'mapa' ? 'mapa' : 'lista'
}

export function countActiveFilters(f: EventFilters): number {
  return [f.q, f.types?.length, f.city, f.from || f.to || f.when, f.modality, f.freeOnly].filter(Boolean).length
}
