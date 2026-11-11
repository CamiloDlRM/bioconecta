import { Leaf } from 'lucide-react'
import { LEVEL_LABELS } from '@/lib/footprint'
import { cn } from '@/lib/utils'
import type { FootprintResult } from '@/lib/types'

const TONES: Record<FootprintResult['level'], string> = {
  bajo: 'bg-[color-mix(in_srgb,var(--type-siembra)_16%,var(--card))] text-[var(--type-siembra-ink)]',
  medio: 'bg-[color-mix(in_srgb,var(--type-taller)_18%,var(--card))] text-[var(--type-taller-ink)]',
  alto: 'bg-coral-soft text-coral-ink',
}

export function LevelBadge({ level, className }: { level: FootprintResult['level']; className?: string }) {
  return (
    <span
      className={cn('inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-semibold', TONES[level], className)}
    >
      <Leaf className="size-3.5" aria-hidden="true" />
      {LEVEL_LABELS[level]}
    </span>
  )
}
