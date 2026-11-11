'use client'

import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTimeShort } from '@/lib/format'
import type { Registration } from '@/lib/types'

interface RegistrationsTableProps {
  registrations: Registration[]
  eventSlug: string
  capacity: number | null
}

const csvCell = (value: string) => {
  // Evita que Excel interprete celdas como fórmulas.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function RegistrationsTable({ registrations, eventSlug, capacity }: RegistrationsTableProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((r) => [r.fullName, r.email, r.phone ?? ''].some((v) => v.toLowerCase().includes(q)))
  }, [registrations, query])

  const confirmed = registrations.filter((r) => r.status === 'confirmada').length

  function exportCsv() {
    const header = ['Nombre', 'Correo', 'Celular', 'Fecha de inscripción', 'Estado']
    const rows = filtered.map((r) => [r.fullName, r.email, r.phone ?? '', formatDateTimeShort(r.createdAt), r.status])
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inscritos-${eventSlug}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p role="status" className="text-sm font-semibold">
          {capacity !== null ? `${confirmed} de ${capacity} cupos ocupados` : `${confirmed} inscritos confirmados`}
          {query && <span className="font-normal text-muted-foreground"> · {filtered.length} resultados</span>}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="buscar-inscritos" className="text-sm font-semibold">
              Buscar inscrito
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-inscritos"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, correo o celular"
                className="w-64 pl-9"
              />
            </div>
          </div>
          <Button type="button" variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download aria-hidden="true" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          {registrations.length === 0 ? 'Todavía no hay inscritos en este evento.' : 'Ningún inscrito coincide con tu búsqueda.'}
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Nombre</TableHead>
                <TableHead scope="col">Correo</TableHead>
                <TableHead scope="col">Celular</TableHead>
                <TableHead scope="col">Fecha</TableHead>
                <TableHead scope="col">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">{r.fullName}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.phone ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateTimeShort(r.createdAt)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        r.status === 'confirmada'
                          ? 'rounded-full bg-primary/12 px-2.5 py-0.5 text-sm font-semibold text-primary'
                          : 'rounded-full bg-muted px-2.5 py-0.5 text-sm font-semibold text-muted-foreground'
                      }
                    >
                      {r.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
