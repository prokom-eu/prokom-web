import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'

type Props = {
  industries: PublicBiznesNavigation['industries']
  /** Names of inactive industries (`active=false`) — "Wkrótce". */
  soon: string[]
}

/**
 * Branże ▾ (spec. §3.2): cards of the active industries with a picture, then "Wkrótce: …"
 * and the wizard for every other kind of company.
 */
export function IndustriesPanel({ industries, soon }: Props) {
  return (
    <Container>
      <div className="mx-auto grid max-w-2xl gap-2.5 rounded-b-3xl border border-t-0 border-border bg-card p-4 shadow-2xl sm:grid-cols-3">
        {industries.map((industry) => (
          <a
            key={industry.slug}
            href={`/branze/${industry.slug}`}
            className="flex flex-col gap-1.5 rounded-2xl bg-surface-2 p-3 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-24 items-center justify-center rounded-xl bg-[radial-gradient(ellipse_at_50%_90%,var(--glow),transparent_70%)]">
              {industry.image && (
                <MediaImage
                  image={{ ...industry.image, alt: '' }}
                  sizes="160px"
                  className="max-h-20 w-auto max-w-[90%] object-contain"
                />
              )}
            </span>
            <b className="text-[0.94rem] text-ink">{industry.name}</b>
            {industry.description && (
              <span className="text-[0.8rem] leading-snug text-ink-2">{industry.description}</span>
            )}
          </a>
        ))}
        {soon.length > 0 && (
          <p className="text-sm text-ink-2 sm:col-span-full">
            <b className="text-ink">Wkrótce:</b> {soon.join(', ')}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-3.5 py-3 text-sm text-ink-2 sm:col-span-full">
          <span>
            Biuro, szkoła, gabinet, warsztat? Opisz firmę w 60 sekund — dobierzemy zestaw.
          </span>
          <Link href="/kreator" className="font-extrabold text-accent-text hover:underline">
            Kreator 60 s →
          </Link>
        </div>
      </div>
    </Container>
  )
}
