import Link from 'next/link'
import { Compass } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="contour-bg mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-8" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Error 404</p>
      <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">Perdimos el rastro de esta página</h1>
      <p className="max-w-md text-pretty text-muted-foreground">
        El enlace puede estar mal escrito o el evento ya no está disponible. Vuelve a la agenda y sigue explorando.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/eventos" className={cn(buttonVariants({ size: 'lg' }))}>
          Ver eventos
        </Link>
        <Link href="/" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}>
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
