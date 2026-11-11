import Link from 'next/link'
import { Megaphone } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function OrganizerCta() {
  return (
    <section aria-labelledby="cta-organizadores" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-start gap-6 rounded-3xl border border-border bg-card p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-2xl gap-5">
          <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-coral-soft text-coral-ink sm:flex">
            <Megaphone className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h2 id="cta-organizadores" className="font-display text-3xl font-semibold text-balance">
              ¿Organizas eventos por la biodiversidad?
            </h2>
            <p className="mt-2 text-pretty text-muted-foreground">
              Publica gratis, llega a más personas, gestiona tus inscritos y comparte la huella de carbono de tu evento.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/registro?rol=organizador" className={cn(buttonVariants({ size: 'lg' }))}>
            Publicar mi evento
          </Link>
          <Link href="/organizador" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}>
            Ir al panel
          </Link>
        </div>
      </div>
    </section>
  )
}
