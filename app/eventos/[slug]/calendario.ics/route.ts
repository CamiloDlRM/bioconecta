import { buildIcs } from '@/lib/calendar'
import { getEventBySlug } from '@/lib/data'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    return new Response('Evento no encontrado', { status: 404 })
  }

  return new Response(buildIcs(event), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  })
}
