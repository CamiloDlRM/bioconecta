import { z } from 'zod'
import { isoToLocalInput, localInputToIso } from './format'
import { DEFAULT_SUSTAINABILITY } from './footprint'
import type { EventItem, EventStatus } from './types'

const isUrl = (v: string) => {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

const count = z.number({ error: 'Ingresa un número' }).min(0, 'No puede ser negativo')

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(5, 'Escribe un título de al menos 5 caracteres').max(120, 'Máximo 120 caracteres'),
    summary: z.string().trim().min(10, 'Escribe un resumen de al menos 10 caracteres').max(280, 'Máximo 280 caracteres'),
    description: z.string().trim().min(20, 'Describe el evento con al menos 20 caracteres'),
    eventType: z.enum(['charla', 'taller', 'voluntariado', 'salida_de_campo', 'siembra', 'limpieza']),
    modality: z.enum(['presencial', 'virtual', 'hibrido']),
    organizerName: z.string().trim().min(2, 'Indica el nombre del organizador'),
    startsAt: z.string().min(1, 'Indica la fecha y hora de inicio'),
    endsAt: z.string().min(1, 'Indica la fecha y hora de fin'),
    city: z.string().trim().min(2, 'Indica la ciudad'),
    venueName: z.string().trim(),
    address: z.string().trim(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    onlineUrl: z.string().trim(),
    capacity: z.number({ error: 'Ingresa un número' }).int('Debe ser un número entero').positive('Debe ser mayor que 0').nullable(),
    requirements: z.string().trim(),
    isFree: z.boolean(),
    priceInfo: z.string().trim(),
    contactEmail: z.string().trim(),
    sourceUrl: z.string().trim(),
    includeSustainability: z.boolean(),
    sustainability: z.object({
      attendees: count.int('Debe ser un número entero'),
      avgDistanceKm: count,
      transportMix: z.object({ car: count.max(100), motorcycle: count.max(100), bus: count.max(100), bikeWalk: count.max(100) }),
      equipmentKw: count,
      hours: count,
      materials: z.object({
        printedSheets: count.int(),
        plasticBottles: count.int(),
        disposableTableware: count.int(),
        tshirts: count.int(),
      }),
    }),
  })
  .superRefine((v, ctx) => {
    const add = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message })

    if (v.startsAt && v.endsAt && v.endsAt <= v.startsAt) {
      add(['endsAt'], 'El fin debe ser posterior al inicio')
    }
    if (v.modality !== 'virtual' && !v.venueName && !v.address) {
      add(['venueName'], 'Indica el nombre del lugar o la dirección')
    }
    if (v.modality !== 'virtual' && (v.latitude === null || v.longitude === null)) {
      add(['latitude'], 'Marca la ubicación del evento en el mapa')
    }
    if (v.modality !== 'presencial') {
      if (!v.onlineUrl) add(['onlineUrl'], 'Indica el enlace de la sesión virtual')
      else if (!isUrl(v.onlineUrl)) add(['onlineUrl'], 'Ingresa una URL válida (https://…)')
    }
    if (!v.isFree && !v.priceInfo) add(['priceInfo'], 'Indica el valor o la información de precio')
    if (v.contactEmail && !isEmail(v.contactEmail)) add(['contactEmail'], 'Ingresa un correo válido')
    if (v.sourceUrl && !isUrl(v.sourceUrl)) add(['sourceUrl'], 'Ingresa una URL válida (https://…)')

    if (v.includeSustainability && v.modality !== 'virtual') {
      const m = v.sustainability.transportMix
      const sum = m.car + m.motorcycle + m.bus + m.bikeWalk
      if (Math.round(sum) !== 100) {
        add(['sustainability', 'transportMix'], `La mezcla de transporte debe sumar 100 % (suma ${Math.round(sum)} %)`)
      }
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>

export const emptyEventForm = (organizerName = ''): EventFormValues => ({
  title: '',
  summary: '',
  description: '',
  eventType: 'charla',
  modality: 'presencial',
  organizerName,
  startsAt: '',
  endsAt: '',
  city: 'Barranquilla',
  venueName: '',
  address: '',
  latitude: null,
  longitude: null,
  onlineUrl: '',
  capacity: null,
  requirements: '',
  isFree: true,
  priceInfo: '',
  contactEmail: '',
  sourceUrl: '',
  includeSustainability: true,
  sustainability: DEFAULT_SUSTAINABILITY,
})

export function eventToFormValues(event: EventItem): EventFormValues {
  return {
    title: event.title,
    summary: event.summary,
    description: event.description,
    eventType: event.eventType,
    modality: event.modality,
    organizerName: event.organizerName,
    startsAt: isoToLocalInput(event.startsAt),
    endsAt: isoToLocalInput(event.endsAt),
    city: event.city,
    venueName: event.venueName ?? '',
    address: event.address ?? '',
    latitude: event.latitude,
    longitude: event.longitude,
    onlineUrl: event.onlineUrl ?? '',
    capacity: event.capacity,
    requirements: event.requirements ?? '',
    isFree: event.isFree,
    priceInfo: event.priceInfo ?? '',
    contactEmail: event.contactEmail ?? '',
    sourceUrl: event.sourceUrl ?? '',
    includeSustainability: event.sustainability !== null,
    sustainability: event.sustainability ?? DEFAULT_SUSTAINABILITY,
  }
}

export function formValuesToEventFields(v: EventFormValues, status: EventStatus) {
  const physical = v.modality !== 'virtual'
  return {
    title: v.title,
    summary: v.summary,
    description: v.description,
    eventType: v.eventType,
    modality: v.modality,
    status,
    organizerName: v.organizerName,
    startsAt: localInputToIso(v.startsAt),
    endsAt: localInputToIso(v.endsAt),
    city: v.city,
    venueName: physical ? v.venueName || null : null,
    address: physical ? v.address || null : null,
    latitude: physical ? v.latitude : null,
    longitude: physical ? v.longitude : null,
    onlineUrl: v.modality === 'presencial' ? null : v.onlineUrl || null,
    capacity: v.capacity,
    requirements: v.requirements || null,
    isFree: v.isFree,
    priceInfo: v.isFree ? null : v.priceInfo || null,
    contactEmail: v.contactEmail || null,
    sourceUrl: v.sourceUrl || null,
    sustainability: physical && v.includeSustainability ? v.sustainability : null,
  }
}

export const registrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Escribe tu nombre completo'),
  email: z.string().trim().refine(isEmail, 'Ingresa un correo válido'),
  phone: z.string().trim().optional(),
  accept: z.literal('on', { error: 'Debes aceptar el tratamiento de datos para inscribirte' }),
})
