import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { EVENT_COLUMNS, rowToEvent, rowToProfile, rowToRegistration } from '@/lib/supabase/mappers'
import type { EventFilters, EventItem, Profile, Registration } from '@/lib/types'

/*
 * Capa de datos (backend). Todas las consultas usan la sesión del usuario,
 * por lo que las políticas RLS de Supabase deciden qué filas puede ver cada quien.
 */

const BOGOTA_OFFSET_HOURS = -5 // Colombia no usa horario de verano

/** Fecha "de pared" en Bogotá → instante UTC (ISO). */
function bogotaToUtc(y: number, m: number, d: number, hh = 0, mm = 0, ss = 0, ms = 0) {
  return new Date(Date.UTC(y, m, d, hh - BOGOTA_OFFSET_HOURS, mm, ss, ms))
}

function bogotaParts(date = new Date()) {
  const shifted = new Date(date.getTime() + BOGOTA_OFFSET_HOURS * 3600_000)
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
    dow: shifted.getUTCDay(), // 0 = domingo
  }
}

/** Rango [desde, hasta] para los atajos de "Cuándo". */
export function presetRange(when: NonNullable<EventFilters['when']>, now = new Date()) {
  const { y, m, d, dow } = bogotaParts(now)
  const endOfDay = (dd: number, mm = m, yy = y) => bogotaToUtc(yy, mm, dd, 23, 59, 59, 999)
  switch (when) {
    case 'hoy':
      return { from: now, to: endOfDay(d) }
    case 'fin-de-semana': {
      if (dow === 6) return { from: now, to: endOfDay(d + 1) }
      if (dow === 0) return { from: now, to: endOfDay(d) }
      const toSat = 6 - dow
      return { from: bogotaToUtc(y, m, d + toSat), to: endOfDay(d + toSat + 1) }
    }
    case 'semana':
      return { from: now, to: new Date(now.getTime() + 7 * 24 * 3600_000) }
    case 'mes':
      return { from: now, to: endOfDay(0, m + 1) } // día 0 del mes siguiente = último día del mes
  }
}

function parseDateOnly(value: string | undefined, endOfDay: boolean) {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  return endOfDay ? bogotaToUtc(y, m - 1, d, 23, 59, 59, 999) : bogotaToUtc(y, m - 1, d)
}

/** Escapa comodines para usar texto del usuario dentro de un filtro ilike / or(). */
function sanitizeSearch(q: string) {
  return q
    .replace(/[%_\\]/g, (c) => `\\${c}`)
    .replace(/[(),."']/g, ' ')
    .trim()
    .slice(0, 80)
}

export async function getEvents(filters: EventFilters = {}): Promise<EventItem[]> {
  const supabase = await createClient()
  const now = new Date()

  let from: Date = now
  let to: Date | null = null
  if (filters.when) {
    const range = presetRange(filters.when, now)
    from = range.from > now ? range.from : now
    to = range.to
  }
  const customFrom = parseDateOnly(filters.from, false)
  const customTo = parseDateOnly(filters.to, true)
  if (customFrom && customFrom > from) from = customFrom
  if (customTo) to = to && to < customTo ? to : customTo

  let query = supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('status', 'publicado')
    // Eventos que aún no terminan (incluye los que están en curso)
    .gte('ends_at', from.toISOString())
    .order('starts_at', { ascending: true })
    .limit(200)

  if (to) query = query.lte('starts_at', to.toISOString())
  if (filters.types?.length) query = query.in('event_type', filters.types)
  if (filters.city) query = query.eq('city', filters.city)
  if (filters.modality) query = query.eq('modality', filters.modality)
  if (filters.freeOnly) query = query.eq('is_free', true)
  if (filters.q) {
    const q = sanitizeSearch(filters.q)
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,summary.ilike.%${q}%,organizer_name.ilike.%${q}%,venue_name.ilike.%${q}%,city.ilike.%${q}%`,
      )
    }
  }

  const { data, error } = await query
  if (error) {
    console.error('[getEvents]', error.message)
    return []
  }
  return (data ?? []).map(rowToEvent)
}

export const getEventBySlug = cache(async (slug: string): Promise<EventItem | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.from('events').select(EVENT_COLUMNS).eq('slug', slug).maybeSingle()
  if (error) console.error('[getEventBySlug]', error.message)
  return data ? rowToEvent(data) : null
})

export async function getCities(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('city').eq('status', 'publicado')
  const cities = new Set((data ?? []).map((r) => r.city).filter(Boolean))
  return [...cities].sort((a, b) => a.localeCompare(b, 'es'))
}

/** Usuario autenticado (validado con getClaims) o null. Se memoriza por request. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) return null
  return { id: claims.sub as string, email: (claims.email as string | undefined) ?? '' }
})

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, organization_name, organization_type, phone, website, bio, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle()
  if (!data) {
    return { id: user.id, fullName: '', email: user.email, role: 'participante', organizationName: null, organizationType: null }
  }
  return rowToProfile(data, user.email)
})

export async function getMyRegistrations(): Promise<(Registration & { event: EventItem })[]> {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registrations')
    .select(`id, event_id, user_id, full_name, email, phone, status, created_at, updated_at, event:events(${EVENT_COLUMNS})`)
    .eq('user_id', user.id)
    .eq('status', 'confirmada')
  if (error) {
    console.error('[getMyRegistrations]', error.message)
    return []
  }
  return (data ?? [])
    .filter((r) => r.event)
    .map((r) => ({ ...rowToRegistration(r), event: rowToEvent(r.event as never) }))
    .sort((a, b) => a.event.startsAt.localeCompare(b.event.startsAt))
}

export async function getMyRegistrationForEvent(eventId: number): Promise<Registration | null> {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('registrations')
    .select('id, event_id, user_id, full_name, email, phone, status, created_at, updated_at')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle()
  return data && data.status === 'confirmada' ? rowToRegistration(data) : null
}

export async function getOrganizerEvents(): Promise<EventItem[]> {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('organizer_id', user.id)
    .order('starts_at', { ascending: false })
  if (error) console.error('[getOrganizerEvents]', error.message)
  return (data ?? []).map(rowToEvent)
}

export async function getOrganizerEventById(id: number): Promise<EventItem | null> {
  const user = await getCurrentUser()
  if (!user || !Number.isFinite(id)) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('id', id)
    .eq('organizer_id', user.id)
    .maybeSingle()
  return data ? rowToEvent(data) : null
}

export async function getEventRegistrations(eventId: number): Promise<Registration[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registrations')
    .select('id, event_id, user_id, full_name, email, phone, status, created_at, updated_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  if (error) console.error('[getEventRegistrations]', error.message)
  return (data ?? []).map(rowToRegistration)
}
