import { Lightbulb } from 'lucide-react'
import { FootprintBreakdown } from '@/components/sustainability/footprint-breakdown'
import { LevelBadge } from '@/components/sustainability/level-badge'
import { footprintEquivalence } from '@/lib/footprint'
import { formatKg } from '@/lib/format'
import type { FootprintResult } from '@/lib/types'

export function FootprintSummary({ result }: { result: FootprintResult }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Huella total estimada</p>
          <p className="font-display text-4xl leading-none font-semibold">
            {formatKg(result.totalKg)} <span className="text-lg font-medium text-muted-foreground">kg CO2e</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Por asistente</p>
          <p className="font-display text-2xl leading-none font-semibold">
            {result.perAttendeeKg.toLocaleString('es-CO', { maximumFractionDigits: 2 })}{' '}
            <span className="text-base font-medium text-muted-foreground">kg CO2e</span>
          </p>
        </div>
        <LevelBadge level={result.level} />
      </div>

      <FootprintBreakdown result={result} />

      <p className="text-sm text-pretty text-muted-foreground">{footprintEquivalence(result.totalKg)}</p>

      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="size-4 text-bosque" aria-hidden="true" />
          Recomendaciones para reducirla
        </h4>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-pretty marker:text-muted-foreground">
          {result.recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
