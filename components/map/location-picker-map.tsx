'use client'

import 'leaflet/dist/leaflet.css'
import type { Marker as LeafletMarker } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { BARRANQUILLA_CENTER, createMarkerIcon, OSM_ATTRIBUTION, OSM_TILES } from './marker-icon'

interface LocationPickerMapProps {
  latitude: number | null
  longitude: number | null
  color: string
  onChange: (lat: number, lng: number) => void
  className?: string
}

const round = (n: number) => Math.round(n * 1e6) / 1e6

function ClickToPlace({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(round(e.latlng.lat), round(e.latlng.lng))
    },
  })
  return null
}

function KeepInView({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position && !map.getBounds().contains(position)) map.panTo(position)
  }, [map, position])
  return null
}

export default function LocationPickerMap({ latitude, longitude, color, onChange, className }: LocationPickerMapProps) {
  const position = useMemo<[number, number] | null>(
    () => (latitude !== null && longitude !== null ? [latitude, longitude] : null),
    [latitude, longitude],
  )
  const icon = useMemo(() => createMarkerIcon(color), [color])

  return (
    <div role="region" aria-label="Mapa para elegir la ubicación. También puedes escribir las coordenadas en los campos." className={className}>
      <MapContainer center={position ?? BARRANQUILLA_CENTER} zoom={position ? 15 : 11} scrollWheelZoom={false} className="h-full w-full rounded-2xl">
        <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        <ClickToPlace onChange={onChange} />
        <KeepInView position={position} />
        {position && (
          <Marker
            position={position}
            icon={icon}
            draggable
            title="Ubicación del evento (arrastra para moverla)"
            eventHandlers={{
              dragend(e) {
                const ll = (e.target as LeafletMarker).getLatLng()
                onChange(round(ll.lat), round(ll.lng))
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
