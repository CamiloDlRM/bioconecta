import { Leaf } from 'lucide-react'

/** Pantalla de carga del modo proyector (evita mostrar el esqueleto claro de la página del evento). */
export default function ProjectorLoading() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1f17] text-[#9fd3b5]" role="status">
      <Leaf className="size-10 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      <span className="sr-only">Cargando el modo proyector…</span>
    </div>
  )
}
