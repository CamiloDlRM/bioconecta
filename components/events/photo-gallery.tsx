'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Images } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface GalleryPhoto {
  id: number
  url: string
  alt: string
  authorName: string
  /** Fecha ya formateada en el servidor (hora de Bogotá) */
  date: string
  dateTime: string
}

const PAGE_SIZE = 6

/** Números de página a mostrar: 1 … 4 5 6 … 12 */
function pageItems(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const headingId = useId()
  const totalPages = Math.max(1, Math.ceil(photos.length / PAGE_SIZE))
  const [requestedPage, setPage] = useState(1)
  // Si se borra una foto y la página queda vacía, retrocede sola
  const page = Math.min(requestedPage, totalPages)
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState(0)
  const gridRef = useRef<HTMLUListElement>(null)

  const start = (page - 1) * PAGE_SIZE
  const visible = photos.slice(start, start + PAGE_SIZE)
  const current = photos[Math.min(viewing, photos.length - 1)]

  function show(index: number) {
    const i = (index + photos.length) % photos.length
    setViewing(i)
    setOpen(true)
    // Mantiene la cuadrícula en la página de la foto que se está viendo
    setPage(Math.floor(i / PAGE_SIZE) + 1)
  }

  // Flechas del teclado dentro del visor
  useEffect(() => {
    if (!open || photos.length < 2) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') show(viewing + 1)
      if (e.key === 'ArrowLeft') show(viewing - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, viewing, photos.length])

  if (photos.length === 0) return null

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={headingId} className="flex items-center gap-2 font-display text-xl font-semibold">
          <Images className="size-5 text-primary" aria-hidden="true" />
          Galería de fotos
        </h3>
        <p className="text-sm text-muted-foreground">{photos.length === 1 ? '1 foto' : `${photos.length} fotos`}</p>
      </div>

      <ul ref={gridRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              data-photo-index={start + i}
              onClick={() => show(start + i)}
              className="group relative block w-full overflow-hidden rounded-xl border border-border focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.alt}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2.5 pt-6 pb-1.5 text-left text-xs font-medium text-white">
                {p.authorName}
              </span>
              <span className="sr-only">. Ver foto ampliada</span>
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav aria-label="Páginas de la galería" className="flex flex-col items-center gap-2">
          <ul className="flex flex-wrap items-center justify-center gap-1.5">
            <li>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft aria-hidden="true" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
            </li>
            {pageItems(page, totalPages).map((item, i) =>
              item === 'gap' ? (
                <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
                  …
                </li>
              ) : (
                <li key={item}>
                  <Button
                    type="button"
                    variant={item === page ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setPage(item)}
                    aria-current={item === page ? 'page' : undefined}
                    aria-label={`Página ${item}`}
                  >
                    {item}
                  </Button>
                </li>
              ),
            )}
            <li>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Página siguiente"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight aria-hidden="true" />
              </Button>
            </li>
          </ul>
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            Fotos {start + 1}–{start + visible.length} de {photos.length}
          </p>
        </nav>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="gap-3 sm:max-w-3xl"
          // Al cerrar, el foco vuelve a la miniatura de la foto que se estaba viendo
          finalFocus={() => gridRef.current?.querySelector<HTMLElement>(`[data-photo-index="${viewing}"]`) ?? true}
        >
          {current && (
            <>
              <DialogTitle className="pr-10 font-display text-lg font-semibold">
                Foto de {current.authorName}
              </DialogTitle>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={current.alt}
                className="max-h-[65vh] w-full rounded-lg bg-muted object-contain"
              />
              <DialogDescription>
                {current.alt} · <time dateTime={current.dateTime}>{current.date}</time>
              </DialogDescription>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {photos.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => show(viewing - 1)}>
                      <ChevronLeft aria-hidden="true" />
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
                      {viewing + 1} de {photos.length}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={() => show(viewing + 1)}>
                      Siguiente
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <span />
                )}
                <a
                  href={current.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                >
                  <ExternalLink aria-hidden="true" />
                  Tamaño completo
                  <span className="sr-only"> (abre en una pestaña nueva)</span>
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
