import {
  Binoculars,
  HandHeart,
  Mic,
  Recycle,
  Sprout,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { EventType, Modality, OrganizationType } from './types'

export interface EventTypeMeta {
  value: EventType
  label: string
  plural: string
  description: string
  icon: LucideIcon
  /** Color sólido (marcadores, portadas). */
  color: string
  /** Variable CSS del color (tema claro/oscuro). */
  cssVar: string
  /** Variable CSS del texto sobre tinte (cumple contraste AA). */
  inkVar: string
}

const make = (
  value: EventType,
  label: string,
  plural: string,
  description: string,
  icon: LucideIcon,
  color: string,
): EventTypeMeta => ({
  value,
  label,
  plural,
  description,
  icon,
  color,
  cssVar: `var(--type-${value})`,
  inkVar: `var(--type-${value}-ink)`,
})

export const EVENT_TYPES: Record<EventType, EventTypeMeta> = {
  charla: make('charla', 'Charla', 'Charlas', 'Conversatorios y conferencias con personas expertas.', Mic, '#1F6F7F'),
  taller: make('taller', 'Taller', 'Talleres', 'Aprende haciendo: compostaje, fauna, restauración.', Wrench, '#C98A1B'),
  voluntariado: make('voluntariado', 'Voluntariado', 'Voluntariados', 'Jornadas para sumar manos al cuidado del territorio.', HandHeart, '#D9604A'),
  salida_de_campo: make('salida_de_campo', 'Salida de campo', 'Salidas de campo', 'Recorridos guiados por ecosistemas locales.', Binoculars, '#0E4D3A'),
  siembra: make('siembra', 'Siembra', 'Siembras', 'Plantación de manglar y bosque seco tropical.', Sprout, '#5E8C31'),
  limpieza: make('limpieza', 'Limpieza', 'Limpiezas', 'Jornadas de limpieza de playas, caños y ciénagas.', Recycle, '#2F6DB5'),
}

export const EVENT_TYPE_LIST: EventTypeMeta[] = Object.values(EVENT_TYPES)

export const MODALITY_LABELS: Record<Modality, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
}

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  fundacion: 'Fundación',
  universidad: 'Universidad',
  colectivo: 'Colectivo ciudadano',
  entidad_publica: 'Entidad pública',
  empresa: 'Empresa',
  otro: 'Otro',
}

export function getEventTypeMeta(type: EventType): EventTypeMeta {
  return EVENT_TYPES[type]
}
