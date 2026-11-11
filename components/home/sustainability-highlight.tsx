import Link from 'next/link'
import { ArrowRight, Leaf } from 'lucide-react'
import { FootprintBreakdown } from '@/components/sustainability/footprint-breakdown'
import { LevelBadge } from '@/components/sustainability/level-badge'
import { buttonVariants } from '@/components/ui/button'
import { computeFootprint } from '@/lib/footprint'
import { formatKg } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EventItem } from '@/lib/types'

export function SustainabilityHighlight({ sample }: { sample: EventItem | null }) {
  const result = sample?.sustainability ? computeFootprint(sample.sustainability) : null

  return (
    <section aria-labelledby="ficha-destacada" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="contour-bg grid overflow-hidden rounded-3xl bg-primary text-primary-foreground lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">
            <Leaf className="size-4" aria-hidden="true" />
            Ficha de sostenibilidad
          </p>
          <h2 id="ficha-destacada" className="font-display text-3xl font-semibold text-balance sm:text-4xl">
            ¿Cuánto pesa un evento sobre el planeta?
          </h2>
          <p className="text-lg leading-relaxed text-pretty text-primary-foreground/90">
            Cada evento presencial publica una estimación de su huella de carbono: transporte de los asistentes, energía
            de los equipos y materiales. Así organizadores y participantes pueden decidir con información y reducirla.
          </p>
          <div>
            <Link
              href="/acerca#metodologia"
              className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'bg-primary-foreground text-primary hover:bg-primary-foreground/90')}
            >
              Conocer la metodología <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        {sample && result && (
          <div className="p-6 sm:p-10 lg:pl-0">
            <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-lg">
              <p className="text-sm text-muted-foreground">Ejemplo real de la plataforma</p>
              <h3 className="mt-1 font-display text-xl leading-snug font-semibold">{sample.title}</h3>
              <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
                <p className="font-display text-4xl leading-none font-semibold">
                  {formatKg(result.totalKg)} <span className="text-base font-medium text-muted-foreground">kg CO2e</span>
                </p>
                <LevelBadge level={result.level} />
              </div>
              <div className="mt-5">
                <FootprintBreakdown result={result} />
              </div>
              <Link
                href={`/eventos/${sample.slug}#ficha-sostenibilidad`}
                className="mt-5 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Ver la ficha completa <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
