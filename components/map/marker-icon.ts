import { divIcon } from 'leaflet'

/** Marcador DivIcon (gota) con el color del tipo de evento; evita los PNG por defecto de Leaflet. */
export function createMarkerIcon(color: string) {
  return divIcon({
    className: 'bc-marker',
    html: `<span style="background:${color}"><i></i></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 36],
    popupAnchor: [0, -34],
  })
}

export const BARRANQUILLA_CENTER: [number, number] = [10.9878, -74.7889]

export const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
