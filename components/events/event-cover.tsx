import { EVENT_TYPES } from '@/lib/event-types'
import { cn } from '@/lib/utils'
import type { EventItem } from '@/lib/types'

type CoverEvent = Pick<EventItem, 'id' | 'slug' | 'eventType' | 'title' | 'imageUrl'>

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let s = seed || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 10000) / 10000
  }
}

const f = (n: number) => Math.round(n * 10) / 10

/** Curva cerrada suave a través de los puntos (punto medio + cuadráticas). */
function closedSmooth(points: [number, number][]): string {
  const n = points.length
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const start = mid(points[n - 1], points[0])
  let d = `M${f(start[0])} ${f(start[1])}`
  for (let i = 0; i < n; i++) {
    const p = points[i]
    const m = mid(p, points[(i + 1) % n])
    d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`
  }
  return d + 'Z'
}

function contours(rand: () => number) {
  const cx = 80 + rand() * 240
  const cy = 50 + rand() * 140
  const segments = 14
  const noise = Array.from({ length: segments }, () => 0.72 + rand() * 0.56)
  const stretch = 1.3 + rand() * 0.5
  return Array.from({ length: 11 }, (_, k) => {
    const r = 14 + k * 17
    const pts = noise.map((nz, i): [number, number] => {
      const a = (i / segments) * Math.PI * 2
      const rr = r * (1 + (nz - 1) * (0.5 + k * 0.05))
      return [cx + Math.cos(a) * rr * stretch, cy + Math.sin(a) * rr]
    })
    return { d: closedSmooth(pts), opacity: 0.16 + (k % 3 === 0 ? 0.12 : 0) }
  })
}

function leaves(rand: () => number) {
  return Array.from({ length: 16 }, () => ({
    x: rand() * 400,
    y: rand() * 240,
    r: rand() * 360,
    s: 0.8 + rand() * 1.5,
    o: 0.1 + rand() * 0.18,
  }))
}

function waves(rand: () => number) {
  return Array.from({ length: 9 }, (_, i) => {
    const amp = 6 + rand() * 8
    const y = 26 + i * 24
    const phase = -rand() * 60
    let d = `M${f(phase)} ${y} q${f(25)} ${-amp} 50 0`
    for (let k = 0; k < 9; k++) d += ' t50 0'
    return { d, o: 0.14 + (i % 2) * 0.12 }
  })
}

const PATTERN: Record<EventItem['eventType'], 'contours' | 'leaves' | 'waves'> = {
  charla: 'contours',
  taller: 'leaves',
  voluntariado: 'leaves',
  salida_de_campo: 'contours',
  siembra: 'leaves',
  limpieza: 'waves',
}

interface EventCoverProps {
  event: CoverEvent
  className?: string
  /** Muestra el ícono del tipo sobre la ilustración. */
  showIcon?: boolean
}

export function EventCover({ event, className, showIcon = true }: EventCoverProps) {
  const meta = EVENT_TYPES[event.eventType]
  const Icon = meta.icon

  if (event.imageUrl) {
    return (
      <div className={cn('relative overflow-hidden bg-muted', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
      </div>
    )
  }

  const rand = rng(hash(`${event.slug}-${event.id}`))
  const kind = PATTERN[event.eventType]

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ backgroundColor: meta.color }} aria-hidden="true">
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" fill="none">
        <rect width="400" height="240" fill="#000" fillOpacity="0.12" />
        {kind === 'contours' &&
          contours(rand).map((c, i) => <path key={i} d={c.d} stroke="#fff" strokeOpacity={c.opacity} strokeWidth="1.4" />)}
        {kind === 'leaves' &&
          leaves(rand).map((l, i) => (
            <g key={i} transform={`translate(${f(l.x)} ${f(l.y)}) rotate(${f(l.r)}) scale(${f(l.s)})`}>
              <path d="M0-22C14-11 14 11 0 22 -14 11 -14-11 0-22Z" fill="#fff" fillOpacity={l.o * 0.6} stroke="#fff" strokeOpacity={l.o + 0.1} />
              <path d="M0-18V18" stroke="#fff" strokeOpacity={l.o + 0.1} />
            </g>
          ))}
        {kind === 'waves' &&
          waves(rand).map((w, i) => <path key={i} d={w.d} stroke="#fff" strokeOpacity={w.o + 0.08} strokeWidth="1.6" strokeLinecap="round" />)}
      </svg>
      {showIcon && (
        <span className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-xl bg-card/95 shadow-sm" style={{ color: meta.inkVar }}>
          <Icon className="size-5" strokeWidth={2} />
        </span>
      )}
    </div>
  )
}
