import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/forms/auth-shell'
import { LoginForm } from '@/components/forms/login-form'
import type { SearchParams } from '@/lib/filters'

export const metadata: Metadata = { title: 'Ingresar' }

const nextParam = (v: string | string[] | undefined) => {
  const value = Array.isArray(v) ? v[0] : v
  return value && value.startsWith('/') && !value.startsWith('//') ? value : undefined
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const next = nextParam(sp.next)
  const initialError =
    sp.error === 'confirmacion' ? 'El enlace de confirmación no es válido o ya expiró. Intenta ingresar o regístrate de nuevo.' : undefined
  const registerHref = next ? `/registro?next=${encodeURIComponent(next)}` : '/registro'

  return (
    <AuthShell
      title="Ingresa a BioConecta"
      description="Inscríbete a eventos, recibe recordatorios y gestiona tus actividades."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link href={registerHref} className="font-semibold text-primary underline underline-offset-4">
            Regístrate
          </Link>
        </>
      }
    >
      <LoginForm next={next} initialError={initialError} />
    </AuthShell>
  )
}
