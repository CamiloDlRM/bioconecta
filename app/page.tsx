import { Hero } from '@/components/home/hero'
import { HowItWorks } from '@/components/home/how-it-works'
import { MapPreview } from '@/components/home/map-preview'
import { OrganizerCta } from '@/components/home/organizer-cta'
import { SustainabilityHighlight } from '@/components/home/sustainability-highlight'
import { ThisWeek } from '@/components/home/this-week'
import { getEvents } from '@/lib/data'

export default async function HomePage() {
  const [all, week] = await Promise.all([getEvents({}), getEvents({ when: 'semana' })])
  const thisWeek = (week.length > 0 ? week : all).slice(0, 3)
  const sample = all.find((e) => e.modality !== 'virtual' && e.sustainability) ?? null

  return (
    <>
      <Hero featured={all.slice(0, 2)} />
      <ThisWeek events={thisWeek} isFallback={week.length === 0} />
      <HowItWorks />
      <SustainabilityHighlight sample={sample} />
      <MapPreview events={all} />
      <OrganizerCta />
    </>
  )
}
