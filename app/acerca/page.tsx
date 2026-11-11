import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpenCheck, MessagesSquare, Scale } from 'lucide-react'
import { MethodologyContent } from '@/components/sustainability/methodology-content'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Acerca de BioConecta',
  description:
    'BioConecta reúne en un solo lugar los eventos por la biodiversidad de Barranquilla. Proyecto académico de la Universidad del Norte.',
}

const TEAM = [
  { name: 'Camilo Andrés de la Rosa Movilla', role: 'Ingeniería de Sistemas', focus: 'Frontend' },
  { name: 'Andrés Felipe Pérez Ariza', role: 'Ingeniería de Sistemas', focus: 'Backend y base de datos' },
  { name: 'Jorge Narváez', role: 'Diseño Gráfico', focus: 'Identidad visual y UX/UI' },
  { name: 'Jesús David Miranda', role: 'Ingeniería Mecánica', focus: 'Gestión y modelo de huella de carbono' },
]

function initials(name: string) {
  const parts = name.split(' ')
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header>
        <p className="text-sm font-semibold text-secondary">Acerca del proyecto</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-balance sm:text-5xl">
          Que ningún evento por la biodiversidad pase desapercibido
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
          BioConecta es una plataforma web que reúne charlas, talleres, jornadas de voluntariado, salidas de campo,
          siembras y limpiezas del Caribe colombiano, empezando por Barranquilla y su área metropolitana.
        </p>
      </header>

      <section aria-labelledby="problema" className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <MessagesSquare className="size-6 text-coral" aria-hidden="true" />
          <h2 id="problema" className="mt-3 font-display text-2xl font-semibold">
            El problema
          </h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            La información sobre actividades ambientales está dispersa: historias de Instagram que desaparecen en 24
            horas, cadenas de WhatsApp, correos institucionales y carteles. Quien quiere participar no sabe dónde buscar y
            quien organiza no sabe cómo llegar a más personas.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Scale className="size-6 text-secondary" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl font-semibold">Por qué importa: Acuerdo de Escazú</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            El Acuerdo de Escazú reconoce el derecho de toda persona a acceder a la información ambiental y a participar
            en las decisiones que afectan su territorio. Centralizar y abrir la información sobre eventos es una forma
            concreta de hacer ese derecho accesible en lo local.
          </p>
        </div>
      </section>

      <section aria-labelledby="equipo" className="mt-14">
        <h2 id="equipo" className="font-display text-3xl font-semibold">
          Equipo
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {TEAM.map((member) => (
            <li key={member.name} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground"
              >
                {initials(member.name)}
              </span>
              <div>
                <p className="font-display text-lg leading-tight font-semibold">{member.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
                <p className="text-sm font-semibold text-secondary">{member.focus}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex items-start gap-2 text-muted-foreground">
          <BookOpenCheck className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <span>
            Proyecto del curso <strong className="font-semibold text-foreground">Biodiversidad y Sociedad</strong>,
            Universidad del Norte, 2026. Docente: <strong className="font-semibold text-foreground">Yolanda Celis Pacheco</strong>.
          </span>
        </p>
      </section>

      <section aria-labelledby="metodologia" className="mt-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 id="metodologia" className="font-display text-3xl font-semibold">
          Metodología de la huella de carbono
        </h2>
        <p className="mt-2 mb-6 text-muted-foreground">
          Cada evento presencial o híbrido puede incluir una ficha con una estimación de sus emisiones. Es una
          aproximación para tomar mejores decisiones, no una certificación.
        </p>
        <MethodologyContent />
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/eventos" className={buttonVariants({ size: 'lg' })}>
          Explorar eventos
        </Link>
        <Link href="/registro" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          Publicar un evento
        </Link>
      </div>
    </div>
  )
}
