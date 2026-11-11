'use client'

import { Suspense, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { FiltersForm } from '@/components/events/filters-form'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { EventFilters } from '@/lib/types'

interface FiltersPanelProps {
  filters: EventFilters
  cities: string[]
  activeCount: number
  resultCount: number
}

export function FiltersPanel({ filters, cities, activeCount, resultCount }: FiltersPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="lg" />}>
            <SlidersHorizontal aria-hidden="true" />
            Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(92vw,24rem)] gap-0 p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Los resultados se actualizan al instante.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <Suspense fallback={null}>
                <FiltersForm filters={filters} cities={cities} activeCount={activeCount} />
              </Suspense>
            </div>
            <div className="border-t border-border p-4">
              <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
                Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside aria-label="Filtros de eventos" className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">Filtros</h2>
          <Suspense fallback={null}>
            <FiltersForm filters={filters} cities={cities} activeCount={activeCount} />
          </Suspense>
        </div>
      </aside>
    </>
  )
}
