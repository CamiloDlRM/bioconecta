import type { CSSProperties } from 'react'

/**
 * Entrada "atravesando el follaje": hojas de mangle que se abren al cargar el sitio.
 * Solo CSS (sin JS): se muestra una vez por sesión (ver INTRO_SCRIPT) y nunca si la
 * persona tiene activado "reducir movimiento". No intercepta clics (pointer-events: none).
 */

type Leaf = { x: number; y: number; w: number; r: number; c: string; side: 'l' | 'r' | 'c'; d: number }

// x / y en vw / vh; w en vmax (alto = 2 × ancho); r en grados; d = retraso en ms
const LEAVES: Leaf[] = [
  { x: -14, y: -30, w: 34, r: -35, c: '#0E4D3A', side: 'l', d: 0 },
  { x: -18, y: 22, w: 36, r: 22, c: '#14563F', side: 'l', d: 60 },
  { x: 2, y: 38, w: 32, r: -12, c: '#1F6B4F', side: 'l', d: 120 },
  { x: 14, y: -38, w: 30, r: 28, c: '#2E7D5B', side: 'l', d: 40 },
  { x: -8, y: 62, w: 30, r: -52, c: '#0B3F30', side: 'l', d: 90 },
  { x: 20, y: 18, w: 30, r: 42, c: '#3F8A62', side: 'l', d: 150 },
  { x: 62, y: -30, w: 34, r: 35, c: '#0E4D3A', side: 'r', d: 20 },
  { x: 66, y: 22, w: 36, r: -22, c: '#14563F', side: 'r', d: 80 },
  { x: 50, y: 40, w: 32, r: 12, c: '#1F6B4F', side: 'r', d: 140 },
  { x: 44, y: -40, w: 30, r: -28, c: '#2E7D5B', side: 'r', d: 50 },
  { x: 74, y: 60, w: 30, r: 52, c: '#0B3F30', side: 'r', d: 110 },
  { x: 40, y: 16, w: 30, r: -42, c: '#3F8A62', side: 'r', d: 170 },
  { x: 30, y: -6, w: 38, r: 6, c: '#C98A1B', side: 'c', d: 200 },
  { x: 33, y: 34, w: 34, r: -8, c: '#2A6E52', side: 'c', d: 230 },
]

/**
 * Marca la sesión: si ya se vio la intro, se oculta antes de pintar (evita parpadeos).
 * Seguro adicional: pase lo que pase, a los 3 s la capa se elimina.
 */
export const INTRO_SCRIPT = `(function(){var d=document.documentElement;function done(){d.setAttribute('data-intro','seen')}try{var k='bc-intro';if(sessionStorage.getItem(k)){done()}else{sessionStorage.setItem(k,'1');setTimeout(done,3000)}}catch(e){done()}})()`

export function LeafIntro() {
  return (
    <div className="leaf-intro" aria-hidden="true">
      <div className="leaf-intro__veil" />
      {LEAVES.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          className={`leaf-intro__leaf leaf-intro__leaf--${l.side}`}
          style={
            {
              left: `${l.x}vw`,
              top: `${l.y}vh`,
              width: `${l.w}vmax`,
              height: `${l.w * 2}vmax`,
              color: l.c,
              '--r': `${l.r}deg`,
              '--d': `${l.d}ms`,
            } as CSSProperties
          }
        >
          <path d="M50 2 C90 42 94 124 50 198 C6 124 10 42 50 2 Z" fill="currentColor" />
          <path d="M50 14 V188" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2.5" fill="none" />
          <path
            d="M50 60 L72 44 M50 90 L76 72 M50 120 L74 104 M50 150 L68 136 M50 60 L28 44 M50 90 L24 72 M50 120 L26 104 M50 150 L32 136"
            stroke="#ffffff"
            strokeOpacity="0.14"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ))}
    </div>
  )
}
