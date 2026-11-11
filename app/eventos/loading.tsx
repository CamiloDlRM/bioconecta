import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" role="status" aria-label="Cargando eventos">
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-5 w-full max-w-lg" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <Skeleton className="hidden h-[34rem] rounded-2xl lg:block" />
        <div>
          <Skeleton className="mb-5 h-9 w-48" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                <Skeleton className="aspect-[16/9] w-full rounded-none" />
                <div className="flex flex-col gap-3 p-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Cargando eventos…</span>
    </div>
  )
}
