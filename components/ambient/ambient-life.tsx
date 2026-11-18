import type { CSSProperties } from 'react'

/**
 * Vida de fondo: pájaros volando (tema claro) y luciérnagas (tema oscuro).
 * Va detrás del contenido (z-index negativo), no recibe clics y se oculta con
 * "reducir movimiento". Todo es CSS, sin JavaScript en el cliente.
 */

type Bird = { top: number; size: number; dur: number; delay: number; reverse?: boolean; mobile?: boolean }

const BIRDS: Bird[] = [
  { top: 14, size: 30, dur: 30, delay: -4, mobile: true },
  { top: 9, size: 22, dur: 38, delay: -18, reverse: true },
  { top: 24, size: 26, dur: 34, delay: -26, mobile: true },
  { top: 32, size: 18, dur: 44, delay: -9, reverse: true },
  { top: 18, size: 20, dur: 41, delay: -33 },
]

// Posiciones pseudoaleatorias fijas (iguales en servidor y cliente)
const FIREFLIES = Array.from({ length: 20 }, (_, i) => {
  const rnd = (n: number) => {
    const x = Math.sin((i + 1) * 9301 + n * 49297) * 233280
    return x - Math.floor(x)
  }
  return {
    left: 3 + rnd(1) * 94,
    top: 8 + rnd(2) * 86,
    size: 4 + Math.round(rnd(3) * 4),
    drift: 9 + rnd(4) * 10,
    glow: 2.4 + rnd(5) * 3,
    delay: -rnd(6) * 10,
    mobile: i % 2 === 0,
  }
})

function BirdShape() {
  return (
    <svg viewBox="0 0 48 24" className="bird__svg">
      <path className="bird__wing bird__wing--l" d="M24 14 C18 6 10 4 2 7 C10 8 16 11 24 16 Z" fill="currentColor" />
      <path className="bird__wing bird__wing--r" d="M24 14 C30 6 38 4 46 7 C38 8 32 11 24 16 Z" fill="currentColor" />
      <ellipse cx="24" cy="15" rx="3" ry="2.2" fill="currentColor" />
    </svg>
  )
}

export function AmbientLife() {
  return (
    <div className="ambient-life" aria-hidden="true">
      <div className="ambient-birds">
        {BIRDS.map((b, i) => (
          <div
            key={i}
            className={`bird${b.reverse ? ' bird--reverse' : ''}${b.mobile ? '' : ' bird--desktop'}`}
            style={
              {
                top: `${b.top}vh`,
                width: `${b.size}px`,
                '--dur': `${b.dur}s`,
                '--delay': `${b.delay}s`,
              } as CSSProperties
            }
          >
            <div className="bird__bob">
              <BirdShape />
            </div>
          </div>
        ))}
      </div>
      <div className="ambient-fireflies">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className={`firefly${f.mobile ? '' : ' firefly--desktop'}`}
            style={
              {
                left: `${f.left}vw`,
                top: `${f.top}vh`,
                width: `${f.size}px`,
                height: `${f.size}px`,
                '--drift': `${f.drift}s`,
                '--glow': `${f.glow}s`,
                '--delay': `${f.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
