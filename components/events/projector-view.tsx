'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, Expand, Leaf, LogOut, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProjectorPhoto {
  id: number
  url: string
  alt: string
  authorName: string
  body: string | null
}

interface ProjectorViewProps {
  eventTitle: string
  eventSlug: string
  eventUrl: string
  qrSvg: string
  photos: ProjectorPhoto[]
  participants: number
}

const REFRESH_MS = 10_000
const ROTATE_MS = 8_000
const NEW_BADGE_MS = 12_000
const STRIP = 6

export function ProjectorView({ eventTitle, eventSlug, eventUrl, qrSvg, photos, participants }: ProjectorViewProps) {
  const router = useRouter()
  const seen = useRef<Set<number> | null>(null)
  const [featuredId, setFeaturedId] = useState<number | null>(photos[0]?.id ?? null)
  const [freshId, setFreshId] = useState<number | null>(null)

  // Trae las fotos nuevas cada pocos segundos (solo mientras la pestaña está visible)
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, REFRESH_MS)
    return () => clearInterval(t)
  }, [router])

  // Si llegó una foto nueva, pasa a primer plano con la etiqueta "¡Nueva!"
  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(photos.map((p) => p.id))
      return
    }
    const fresh = photos.find((p) => !seen.current!.has(p.id))
    photos.forEach((p) => seen.current!.add(p.id))
    if (fresh) {
      setFeaturedId(fresh.id)
      setFreshId(fresh.id)
    }
  }, [photos])

  useEffect(() => {
    if (freshId === null) return
    const t = setTimeout(() => setFreshId(null), NEW_BADGE_MS)
    return () => clearTimeout(t)
  }, [freshId])

  // Sin fotos nuevas, va rotando entre las más recientes para que la pantalla no se quede quieta
  useEffect(() => {
    if (photos.length < 2 || freshId !== null) return
    const t = setInterval(() => {
      setFeaturedId((id) => {
        const recent = photos.slice(0, 12)
        const i = recent.findIndex((p) => p.id === id)
        return recent[(i + 1) % recent.length].id
      })
    }, ROTATE_MS)
    return () => clearInterval(t)
  }, [photos, freshId])

  const featured = photos.find((p) => p.id === featuredId) ?? photos[0] ?? null
  const strip = photos.slice(0, STRIP)
  const displayUrl = eventUrl.replace(/^https?:\/\//, '')

  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }

  return (
    <div className="fixed inset-0 z-[60] grid grid-cols-1 gap-6 overflow-auto bg-[#0b1f17] p-6 text-[#f6f1e6] lg:grid-cols-[minmax(320px,30%)_1fr] lg:overflow-hidden">
      {/* Panel izquierdo: cómo participar */}
      <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto xl:gap-4 [&>*]:shrink-0">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#9fd3b5] uppercase">
          <Leaf className="size-4" aria-hidden="true" />
          BioConecta · en vivo
        </p>
        <h1 className="line-clamp-3 font-display text-2xl leading-tight font-semibold text-balance xl:text-3xl">
          {eventTitle}
        </h1>

        <div className="mx-auto w-full max-w-[min(100%,30vh)] rounded-3xl bg-white p-2.5 shadow-2xl">
          <div
            role="img"
            aria-label={`Código QR que abre ${displayUrl}`}
            className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>
        <p className="-mt-1 text-center text-xs break-all text-[#c9dccf] xl:text-sm">{displayUrl}</p>

        <ol className="flex flex-col gap-1.5 text-base xl:text-lg">
          {['Escanea el código', 'Inscríbete al evento', 'Sube tu foto en “Fotos y comentarios”'].map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e66d49] font-display font-semibold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <dl className="mt-auto grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 px-4 py-2.5">
            <dt className="flex items-center gap-1.5 text-sm text-[#c9dccf]">
              <Camera className="size-4" aria-hidden="true" />
              Fotos
            </dt>
            <dd className="font-display text-3xl font-semibold tabular-nums xl:text-4xl">{photos.length}</dd>
          </div>
          <div className="rounded-2xl bg-white/5 px-4 py-2.5">
            <dt className="flex items-center gap-1.5 text-sm text-[#c9dccf]">
              <Users className="size-4" aria-hidden="true" />
              Participantes
            </dt>
            <dd className="font-display text-3xl font-semibold tabular-nums xl:text-4xl">{participants}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={fullscreen}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/20 px-3 font-semibold hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none"
          >
            <Expand className="size-4" aria-hidden="true" />
            Pantalla completa
          </button>
          <Link
            href={`/eventos/${eventSlug}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 font-semibold text-[#c9dccf] hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Salir
          </Link>
          <span className="text-[#8fa99a]">Se actualiza solo cada 10 s</span>
        </div>
      </aside>

      {/* Panel derecho: fotos */}
      <main className="flex min-h-[60vh] flex-col gap-4 lg:min-h-0">
        {featured ? (
          <>
            <figure className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={featured.id}
                src={featured.url}
                alt={featured.alt}
                className="absolute inset-0 h-full w-full animate-in object-contain duration-700 fade-in motion-reduce:animate-none"
              />
              {freshId === featured.id && (
                <span className="absolute top-4 left-4 inline-flex animate-in items-center gap-1.5 rounded-full bg-[#e66d49] px-4 py-1.5 text-lg font-semibold text-white shadow-lg zoom-in-90 motion-reduce:animate-none">
                  <Sparkles className="size-5" aria-hidden="true" />
                  ¡Nueva!
                </span>
              )}
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pt-16 pb-5">
                <p className="font-display text-2xl font-semibold">{featured.authorName}</p>
                {featured.body && <p className="mt-1 line-clamp-2 text-lg text-white/90">{featured.body}</p>}
              </figcaption>
            </figure>

            {strip.length > 1 && (
              <ul className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-6" aria-label="Fotos más recientes">
                {strip.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setFeaturedId(p.id)}
                      aria-label={`Mostrar la foto de ${p.authorName}`}
                      className={cn(
                        'block w-full overflow-hidden rounded-2xl ring-offset-2 ring-offset-[#0b1f17] transition focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none motion-reduce:transition-none',
                        p.id === featured.id ? 'ring-3 ring-[#e66d49]' : 'opacity-70 hover:opacity-100',
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-white/20 p-10 text-center">
            <Camera className="size-16 text-[#9fd3b5]" aria-hidden="true" />
            <p className="font-display text-4xl font-semibold text-balance">Aún no hay fotos</p>
            <p className="max-w-xl text-xl text-balance text-[#c9dccf]">
              Escanea el código, inscríbete y sé la primera persona en compartir lo que encontraste.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
