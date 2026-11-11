'use client'

import { useId, useState, useTransition } from 'react'
import { AlertCircle, Loader2, MailCheck, Sprout, Users } from 'lucide-react'
import { PasswordInput } from '@/components/forms/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ORGANIZATION_TYPE_LABELS } from '@/lib/event-types'
import { signUp } from '@/lib/actions'
import type { OrganizationType, Role } from '@/lib/types'
import { cn } from '@/lib/utils'

const ROLES: { value: Role; label: string; description: string; icon: typeof Users }[] = [
  { value: 'participante', label: 'Participante', description: 'Quiero encontrar eventos e inscribirme.', icon: Users },
  { value: 'organizador', label: 'Organizador', description: 'Quiero publicar y gestionar eventos.', icon: Sprout },
]

export function RegisterForm({ next }: { next?: string }) {
  const [role, setRole] = useState<Role>('participante')
  const [orgType, setOrgType] = useState<OrganizationType | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const roleLabelId = useId()

  function onSubmit(formData: FormData) {
    setError(null)
    setNotice(null)
    startTransition(async () => {
      const result = await signUp(formData)
      if (result && !result.ok) setError(result.error ?? 'No pudimos crear tu cuenta.')
      else if (result?.notice) setNotice(result.notice)
    })
  }

  if (notice) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-pretty">{notice}</p>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="organizationType" value={role === 'organizador' ? orgType : ''} />

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
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="tu@correo.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" required aria-describedby="password-help" />
        <p id="password-help" className="text-sm text-muted-foreground">
          Mínimo 8 caracteres.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span id={roleLabelId} className="text-sm leading-none font-medium">
          ¿Cómo vas a usar BioConecta?
        </span>
        <RadioGroup
          value={role}
          onValueChange={(v) => setRole(v as Role)}
          aria-labelledby={roleLabelId}
          className="grid gap-3 sm:grid-cols-2"
        >
          {ROLES.map(({ value, label, description, icon: Icon }) => {
            const id = `role-${value}`
            const selected = role === value
            return (
              <label
                key={value}
                htmlFor={id}
                className={cn(
                  'relative flex cursor-pointer flex-col gap-2 rounded-2xl border bg-card p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                  selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50',
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <RadioGroupItem value={value} id={id} />
                </span>
                <span className="font-display text-lg font-semibold">{label}</span>
                <span className="text-sm text-muted-foreground">{description}</span>
              </label>
            )
          })}
        </RadioGroup>
      </div>

      {role === 'organizador' && (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-muted/50 p-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="organizationName">Nombre de la organización</Label>
            <Input id="organizationName" name="organizationName" autoComplete="organization" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="organizationType">Tipo de organización</Label>
            <Select value={orgType} onValueChange={(v) => setOrgType(v as OrganizationType)}>
              <SelectTrigger id="organizationType" className="w-full">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
