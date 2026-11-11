import type { EventItem } from './types'

export type CapacityState = 'sin-limite' | 'disponible' | 'ultimos' | 'agotado'

export interface CapacityInfo {
  state: CapacityState
  remaining: number | null
  /** 0–100, porcentaje de cupos ocupados. */
  percent: number
  label: string
}

export function getCapacity(event: Pick<EventItem, 'capacity' | 'registeredCount'>): CapacityInfo {
  const { capacity, registeredCount } = event
  if (capacity === null) {
    return { state: 'sin-limite', remaining: null, percent: 0, label: 'Cupos abiertos' }
  }
  const remaining = Math.max(0, capacity - registeredCount)
  const percent = Math.min(100, Math.round((registeredCount / capacity) * 100))
  if (remaining === 0) return { state: 'agotado', remaining, percent: 100, label: 'Cupos agotados' }
  if (remaining <= 5 || remaining / capacity <= 0.2) {
    return {
      state: 'ultimos',
      remaining,
      percent,
      label: `Últimos cupos · ${remaining === 1 ? 'queda 1' : `quedan ${remaining}`}`,
    }
  }
  return { state: 'disponible', remaining, percent, label: `${remaining} cupos disponibles` }
}
