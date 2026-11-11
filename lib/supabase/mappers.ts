import type { Database } from './database.types'
import type {
  EventItem,
  EventStatus,
  EventType,
  Modality,
  OrganizationType,
  Profile,
  Registration,
  Role,
  SustainabilityInputs,
} from '@/lib/types'

export type EventRow = Database['public']['Tables']['events']['Row']
export type RegistrationRow = Database['public']['Tables']['registrations']['Row']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']

/** Columnas de evento que se leen desde la base de datos. */
export const EVENT_COLUMNS =
  'id, slug, organizer_id, organizer_name, title, summary, description, event_type, modality, status, starts_at, ends_at, city, venue_name, address, latitude, longitude, online_url, capacity, registered_count, requirements, is_free, price_info, image_url, source_url, contact_email, sustainability, is_demo' as const

function toSustainability(value: unknown): SustainabilityInputs | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Partial<SustainabilityInputs>
  return {
    attendees: Number(v.attendees ?? 0),
    avgDistanceKm: Number(v.avgDistanceKm ?? 0),
    transportMix: {
      car: Number(v.transportMix?.car ?? 0),
      motorcycle: Number(v.transportMix?.motorcycle ?? 0),
      bus: Number(v.transportMix?.bus ?? 0),
      bikeWalk: Number(v.transportMix?.bikeWalk ?? 0),
    },
    equipmentKw: Number(v.equipmentKw ?? 0),
    hours: Number(v.hours ?? 0),
    materials: {
      printedSheets: Number(v.materials?.printedSheets ?? 0),
      plasticBottles: Number(v.materials?.plasticBottles ?? 0),
      disposableTableware: Number(v.materials?.disposableTableware ?? 0),
      tshirts: Number(v.materials?.tshirts ?? 0),
    },
  }
}

export function rowToEvent(r: Omit<EventRow, 'created_at' | 'updated_at'>): EventItem {
  return {
    id: r.id,
    slug: r.slug,
    organizerId: r.organizer_id,
    organizerName: r.organizer_name,
    title: r.title,
    summary: r.summary,
    description: r.description,
    eventType: r.event_type as EventType,
    modality: r.modality as Modality,
    status: r.status as EventStatus,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    city: r.city,
    venueName: r.venue_name,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    onlineUrl: r.online_url,
    capacity: r.capacity,
    registeredCount: r.registered_count,
    requirements: r.requirements,
    isFree: r.is_free,
    priceInfo: r.price_info,
    imageUrl: r.image_url,
    sourceUrl: r.source_url,
    contactEmail: r.contact_email,
    sustainability: toSustainability(r.sustainability),
    isDemo: r.is_demo,
  }
}

export function rowToRegistration(r: RegistrationRow): Registration {
  return {
    id: r.id,
    eventId: r.event_id,
    userId: r.user_id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    status: r.status as Registration['status'],
    createdAt: r.created_at,
  }
}

export function rowToProfile(r: ProfileRow, email: string): Profile {
  return {
    id: r.id,
    fullName: r.full_name,
    email,
    role: r.role as Role,
    organizationName: r.organization_name,
    organizationType: r.organization_type as OrganizationType | null,
  }
}
