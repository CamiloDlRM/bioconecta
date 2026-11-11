import type { EventItem } from './types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bioconecta.vercel.app'

/** 20261115T120000Z */
function toIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function locationText(event: EventItem): string {
  if (event.modality === 'virtual') return event.onlineUrl ?? 'Evento virtual'
  return [event.venueName, event.address, event.city].filter(Boolean).join(', ')
}

function detailsText(event: EventItem): string {
  const parts = [event.summary]
  if (event.modality !== 'presencial' && event.onlineUrl) parts.push(`Enlace: ${event.onlineUrl}`)
  parts.push(`Más información: ${SITE_URL}/eventos/${event.slug}`)
  return parts.join('\n\n')
}

export function googleCalendarUrl(event: EventItem): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toIcsUtc(event.startsAt)}/${toIcsUtc(event.endsAt)}`,
    details: detailsText(event),
    location: locationText(event),
    ctz: 'America/Bogota',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const escapeIcs = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Pliega líneas a 75 octetos como pide RFC 5545. */
function fold(line: string): string {
  const chunks: string[] = []
  let rest = line
  while (rest.length > 74) {
    chunks.push(rest.slice(0, 74))
    rest = ` ${rest.slice(74)}`
  }
  chunks.push(rest)
  return chunks.join('\r\n')
}

export function buildIcs(event: EventItem): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BioConecta//Eventos por la biodiversidad//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:evento-${event.id}@bioconecta`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(event.startsAt)}`,
    `DTEND:${toIcsUtc(event.endsAt)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(detailsText(event))}`,
    `LOCATION:${escapeIcs(locationText(event))}`,
    `URL:${SITE_URL}/eventos/${event.slug}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(`Mañana: ${event.title}`)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

export const icsPath = (event: Pick<EventItem, 'slug'>) => `/eventos/${event.slug}/calendario.ics`
