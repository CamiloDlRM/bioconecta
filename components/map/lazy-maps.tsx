'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const MapSkeleton = () => (
  <div
    role="status"
    className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground"
  >
    <MapPin className="mr-2 size-5" aria-hidden="true" />
    <span className="text-sm font-medium">Cargando mapa…</span>
  </div>
)

const EventMapDynamic = dynamic(() => import('./event-map'), { ssr: false, loading: MapSkeleton })
const LocationPickerDynamic = dynamic(() => import('./location-picker-map'), { ssr: false, loading: MapSkeleton })

/** `className` define el tamaño del contenedor (p. ej. "h-96"). */
export function EventMap({ className, ...props }: ComponentProps<typeof EventMapDynamic>) {
  return (
    <div className={cn('relative min-h-64', className)}>
      <EventMapDynamic {...props} className="h-full w-full" />
    </div>
  )
}

export function LocationPickerMap({ className, ...props }: ComponentProps<typeof LocationPickerDynamic>) {
  return (
    <div className={cn('relative min-h-64', className)}>
      <LocationPickerDynamic {...props} className="h-full w-full" />
    </div>
  )
}
