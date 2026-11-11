import { EMISSION_FACTORS, MATERIAL_LABELS, methodology, perPassengerKm, TRANSPORT_LABELS } from '@/lib/footprint'

const nf = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 3 })

export function MethodologyContent() {
  const modes = Object.keys(TRANSPORT_LABELS) as (keyof typeof TRANSPORT_LABELS)[]
  const materials = Object.keys(MATERIAL_LABELS) as (keyof typeof MATERIAL_LABELS)[]

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-pretty">{methodology.summary}</p>

      <dl className="flex flex-col gap-3">
        {methodology.formulas.map((f) => (
          <div key={f.label} className="rounded-xl bg-muted/60 p-3">
            <dt className="font-semibold">{f.label}</dt>
            <dd className="mt-1 text-pretty text-muted-foreground">{f.formula}</dd>
          </div>
        ))}
      </dl>
      <p className="text-pretty text-muted-foreground">{methodology.example}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="font-semibold">Transporte (kg CO₂ por pasajero-km)</h4>
          <ul className="mt-1.5 flex flex-col gap-1 text-muted-foreground">
            {modes.map((k) => (
              <li key={k} className="flex justify-between gap-4">
                <span>{TRANSPORT_LABELS[k]}</span>
                <span className="font-medium text-foreground tabular-nums">{nf(perPassengerKm(k))}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Materiales (kg CO₂e por unidad)</h4>
          <ul className="mt-1.5 flex flex-col gap-1 text-muted-foreground">
            {materials.map((k) => (
              <li key={k} className="flex justify-between gap-4">
                <span>{MATERIAL_LABELS[k]}</span>
                <span className="font-medium text-foreground tabular-nums">
                  {nf(EMISSION_FACTORS.materials[k].kgCO2e)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="font-semibold">Supuestos</h4>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
          {methodology.assumptions.map((a) => (
            <li key={a} className="text-pretty">
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Fuentes</h4>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
          {methodology.sources.map((s) => (
            <li key={s} className="text-pretty">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-pretty text-muted-foreground">{methodology.disclaimer}</p>
    </div>
  )
}
