import type { ReactNode } from 'react'
import { Logo } from '@/components/brand/logo'

function MangroveIllustration() {
  return (
    <svg viewBox="0 0 480 560" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="auth-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E4D3A" />
          <stop offset="1" stopColor="#1F6F7F" />
        </linearGradient>
      </defs>
      <rect width="480" height="560" fill="url(#auth-sky)" />
      <g fill="none" stroke="#F6F1E6" strokeOpacity="0.14" strokeWidth="1.5">
        <path d="M-20 90C70 40 150 130 240 90S400 30 500 80" />
        <path d="M-20 130C70 80 150 170 240 130S400 70 500 120" />
        <path d="M-20 170C70 120 150 210 240 170S400 110 500 160" />
      </g>
      <circle cx="372" cy="118" r="38" fill="#C98A1B" fillOpacity="0.9" />
      <g fill="#F6F1E6" fillOpacity="0.9">
        <path d="M70 170c10-18 26-20 36-6-12 0-22 6-30 18z" />
        <path d="M120 140c10-18 26-20 36-6-12 0-22 6-30 18z" />
      </g>
      <g fill="#D9604A">
        <path d="M200 205c0-14 8-24 18-24 5 0 9 3 9 8 0 8-8 11-14 14l-3 12h-4z" />
        <path d="M216 189c10-4 22-1 28 7l-12 1z" />
      </g>
      <path d="M0 330c60-24 120 18 180 0s110-28 160-6 100 14 140-4v240H0z" fill="#0A3A2C" fillOpacity="0.55" />
      <path d="M0 380c70-20 130 16 200-2s120-18 170 0 80 10 110-4v186H0z" fill="#0A3A2C" fillOpacity="0.75" />
      <g stroke="#7FD1B0" strokeWidth="5" strokeLinecap="round" fill="none" strokeOpacity="0.9">
        <path d="M110 560V430" />
        <path d="M110 430C86 410 70 390 56 350" />
        <path d="M110 430C128 410 142 392 152 356" />
        <path d="M110 470C92 456 78 448 62 446" />
        <path d="M110 470C128 456 142 448 160 446" />
        <path d="M330 560V420" />
        <path d="M330 420C306 400 290 378 278 338" />
        <path d="M330 420C350 400 366 382 376 346" />
        <path d="M330 470C312 456 296 448 280 446" />
        <path d="M330 470C350 456 364 448 382 446" />
      </g>
      <g fill="#7FD1B0">
        <path d="M56 350c-22-6-30-28-24-46 22 4 34 20 24 46z" />
        <path d="M152 356c20-10 26-30 18-48-20 6-30 24-18 48z" />
        <path d="M278 338c-22-6-30-28-24-46 22 4 34 20 24 46z" />
        <path d="M376 346c20-10 26-30 18-48-20 6-30 24-18 48z" />
      </g>
    </svg>
  )
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl gap-0 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:py-12">
      <div className="flex flex-col justify-center py-4 lg:py-0">
        <div className="mx-auto w-full max-w-md">
          <Logo className="mb-8" />
          <h1 className="font-display text-4xl font-semibold text-balance">{title}</h1>
          <p className="mt-2 text-pretty text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>

      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden rounded-3xl lg:block"
      >
        <MangroveIllustration />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8 pt-24">
          <p className="font-display text-2xl leading-snug text-white text-pretty">
            Todos los eventos por la biodiversidad, en un solo lugar.
          </p>
          <p className="mt-2 text-sm text-white/85">Barranquilla, Puerto Colombia y Soledad.</p>
        </div>
      </aside>
    </div>
  )
}
