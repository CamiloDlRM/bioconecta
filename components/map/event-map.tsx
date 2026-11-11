'use client'

import 'leaflet/dist/leaflet.css'
import { latLngBounds } from 'leaflet'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { TypeBadge } from '@/components/events/type-badge'
import { EVENT_TYPES } from '@/lib/event-types'
import { formatEventDate } from '@/lib/format'
import type { EventItem } from '@/lib/types'
import { BARRANQUILLA_CENTER, createMarkerIcon, OSM_ATTRIBUTION, OSM_TILES } from './marker-icon'

type MapEvent = Pick<
  EventItem,
  'id' | 'slug' | 'title' | 'eventType' | 'startsAt' | 'venueName' | 'city' | 'latitude' | 'longitude'
>

interface EventMapProps {
  events: MapEvent[]
  className?: string
  /** Si es true no muestra enlace en el popup (p. ej. en la ficha del propio evento). */
  linkToEvent?: boolean
  singleZoom?: number
}

function FitBounds({ points, singleZoom }: { points: [number, number][]; singleZoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], singleZoom)
      return
    }
    map.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: 14 })
  }, [map, points, singleZoom])
  return null
}

export default function EventMap({ events, className, linkToEvent = true, singleZoom = 15 }: EventMapProps) {
  const located = useMemo(
    () => events.filter((e): e is MapEvent & { latitude: number; longitude: number } => e.latitude !== null && e.longitude !== null),
    [events],
  )
  const points = useMemo<[number, number][]>(() => located.map((e) => [e.latitude, e.longitude]), [located])

  return (
    <div
      role="region"
      aria-label="Mapa de ubicación de los eventos. La misma información está disponible en texto."
      className={className}
    >
      <MapContainer
        center={points[0] ?? BARRANQUILLA_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full rounded-2xl"
      >
        <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        <FitBounds points={points} singleZoom={singleZoom} />
        {located.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={createMarkerIcon(EVENT_TYPES[event.eventType].color)}
            title={event.title}
            alt={`${EVENT_TYPES[event.eventType].label}: ${event.title}`}
          >
            <Popup>
              <div className="flex min-w-44 flex-col items-start gap-1.5">
                <TypeBadge type={event.eventType} />
                {linkToEvent ? (
                  <Link
                    href={`/eventos/${event.slug}`}
                    className="font-display text-base leading-snug font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    {event.title}
                  </Link>
                ) : (
                  <strong className="font-display text-base leading-snug">{event.title}</strong>
                )}
                <span className="text-sm text-muted-foreground">{formatEventDate(event.startsAt)}</span>
                <span className="text-sm text-muted-foreground">{event.venueName ?? event.city}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
