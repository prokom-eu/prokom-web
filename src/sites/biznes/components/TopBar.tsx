import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { BRAND_LINKS } from '@/lib/brand/lines'
import { openingStatus, type OpeningHours } from '@/lib/site/hours'
import { toTelHref } from '@/lib/site/link'

import { HoursStatus } from './HoursStatus'

type Props = {
  phone: string | null
  /** Hours of the main branch (`CompanyData.locations[0]`); none → no status. */
  hours: OpeningHours | null
}

// Quick help is a section of the home page (spec. §4); news is its own page.
const QUICK_LINKS: { label: string; href: string; icon: IconName }[] = [
  { label: 'Pomoc zdalna', href: '/#szybkie', icon: 'remote' },
  { label: 'Zgłoś awarię', href: '/#szybkie', icon: 'wrench' },
  { label: 'Aktualności', href: '/aktualnosci', icon: 'doc' },
]

/**
 * Top bar of the Biznes line (spec. §3.1): the PRO-KOM lines, the live opening status, quick
 * help links and the one main phone number. Hidden on phones — the bottom bar takes over.
 */
export function TopBar({ phone, hours }: Props) {
  const tel = phone ? toTelHref(phone) : null
  const status = hours ? openingStatus(hours, new Date()) : null
  return (
    <div className="hidden border-b border-border bg-surface text-sm text-ink-2 sm:block">
      <Container wide>
        <nav aria-label="Linie PRO-KOM">
          <ul className="flex flex-wrap items-center gap-x-5">
            {BRAND_LINKS.map((link) => {
              const current = link.line === 'biznes'
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={current ? 'true' : undefined}
                    className={cx(
                      'inline-flex min-h-7 items-center gap-2',
                      current ? 'font-bold text-ink' : 'hover:text-ink',
                    )}
                  >
                    {current && (
                      <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-accent" />
                    )}
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pb-2">
          {hours && status && <HoursStatus hours={hours} initial={status} />}
          <ul className="flex flex-wrap items-center gap-x-5">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-7 items-center gap-1.5 font-semibold text-accent-text hover:underline"
                >
                  <Icon name={link.icon} className="size-4" strokeWidth={2} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {phone && (
            <p>
              Oferty i serwis:{' '}
              {tel ? (
                <a href={tel} className="font-extrabold text-ink hover:underline">
                  {phone}
                </a>
              ) : (
                <span className="font-extrabold text-ink">{phone}</span>
              )}
            </p>
          )}
        </div>
      </Container>
    </div>
  )
}
