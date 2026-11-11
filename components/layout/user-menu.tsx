'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { CalendarCheck, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/actions'
import type { Profile } from '@/lib/types'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function UserMenu({ profile }: { profile: Profile }) {
  const [pending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card pr-2 pl-1.5 text-sm font-semibold transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground" aria-hidden="true">
          {initials(profile.fullName)}
        </span>
        <span className="max-w-32 truncate">{profile.fullName}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Abrir menú de la cuenta</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-foreground">{profile.fullName}</span>
            <span className="truncate text-sm font-normal text-muted-foreground">{profile.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/mis-inscripciones" />} className="min-h-9 text-sm">
          <CalendarCheck aria-hidden="true" />
          Mis inscripciones
        </DropdownMenuItem>
        {profile.role === 'organizador' && (
          <DropdownMenuItem render={<Link href="/organizador" />} className="min-h-9 text-sm">
            <LayoutDashboard aria-hidden="true" />
            Panel de organizador
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-9 text-sm"
          disabled={pending}
          onClick={() => startTransition(async () => void (await signOut()))}
        >
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
