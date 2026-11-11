import { TZDate } from '@date-fns/tz'
import { differenceInCalendarDays, differenceInMinutes, format } from 'date-fns'
import { es } from 'date-fns/locale'

export const TIMEZONE = 'America/Bogota'

export const inBogota = (value: Date | string | number) => new TZDate(new Date(value).getTime(), TIMEZONE)

export const nowInBogota = () => new TZDate(Date.now(), TIMEZONE)

/** "7:00 a. m." — date-fns `es` devuelve "AM"/"PM", así que el meridiano se arma a mano. */
function clock(date: Date): string {
  return `${format(date, 'h:mm', { locale: es })} ${date.getHours() < 12 ? 'a. m.' : 'p. m.'}`
}

/** "sáb 15 nov · 7:00 a. m." */
export function formatEventDate(iso: string): string {
  const d = inBogota(iso)
  return `${format(d, 'EEE d MMM', { locale: es })} · ${clock(d)}`
}

/** "sábado 15 de noviembre de 2026" */
export function formatLongDate(iso: string): string {
  return format(inBogota(iso), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
}

export function formatTime(iso: string): string {
  return clock(inBogota(iso))
}

export function formatShortDay(iso: string): { weekday: string; day: string; month: string } {
  const d = inBogota(iso)
  return {
    weekday: format(d, 'EEE', { locale: es }),
    day: format(d, 'd', { locale: es }),
    month: format(d, 'MMM', { locale: es }),
  }
}

export function formatDuration(startIso: string, endIso: string): string {
  const minutes = Math.max(0, differenceInMinutes(new Date(endIso), new Date(startIso)))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} ${h === 1 ? 'hora' : 'horas'}`
  return `${h} h ${m} min`
}

/** "sáb 15 nov · 7:00 a. m. – 11:00 a. m." */
export function formatEventRange(startIso: string, endIso: string): string {
  const sameDay = format(inBogota(startIso), 'yyyy-MM-dd') === format(inBogota(endIso), 'yyyy-MM-dd')
  return sameDay
    ? `${formatEventDate(startIso)} – ${formatTime(endIso)}`
    : `${formatEventDate(startIso)} – ${formatEventDate(endIso)}`
}

export function isPast(endIso: string): boolean {
  return new Date(endIso).getTime() < Date.now()
}

/** Etiqueta de cuenta regresiva: "Hoy", "Mañana", "Faltan 3 días". */
export function countdownLabel(startIso: string): string {
  const diffMs = new Date(startIso).getTime() - Date.now()
  if (diffMs <= 0) return 'En curso'
  const days = differenceInCalendarDays(inBogota(startIso), nowInBogota())
  if (days === 0) {
    const hours = Math.max(1, Math.round(diffMs / 3_600_000))
    return hours <= 1 ? 'Empieza en menos de 1 hora' : `Faltan ${hours} horas`
  }
  if (days === 1) return 'Mañana'
  return `Faltan ${days} días`
}

/** Mensaje para el recordatorio de 48 h: "Mañana tienes…" / "Hoy tienes…" / "Pasado mañana tienes…". */
export function reminderPrefix(startIso: string): string {
  const days = differenceInCalendarDays(inBogota(startIso), nowInBogota())
  if (days <= 0) return 'Hoy tienes'
  if (days === 1) return 'Mañana tienes'
  return 'Pasado mañana tienes'
}

export function isWithinHours(startIso: string, hours: number): boolean {
  const diff = new Date(startIso).getTime() - Date.now()
  return diff > 0 && diff <= hours * 3_600_000
}

/** ISO -> valor de <input type="datetime-local"> en hora de Bogotá. */
export function isoToLocalInput(iso: string): string {
  return format(inBogota(iso), "yyyy-MM-dd'T'HH:mm")
}

/** Valor de <input type="datetime-local"> (hora de Bogotá) -> ISO UTC. */
export function localInputToIso(value: string): string {
  const [date, time = '00:00'] = value.split('T')
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return new Date(new TZDate(y, mo - 1, d, h, mi, 0, TIMEZONE).getTime()).toISOString()
}

export function formatDateTimeShort(iso: string): string {
  const d = inBogota(iso)
  return `${format(d, 'd MMM yyyy', { locale: es })}, ${clock(d)}`
}

export function formatKg(value: number): string {
  return value.toLocaleString('es-CO', { maximumFractionDigits: 1 })
}

export function formatCop(value: number): string {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}
