import { cn } from '@/lib/utils'

interface LogoMarkProps {
  className?: string
  title?: string
}

/** Dos hojas de mangle cuyos tallos se encuentran en un nodo (conexión). Usa tokens del tema: funciona en claro y oscuro. */
export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn('size-9 shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d="M18 29C8 27 3 18 5 6c10 1 16 10 13 23Z" fill="var(--primary)" />
      <path d="M22 29c10-2 15-11 13-23-10 1-16 10-13 23Z" fill="var(--secondary)" />
      <path d="M17.5 24C13 19 10 14 8.5 9.5" stroke="var(--card)" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M22.5 24C27 19 30 14 31.5 9.5" stroke="var(--card)" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 29c.8 2.2 1.2 3.2 2 4.5M22 29c-.8 2.2-1.2 3.2-2 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="34.5" r="3.2" fill="var(--accent)" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  markClassName?: string
  /** Oculta el nombre y deja solo la marca. */
  markOnly?: boolean
}

export function Logo({ className, markClassName, markOnly = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-foreground', className)}>
      <LogoMark className={markClassName} />
      {markOnly ? (
        <span className="sr-only">BioConecta</span>
      ) : (
        <span className="font-display text-xl leading-none font-semibold tracking-tight">
          Bio<span className="font-normal italic">Conecta</span>
        </span>
      )}
    </span>
  )
}
