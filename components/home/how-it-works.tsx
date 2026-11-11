import Link from 'next/link'
import { BellRing, CalendarCheck, ClipboardList, Megaphone, Search, SlidersHorizontal, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Step {
  icon: LucideIcon
  title: string
  text: string
}

const PARTICIPANTS: Step[] = [
  { icon: Search, title: 'Busca', text: 'Explora la agenda de la ciudad en un solo lugar.' },
  { icon: SlidersHorizontal, title: 'Filtra', text: 'Por fecha, tipo de actividad, lugar o modalidad.' },
  { icon: CalendarCheck, title: 'Inscríbete', text: 'Reserva tu cupo en menos de un minuto.' },
  { icon: BellRing, title: 'Recibe un recordatorio', text: 'Te avisamos un día antes y añadimos el evento a tu calendario.' },
]

const ORGANIZERS: Step[] = [
  { icon: UserPlus, title: 'Crea tu cuenta', text: 'Como organizador, con el nombre de tu entidad o colectivo.' },
  { icon: Megaphone, title: 'Publica tu evento', text: 'Con mapa, cupos, requisitos y su ficha de sostenibilidad.' },
  { icon: ClipboardList, title: 'Gestiona a tus inscritos', text: 'Consulta la lista y expórtala a CSV cuando la necesites.' },
]

function Column({ id, title, steps, cta }: { id: string; title: string; steps: Step[]; cta: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h3 id={id} className="font-display text-2xl font-semibold">
        {title}
      </h3>
      <ol aria-labelledby={id} className="mt-6 flex flex-1 flex-col gap-5">
        {steps.map(({ icon: Icon, title: stepTitle, text }) => (
          <li key={stepTitle} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">{stepTitle}</p>
              <p className="text-sm text-pretty text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6">{cta}</div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section aria-labelledby="como-funciona" className="border-y border-border bg-muted/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="como-funciona" className="font-display text-3xl font-semibold text-balance sm:text-4xl">
          Cómo funciona
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pensado para quien quiere participar y para quien organiza. Sin grupos de chat, sin pantallazos.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Column
            id="para-participantes"
            title="Para participantes"
            steps={PARTICIPANTS}
            cta={
              <Link href="/eventos" className={cn(buttonVariants({ variant: 'default' }))}>
                Explorar eventos
              </Link>
            }
          />
          <Column
            id="para-organizadores"
            title="Para organizadores"
            steps={ORGANIZERS}
            cta={
              <Link href="/registro?rol=organizador" className={cn(buttonVariants({ variant: 'outline' }))}>
                Crear cuenta de organizador
              </Link>
            }
          />
        </div>
      </div>
    </section>
  )
}
