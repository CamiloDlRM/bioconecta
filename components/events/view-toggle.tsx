'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { List, Map } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'lista', label: 'Lista', icon: List },
  { value: 'mapa', label: 'Mapa', icon: Map },
] as const

export function ViewToggle({ view }: { view: 'lista' | 'mapa' }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function select(value: 'lista' | 'mapa') {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'lista') params.delete('vista')
    else params.set('vista', value)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div role="group" aria-label="Tipo de vista" className="inline-flex rounded-xl border border-border bg-card p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          onClick={() => select(value)}
          className={cn(
            'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
            view === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
