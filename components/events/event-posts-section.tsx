import Link from 'next/link'
import { Camera, MessageCircle, ShieldCheck } from 'lucide-react'
import { DeletePostButton } from '@/components/events/delete-post-button'
import { EventPostForm } from '@/components/events/event-post-form'
import { PhotoGallery, type GalleryPhoto } from '@/components/events/photo-gallery'
import { buttonVariants } from '@/components/ui/button'
import { formatDateTimeShort } from '@/lib/format'
import type { EventItem, EventPost, Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EventPostsSectionProps {
  event: EventItem
  posts: EventPost[]
  profile: Profile | null
  isRegistered: boolean
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

export function EventPostsSection({ event, posts, profile, isRegistered }: EventPostsSectionProps) {
  const isOrganizer = Boolean(profile && event.organizerId === profile.id)
  const canPost = Boolean(profile && (isRegistered || isOrganizer))
  const photos: GalleryPhoto[] = posts
    .filter((p) => p.imageUrl)
    .map((p) => ({
      id: p.id,
      url: p.imageUrl!,
      alt: p.imageAlt || `Foto compartida por ${p.authorName}`,
      authorName: p.authorName,
      date: formatDateTimeShort(p.createdAt),
      dateTime: p.createdAt,
    }))

  return (
    <section aria-labelledby="comunidad" className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 id="comunidad" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <Camera className="size-5 text-primary" aria-hidden="true" />
          Fotos y comentarios de asistentes
        </h2>
        <p className="text-pretty text-muted-foreground">
          Las personas inscritas comparten lo que vivieron: especies que vieron, fotos de la jornada y aprendizajes.
        </p>
      </header>

      {canPost ? (
        <EventPostForm eventId={event.id} />
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-pretty">
            {profile
              ? 'Inscríbete en este evento para compartir tus fotos y comentarios.'
              : 'Ingresa e inscríbete en este evento para compartir tus fotos y comentarios.'}
          </p>
          {!profile && (
            <Link
              href={`/ingresar?next=${encodeURIComponent(`/eventos/${event.slug}`)}`}
              className={cn(buttonVariants({ variant: 'outline' }), 'shrink-0')}
            >
              Ingresar
            </Link>
          )}
        </div>
      )}

      <PhotoGallery photos={photos} />

      {posts.length === 0 ? (
        <p className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="size-4" aria-hidden="true" />
          Aún no hay publicaciones. ¡Sé la primera persona en compartir!
        </p>
      ) : (
        <>
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
            <MessageCircle className="size-5 text-primary" aria-hidden="true" />
            Comentarios
            <span className="text-sm font-normal text-muted-foreground font-sans">({posts.length})</span>
          </h3>
          <ol aria-label="Comentarios" className="flex flex-col gap-4">
            {posts.map((p) => {
              const canDelete = Boolean(profile && (p.userId === profile.id || isOrganizer))
              return (
                <li key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full font-display font-semibold',
                      p.isOrganizer
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/15 text-secondary dark:text-primary',
                    )}
                  >
                    {initials(p.authorName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-semibold">{p.authorName}</p>
                      {p.isOrganizer && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          <ShieldCheck className="size-3" aria-hidden="true" />
                          Organizador
                        </span>
                      )}
                      <time dateTime={p.createdAt} className="text-sm text-muted-foreground">
                        {formatDateTimeShort(p.createdAt)}
                      </time>
                      {canDelete && (
                        <span className="ml-auto">
                          <DeletePostButton postId={p.id} authorName={p.authorName} />
                        </span>
                      )}
                    </div>
                    {p.body && (
                      <p className="mt-1 leading-relaxed break-words whitespace-pre-line text-pretty">{p.body}</p>
                    )}
                    {p.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.imageAlt || `Foto compartida por ${p.authorName}`}
                        loading="lazy"
                        className="mt-3 max-h-96 w-full rounded-xl border border-border object-cover sm:w-auto"
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </section>
  )
}
