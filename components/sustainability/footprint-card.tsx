import { Leaf, Video } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FootprintSummary } from '@/components/sustainability/footprint-summary'
import { MethodologyContent } from '@/components/sustainability/methodology-content'
import { computeFootprint } from '@/lib/footprint'
import type { EventItem } from '@/lib/types'

export function FootprintCard({ event }: { event: EventItem }) {
  if (event.modality === 'virtual') {
    return (
      <section aria-labelledby="ficha-sostenibilidad" className="rounded-2xl border border-border bg-card p-6">
        <h2 id="ficha-sostenibilidad" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <Leaf className="size-5 text-primary" aria-hidden="true" />
          Ficha de sostenibilidad
        </h2>
        <p className="mt-3 flex items-start gap-2 text-pretty text-muted-foreground">
          <Video className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Este evento es virtual, así que no genera emisiones por desplazamiento. No calculamos huella de carbono para
          eventos 100 % virtuales.
        </p>
      </section>
    )
  }

  if (!event.sustainability) return null
  const result = computeFootprint(event.sustainability)

  return (
    <section aria-labelledby="ficha-sostenibilidad" className="rounded-2xl border border-border bg-card p-6">
      <header className="mb-5">
        <h2 id="ficha-sostenibilidad" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <Leaf className="size-5 text-primary" aria-hidden="true" />
          Ficha de sostenibilidad
        </h2>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          Huella de carbono estimada para {event.sustainability.attendees} asistentes. Es una referencia para que
          organizadores y participantes tomen mejores decisiones.
        </p>
      </header>

      <FootprintSummary result={result} />

      <Accordion className="mt-5 border-t border-border">
        <AccordionItem value="metodologia">
          <AccordionTrigger>¿Cómo se calcula?</AccordionTrigger>
          <AccordionContent>
            <MethodologyContent />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
