'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/data'
import { eventFormSchema, formValuesToEventFields, registrationSchema } from '@/lib/validation'
import type { EventStatus, OrganizationType, Role } from '@/lib/types'

/**
 * SERVER ACTIONS — backend de BioConecta sobre Supabase.
 * Todas usan la sesión del usuario: las políticas RLS y los triggers de la base de datos
 * son la última barrera (cupos, permisos de organizador, propiedad de los datos).
 */
export type ActionResult = { ok: boolean; error?: string; notice?: string; id?: number }

const ORG_TYPES: OrganizationType[] = ['fundacion', 'universidad', 'colectivo', 'entidad_publica', 'empresa', 'otro']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const text = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim()

/** Solo permite rutas internas para evitar redirecciones abiertas. */
function safeNext(next: string): string | null {
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : null
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

function authErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese correo. Intenta ingresar.'
  if (m.includes('password')) return 'La contraseña no cumple los requisitos de seguridad (mínimo 8 caracteres).'
  if (m.includes('rate limit') || m.includes('too many')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (m.includes('error sending')) return 'No pudimos enviar el correo de confirmación. Intenta más tarde.'
  if (m.includes('is invalid')) return 'No pudimos usar ese correo. Revisa que esté bien escrito o usa otro.'
  console.error('[auth]', message)
  return 'Ocurrió un error con la autenticación. Inténtalo de nuevo.'
}

/** Traduce errores de Postgres/PostgREST a mensajes para la persona usuaria. */
function dbErrorMessage(error: { code?: string; message: string }, fallback: string): string {
  if (error.code === 'P0001') return error.message // mensajes de los triggers (cupos, evento terminado…)
  if (error.code === '23505') return 'Ya existe un registro igual.'
  if (error.code === '42501') return 'No tienes permisos para realizar esta acción.'
  if (error.code === '23514') return 'Algún dato no es válido. Revisa el formulario.'
  console.error('[db]', error.code, error.message)
  return fallback
}

function revalidateEventPages(slug?: string | null) {
  revalidatePath('/')
  revalidatePath('/eventos')
  revalidatePath('/organizador')
  revalidatePath('/mis-inscripciones')
  if (slug) revalidatePath(`/eventos/${slug}`)
}

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export async function signIn(formData: FormData): Promise<ActionResult> {
  const email = text(formData, 'email').toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = safeNext(text(formData, 'next'))

  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Ingresa un correo válido.' }
  if (!password) return { ok: false, error: 'Ingresa tu contraseña.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: authErrorMessage(error.message) }

  let destination = next
  if (!destination) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    destination = profile?.role === 'organizador' ? '/organizador' : '/eventos'
  }
  revalidatePath('/', 'layout')
  redirect(destination)
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const fullName = text(formData, 'fullName')
  const email = text(formData, 'email').toLowerCase()
  const password = String(formData.get('password') ?? '')
  const role = text(formData, 'role') as Role
  const organizationName = text(formData, 'organizationName')
  const organizationType = text(formData, 'organizationType') as OrganizationType
  const next = safeNext(text(formData, 'next'))

  if (fullName.length < 3) return { ok: false, error: 'Escribe tu nombre completo.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Ingresa un correo válido.' }
  if (password.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (role !== 'participante' && role !== 'organizador') return { ok: false, error: 'Elige cómo quieres usar BioConecta.' }
  if (role === 'organizador') {
    if (organizationName.length < 2) return { ok: false, error: 'Indica el nombre de tu organización.' }
    if (!ORG_TYPES.includes(organizationType)) return { ok: false, error: 'Selecciona el tipo de organización.' }
  }

  const destination = next ?? (role === 'organizador' ? '/organizador' : '/eventos')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // El trigger private.handle_new_user crea el perfil con estos datos.
      data: {
        full_name: fullName,
        role,
        organization_name: role === 'organizador' ? organizationName : null,
        organization_type: role === 'organizador' ? organizationType : null,
      },
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(destination)}`,
    },
  })
  if (error) return { ok: false, error: authErrorMessage(error.message) }

  // Si el proyecto exige confirmar el correo, no hay sesión todavía.
  if (!data.session) {
    // Supabase devuelve un usuario sin identidades cuando el correo ya existía.
    if (data.user && data.user.identities?.length === 0) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo. Intenta ingresar.' }
    }
    return {
      ok: true,
      notice: `Te enviamos un correo a ${email}. Abre el enlace para confirmar tu cuenta y luego ingresa.`,
    }
  }

  revalidatePath('/', 'layout')
  redirect(destination)
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// ---------------------------------------------------------------------------
// Inscripciones
// ---------------------------------------------------------------------------

export async function registerToEvent(eventId: number, formData: FormData): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { ok: false, error: 'Inicia sesión para inscribirte.' }

  const parsed = registrationSchema.safeParse({
    fullName: formData.get('fullName') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    accept: formData.get('accept') ?? '',
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisa los datos.' }

  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('id, slug, status, ends_at')
    .eq('id', eventId)
    .maybeSingle()
  if (!event || event.status !== 'publicado') return { ok: false, error: 'Este evento ya no está disponible.' }
  if (new Date(event.ends_at).getTime() < Date.now()) return { ok: false, error: 'Este evento ya terminó.' }

  const phone = parsed.data.phone ? parsed.data.phone.slice(0, 30) : null
  const { data: existing } = await supabase
    .from('registrations')
    .select('id, status')
    .eq('event_id', eventId)
    .eq('user_id', profile.id)
    .maybeSingle()

  if (existing?.status === 'confirmada') return { ok: false, error: 'Ya estás inscrito en este evento.' }

  // El trigger de la base de datos valida el cupo de forma atómica.
  const { error } = existing
    ? await supabase
        .from('registrations')
        .update({ status: 'confirmada', full_name: parsed.data.fullName, phone })
        .eq('id', existing.id)
    : await supabase.from('registrations').insert({
        event_id: eventId,
        user_id: profile.id,
        full_name: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        phone,
      })

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Ya estás inscrito en este evento.' }
    return { ok: false, error: dbErrorMessage(error, 'No pudimos completar tu inscripción.') }
  }

  revalidateEventPages(event.slug)
  return { ok: true }
}

export async function cancelRegistration(registrationId: number): Promise<ActionResult> {
  const profile = await getCurrentProfile()
  if (!profile) return { ok: false, error: 'Inicia sesión para continuar.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('registrations')
    .update({ status: 'cancelada' })
    .eq('id', registrationId)
    .eq('user_id', profile.id)
    .select('event_id')
    .maybeSingle()

  if (error) return { ok: false, error: dbErrorMessage(error, 'No pudimos cancelar la inscripción.') }
  if (!data) return { ok: false, error: 'No encontramos esta inscripción.' }

  const { data: event } = await supabase.from('events').select('slug').eq('id', data.event_id).maybeSingle()
  revalidateEventPages(event?.slug)
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Eventos (organizadores)
// ---------------------------------------------------------------------------

function parsePayload(formData: FormData) {
  let json: unknown
  try {
    json = JSON.parse(String(formData.get('payload') ?? '{}'))
  } catch {
    return { error: 'No se pudo leer el formulario.' } as const
  }
  const parsed = eventFormSchema.safeParse(json)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos del evento.' } as const
  return { data: parsed.data } as const
}

const slugify = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '')

function toRow(fields: ReturnType<typeof formValuesToEventFields>) {
  return {
    title: fields.title,
    summary: fields.summary,
    description: fields.description,
    event_type: fields.eventType,
    modality: fields.modality,
    status: fields.status,
    organizer_name: fields.organizerName,
    starts_at: fields.startsAt,
    ends_at: fields.endsAt,
    city: fields.city,
    venue_name: fields.venueName,
    address: fields.address,
    latitude: fields.latitude,
    longitude: fields.longitude,
    online_url: fields.onlineUrl,
    capacity: fields.capacity,
    requirements: fields.requirements,
    is_free: fields.isFree,
    price_info: fields.priceInfo,
    contact_email: fields.contactEmail,
    source_url: fields.sourceUrl,
    sustainability: fields.sustainability as unknown as Record<string, unknown> | null,
  }
}

/** Sube la portada al bucket event-images/{uid}/… y devuelve su URL pública. */
async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  formData: FormData,
): Promise<{ url?: string | null; error?: string }> {
  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) return {}
  const ext = IMAGE_TYPES[file.type]
  if (!ext) return { error: 'La imagen debe ser JPG, PNG o WebP.' }
  if (file.size > MAX_IMAGE_BYTES) return { error: 'La imagen no puede pesar más de 5 MB.' }

  const path = `${userId}/${randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('event-images')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (error) {
    console.error('[uploadCover]', error.message)
    return { error: 'No pudimos subir la imagen. Intenta con otra.' }
  }
  return { url: supabase.storage.from('event-images').getPublicUrl(path).data.publicUrl }
}

async function requireOrganizer() {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Inicia sesión para continuar.' } as const
  if (profile.role !== 'organizador') return { error: 'Solo las cuentas de organizador pueden gestionar eventos.' } as const
  return { profile } as const
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const auth = await requireOrganizer()
  if ('error' in auth) return { ok: false, error: auth.error }

  const parsed = parsePayload(formData)
  if ('error' in parsed) return { ok: false, error: parsed.error }
  const status: EventStatus = text(formData, 'status') === 'publicado' ? 'publicado' : 'borrador'

  const supabase = await createClient()
  const cover = await uploadCover(supabase, auth.profile.id, formData)
  if (cover.error) return { ok: false, error: cover.error }

  const base = slugify(parsed.data.title) || 'evento'
  const slug = `${base}-${randomUUID().slice(0, 6)}`

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...toRow(formValuesToEventFields(parsed.data, status)),
      slug,
      organizer_id: auth.profile.id,
      image_url: cover.url ?? null,
    })
    .select('id, slug')
    .single()

  if (error) return { ok: false, error: dbErrorMessage(error, 'No pudimos guardar el evento.') }

  revalidateEventPages(data.slug)
  return { ok: true, id: data.id }
}

export async function updateEvent(id: number, formData: FormData): Promise<ActionResult> {
  const auth = await requireOrganizer()
  if ('error' in auth) return { ok: false, error: auth.error }

  const supabase = await createClient()
  const { data: current } = await supabase
    .from('events')
    .select('id, slug, status, image_url')
    .eq('id', id)
    .eq('organizer_id', auth.profile.id)
    .maybeSingle()
  if (!current) return { ok: false, error: 'No encontramos este evento.' }

  const parsed = parsePayload(formData)
  if ('error' in parsed) return { ok: false, error: parsed.error }
  const requested = text(formData, 'status')
  const status = (['borrador', 'publicado', 'cancelado'].includes(requested) ? requested : current.status) as EventStatus

  const cover = await uploadCover(supabase, auth.profile.id, formData)
  if (cover.error) return { ok: false, error: cover.error }
  const removeImage = text(formData, 'removeImage') === '1'
  const imageUrl = cover.url ?? (removeImage ? null : current.image_url)

  const { error } = await supabase
    .from('events')
    .update({ ...toRow(formValuesToEventFields(parsed.data, status)), image_url: imageUrl })
    .eq('id', id)
    .eq('organizer_id', auth.profile.id)

  if (error) return { ok: false, error: dbErrorMessage(error, 'No pudimos guardar los cambios.') }

  revalidateEventPages(current.slug)
  return { ok: true, id }
}

export async function setEventStatus(id: number, status: EventStatus): Promise<ActionResult> {
  const auth = await requireOrganizer()
  if ('error' in auth) return { ok: false, error: auth.error }
  if (!['borrador', 'publicado', 'cancelado'].includes(status)) return { ok: false, error: 'Estado no válido.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .eq('organizer_id', auth.profile.id)
    .select('slug')
    .maybeSingle()

  if (error) return { ok: false, error: dbErrorMessage(error, 'No pudimos cambiar el estado.') }
  if (!data) return { ok: false, error: 'No encontramos este evento.' }

  revalidateEventPages(data.slug)
  return { ok: true }
}

export async function deleteEvent(id: number): Promise<ActionResult> {
  const auth = await requireOrganizer()
  if ('error' in auth) return { ok: false, error: auth.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('organizer_id', auth.profile.id)
    .select('slug')
    .maybeSingle()

  if (error) return { ok: false, error: dbErrorMessage(error, 'No pudimos eliminar el evento.') }
  if (!data) return { ok: false, error: 'No encontramos este evento.' }

  revalidateEventPages(data.slug)
  return { ok: true }
}
