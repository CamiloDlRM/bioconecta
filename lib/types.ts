export type EventType = 'charla' | 'taller' | 'voluntariado' | 'salida_de_campo' | 'siembra' | 'limpieza'
export type Modality = 'presencial' | 'virtual' | 'hibrido'
export type EventStatus = 'borrador' | 'publicado' | 'cancelado'
export type Role = 'participante' | 'organizador'
export type OrganizationType = 'fundacion' | 'universidad' | 'colectivo' | 'entidad_publica' | 'empresa' | 'otro'

export interface SustainabilityInputs {
  attendees: number            // asistentes esperados
  avgDistanceKm: number        // distancia promedio de ida, km
  transportMix: { car: number; motorcycle: number; bus: number; bikeWalk: number } // porcentajes que suman 100
  equipmentKw: number          // potencia de equipos (sonido, luces), kW
  hours: number                // horas de uso de equipos
  materials: { printedSheets: number; plasticBottles: number; disposableTableware: number; tshirts: number }
}
export interface FootprintResult {
  transportKg: number; energyKg: number; materialsKg: number; totalKg: number; perAttendeeKg: number
  level: 'bajo' | 'medio' | 'alto'
  recommendations: string[]
}
export interface EventItem {
  id: number; slug: string; organizerId: string | null; organizerName: string
  title: string; summary: string; description: string
  eventType: EventType; modality: Modality; status: EventStatus
  startsAt: string; endsAt: string            // ISO
  city: string; venueName: string | null; address: string | null
  latitude: number | null; longitude: number | null; onlineUrl: string | null
  capacity: number | null; registeredCount: number
  requirements: string | null; isFree: boolean; priceInfo: string | null
  imageUrl: string | null; sourceUrl: string | null; contactEmail: string | null
  sustainability: SustainabilityInputs | null; isDemo: boolean
}
export interface Registration { id: number; eventId: number; userId: string; fullName: string; email: string; phone: string | null; status: 'confirmada' | 'cancelada'; createdAt: string }
export interface Profile { id: string; fullName: string; email: string; role: Role; organizationName: string | null; organizationType: OrganizationType | null }
export interface EventFilters { q?: string; types?: EventType[]; city?: string; from?: string; to?: string; modality?: Modality; freeOnly?: boolean; when?: 'hoy' | 'fin-de-semana' | 'semana' | 'mes' }
