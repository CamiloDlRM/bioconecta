'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { CalendarCheck, LogOut, Menu } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { signOut } from '@/lib/actions'
import type { Profile } from '@/lib/types'
import { NAV_LINKS } from './nav-links'

export function MobileNav({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Abrir menú de navegación" className="md:hidden" />}>
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,22rem)] gap-0 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle>
            <Logo />
          </SheetTitle>
          <SheetDescription>Todos los eventos por la biodiversidad, en un solo lugar.</SheetDescription>
        </SheetHeader>

        <nav aria-label="Principal (móvil)" className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex min-h-12 items-center rounded-xl px-3 text-base font-semibold hover:bg-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {profile && (
              <li>
                <Link
                  href="/mis-inscripciones"
                  onClick={close}
                  className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-semibold hover:bg-muted"
                >
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Mis inscripciones
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 border-t border-border p-4">
          {profile ? (
            <>
              <p className="truncate text-sm text-muted-foreground">
                Sesión iniciada como <span className="font-semibold text-foreground">{profile.fullName}</span>
              </p>
              <Button
                variant="outline"
                size="lg"
                disabled={pending}
                onClick={() => startTransition(async () => void (await signOut()))}
              >
                <LogOut aria-hidden="true" />
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/registro" onClick={close} className={buttonVariants({ size: 'lg' })}>
                Crear cuenta
              </Link>
              <Link href="/ingresar" onClick={close} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Ingresar
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
