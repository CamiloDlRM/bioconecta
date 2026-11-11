import { CalendarPlus, Download } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CalendarButtonsProps {
  googleUrl: string
  icsUrl: string
  size?: 'sm' | 'default'
  className?: string
}

export function CalendarButtons({ googleUrl, icsUrl, size = 'default', className }: CalendarButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: 'outline', size }))}
      >
        <CalendarPlus aria-hidden="true" />
        Añadir a Google Calendar
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
      <a href={icsUrl} download className={cn(buttonVariants({ variant: 'outline', size }))}>
        <Download aria-hidden="true" />
        Descargar .ics
      </a>
    </div>
  )
}
