import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { ProjectorView, type ProjectorPhoto } from '@/components/events/projector-view'
import { getEventBySlug, getEventPosts } from '@/lib/data'

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  return {
    title: event ? `Proyector · ${event.title}` : 'Proyector',
    robots: { index: false, follow: false },
  }
}

/** Dirección pública del sitio según la petición (sirve igual en local y en Vercel). */
async function siteOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'bioconecta-henna.vercel.app'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/**
 * Modo proyector: muestra en una pantalla grande las fotos que van subiendo los asistentes,
 * con un QR para que más personas se unan. Se actualiza sola cada pocos segundos.
 */
export default async function ProjectorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const posts = await getEventPosts(event)
  const photos: ProjectorPhoto[] = posts
    .filter((p) => p.imageUrl)
    .map((p) => ({
      id: p.id,
      url: p.imageUrl!,
      alt: p.imageAlt || `Foto compartida por ${p.authorName}`,
      authorName: p.authorName,
      body: p.body,
    }))
  const participants = new Set(posts.map((p) => p.userId)).size

  const eventUrl = `${await siteOrigin()}/eventos/${event.slug}`
  // El QR se genera aquí mismo (sin servicios externos) con la URL en texto plano
  const qrSvg = await QRCode.toString(eventUrl, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })

  return (
    <ProjectorView
      eventTitle={event.title}
      eventSlug={event.slug}
      eventUrl={eventUrl}
      qrSvg={qrSvg}
      photos={photos}
      participants={participants}
    />
  )
}
