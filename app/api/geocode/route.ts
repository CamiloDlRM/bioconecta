import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Geocodificación de direcciones para el formulario de eventos.
 * Usa Nominatim (OpenStreetMap) respetando su política de uso:
 * identifica la app, máximo ~1 consulta/segundo, resultados en caché y
 * solo para personas con sesión iniciada (evita que se use como proxy abierto).
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'BioConecta/1.0 (proyecto academico Universidad del Norte; https://bioconecta-henna.vercel.app)'
// Caja aproximada del departamento del Atlántico (lon,lat izquierda-arriba, derecha-abajo)
const ATLANTICO_VIEWBOX = '-75.30,11.15,-74.60,10.30'

type Hit = { lat: number; lng: number; label: string; precision: 'exacta' | 'aproximada' }

const cache = new Map<string, Hit | null>()
let lastCall = 0

async function politeFetch(url: string) {
  const wait = lastCall + 1100 - Date.now()
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastCall = Date.now()
  return fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'es' },
    next: { revalidate: 60 * 60 * 24 * 7 },
  })
}

/**
 * En Nominatim, place_rank 30 = sitio o edificio; 26–27 = vía; ≤ 25 = barrio, ciudad o región.
 * Todo lo que no sea un sitio concreto se marca como ubicación aproximada.
 */
const isApproximate = (r: { category?: string; place_rank?: number }) =>
  r.category === 'highway' || (r.place_rank ?? 30) < 28

async function search(
  q: string,
  bounded: boolean,
): Promise<{ lat: number; lng: number; label: string; approximate: boolean } | null> {
  const params = new URLSearchParams({
    q,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'co',
    addressdetails: '0',
    viewbox: ATLANTICO_VIEWBOX,
    bounded: bounded ? '1' : '0',
  })
  const res = await politeFetch(`${NOMINATIM}?${params}`)
  if (!res.ok) throw new Error(`Nominatim ${res.status}`)
  const data = (await res.json()) as {
    lat: string
    lon: string
    display_name: string
    category?: string
    place_rank?: number
  }[]
  const first = data[0]
  if (!first) return null
  return {
    lat: Math.round(Number(first.lat) * 1e6) / 1e6,
    lng: Math.round(Number(first.lon) * 1e6) / 1e6,
    label: first.display_name.split(',').slice(0, 3).join(',').trim(),
    approximate: isApproximate(first),
  }
}

/** "Calle 76 # 68-40" → "Calle 76 68-40" (Nominatim no entiende "#" ni "No.") */
function cleanAddress(a: string) {
  return a
    .replace(/\b(n[°º.o]|no\.?|num\.?|número)\s*/gi, ' ')
    .replace(/#/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const address = (sp.get('address') ?? '').slice(0, 160).trim()
  const venue = (sp.get('venue') ?? '').slice(0, 160).trim()
  const city = (sp.get('city') ?? 'Barranquilla').slice(0, 80).trim() || 'Barranquilla'
  if (address.length < 4 && venue.length < 4) return NextResponse.json({ found: false })

  const key = `${address}|${venue}|${city}`.toLowerCase()
  if (cache.has(key)) {
    const hit = cache.get(key)
    return NextResponse.json(hit ? { found: true, ...hit } : { found: false })
  }

  // Máximo 2 consultas (política de 1/s de Nominatim): primero el lugar, que suele estar
  // mapeado con precisión; luego la dirección (en Colombia casi siempre ubica solo la vía).
  const queries: string[] = []
  if (venue.length >= 4) queries.push(`${venue}, ${city}`)
  if (address.length >= 4) queries.push(`${cleanAddress(address)}, ${city}`)
  else if (venue.length >= 4) queries.push(venue)

  try {
    let fallback: Hit | null = null
    for (const q of queries.slice(0, 2)) {
      const hit = await search(q, true)
      if (!hit) continue
      const result: Hit = {
        lat: hit.lat,
        lng: hit.lng,
        label: hit.label,
        precision: hit.approximate ? 'aproximada' : 'exacta',
      }
      if (result.precision === 'exacta') {
        cache.set(key, result)
        return NextResponse.json({ found: true, ...result })
      }
      fallback ??= result
    }
    cache.set(key, fallback)
    return NextResponse.json(fallback ? { found: true, ...fallback } : { found: false })
  } catch (e) {
    console.error('[geocode]', e)
    return NextResponse.json({ error: 'No pudimos consultar el mapa en este momento.' }, { status: 502 })
  }
}
