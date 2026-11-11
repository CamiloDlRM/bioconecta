import { formatKg } from '@/lib/format'
import type { FootprintResult } from '@/lib/types'

const PARTS = [
  { key: 'transportKg', label: 'Transporte', color: 'var(--cienaga)' },
  { key: 'energyKg', label: 'Energía', color: 'var(--bosque)' },
  { key: 'materialsKg', label: 'Materiales', color: 'var(--coral)' },
] as const

export function FootprintBreakdown({ result }: { result: FootprintResult }) {
  const total = result.transportKg + result.energyKg + result.materialsKg
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex h-4 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Distribución de la huella: ${PARTS.map((p) => `${p.label} ${formatKg(result[p.key])} kg`).join(', ')}`}
      >
        {total > 0 &&
          PARTS.map((p) => {
            const pct = (result[p.key] / total) * 100
            return pct > 0 ? <div key={p.key} style={{ width: `${pct}%`, backgroundColor: p.color }} /> : null
          })}
      </div>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {PARTS.map((p) => {
          const pct = total > 0 ? Math.round((result[p.key] / total) * 100) : 0
          return (
            <div key={p.key} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-1.5 size-3 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
              <div>
                <dt className="text-sm text-muted-foreground">{p.label}</dt>
                <dd className="text-sm font-semibold">
                  {formatKg(result[p.key])} kg CO2e <span className="font-normal text-muted-foreground">({pct} %)</span>
                </dd>
              </div>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
