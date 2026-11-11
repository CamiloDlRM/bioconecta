import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function OrganizerGate() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sprout className="size-7" aria-hidden="true" />
      </span>
      <h1 className="font-display text-3xl font-semibold text-balance">Esta zona es para organizadores</h1>
      <p className="text-pretty text-muted-foreground">
        Tu cuenta es de participante, así que no puedes publicar eventos. Si organizas actividades por la biodiversidad,
        crea una cuenta de organizador y publica en minutos.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/registro?next=/organizador" className={buttonVariants()}>
          Crear cuenta de organizador
        </Link>
        <Link href="/eventos" className={buttonVariants({ variant: 'outline' })}>
          Explorar eventos
        </Link>
      </div>
    </div>
  )
}
