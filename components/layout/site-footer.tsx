import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

const FOOTER_LINKS = [
  {
    title: 'Explora',
    links: [
      { href: '/eventos', label: 'Todos los eventos' },
      { href: '/eventos?vista=mapa', label: 'Mapa de eventos' },
      { href: '/mis-inscripciones', label: 'Mis inscripciones' },
    ],
  },
  {
    title: 'Organizadores',
    links: [
      { href: '/registro', label: 'Crear cuenta' },
      { href: '/organizador', label: 'Panel de organizador' },
      { href: '/organizador/eventos/nuevo', label: 'Publicar un evento' },
    ],
  },
  {
    title: 'Proyecto',
    links: [
      { href: '/acerca', label: 'Acerca de BioConecta' },
      { href: '/acerca#metodologia', label: 'Metodología de huella' },
      { href: '/acerca#equipo', label: 'Equipo' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Todos los eventos por la biodiversidad, en un solo lugar. Barranquilla, Puerto Colombia y Soledad.
          </p>
        </div>
        {FOOTER_LINKS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-sans text-sm font-bold tracking-wide text-foreground uppercase">{group.title}</h2>
            <ul className="mt-3 flex flex-col gap-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-8 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-sm text-muted-foreground sm:px-6 lg:px-8">
          Proyecto académico · Universidad del Norte — Biodiversidad y Sociedad, 2026. Los eventos de ejemplo son demostrativos.
        </p>
      </div>
    </footer>
  )
}
