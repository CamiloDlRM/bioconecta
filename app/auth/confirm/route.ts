import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Destino del enlace de confirmación de correo de Supabase Auth. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const rawNext = searchParams.get('next') ?? '/eventos'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/eventos'

  const supabase = await createClient()
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  let ok = false
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error
  }

  if (ok) return NextResponse.redirect(`${origin}${next}`)
  return NextResponse.redirect(`${origin}/ingresar?error=confirmacion`)
}
