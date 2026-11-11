import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
})

export const metadata: Metadata = {
  title: {
    default: 'BioConecta — Todos los eventos por la biodiversidad, en un solo lugar',
    template: '%s · BioConecta',
  },
  description:
    'Descubre charlas, talleres, voluntariados, siembras y limpiezas por la biodiversidad en Barranquilla, Puerto Colombia y Soledad. Inscríbete y conoce la huella de carbono de cada evento.',
  generator: 'v0.app',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F1E6' },
    { media: '(prefers-color-scheme: dark)', color: '#0C1713' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${figtree.variable} ${fraunces.variable} bg-background`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <a
            href="#contenido"
            className="sr-only z-[100] rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Saltar al contenido principal
          </a>
          <SiteHeader />
          <div id="contenido" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <SiteFooter />
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
