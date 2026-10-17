import { sortDays } from '@/lib/site/company'
import { toTelHref } from '@/lib/site/link'
import type { PublicCompanyData } from '@/lib/site/public'

import { TextLink } from './ui/TextLink'

const DAY_LABELS: Record<string, string> = {
  mon: 'pon.',
  tue: 'wt.',
  wed: 'śr.',
  thu: 'czw.',
  fri: 'pt.',
  sat: 'sob.',
  sun: 'niedz.',
}

export function Phone({ number }: { number: string }) {
  const href = toTelHref(number)
  return href ? <TextLink href={href}>{number}</TextLink> : <>{number}</>
}

type Location = PublicCompanyData['locations'][number]

/** Branch address with opening hours (footer and the Contact block). */
export function LocationAddress({ location }: { location: Location }) {
  return (
    <address className="not-italic">
      <strong className="font-bold">{location.name}</strong>
      <br />
      {location.street}, {location.postalCode} {location.city}
      {location.hours.map((row) => (
        <span key={`${row.days.join()}-${row.opens}`}>
          <br />
          {sortDays(row.days)
            .map((day) => DAY_LABELS[day] ?? day)
            .join(', ')}{' '}
          {row.opens}–{row.closes}
        </span>
      ))}
    </address>
  )
}
