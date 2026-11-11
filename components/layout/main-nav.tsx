'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from './nav-links'

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Principal" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_LINKS.map((link) => {
          const base = link.href.split('?')[0]
          const isMap = link.label === 'Mapa'
          const active = !isMap && (pathname === base || pathname.startsWith(`${base}/`))
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-muted',
                  active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
