import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/forms/auth-shell'
import { RegisterForm } from '@/components/forms/register-form'
import type { SearchParams } from '@/lib/filters'

export const metadata: Metadata = { title: 'Crear cuenta' }

const nextParam = (v: string | string[] | undefined) => {
  const value = Array.isArray(v) ? v[0] : v
  return value && value.startsWith('/') && !value.startsWith('//') ? value : undefined
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const next = nextParam((await searchParams).next)
  const loginHref = next ? `/ingresar?next=${encodeURIComponent(next)}` : '/ingresar'

  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Únete a la comunidad que cuida la biodiversidad del Caribe colombiano."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link href={loginHref} className="font-semibold text-primary underline underline-offset-4">
            Ingresa
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  )
}
