'use client'

import { useState, useTransition } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { PasswordInput } from '@/components/forms/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/actions'

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result && !result.ok) setError(result.error ?? 'No pudimos iniciar sesión.')
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-coral/40 bg-coral-soft p-3 text-sm text-coral-ink"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="tu@correo.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        {pending ? 'Ingresando…' : 'Ingresar'}
      </Button>

    </form>
  )
}
