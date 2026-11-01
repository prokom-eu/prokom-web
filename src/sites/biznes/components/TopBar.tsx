import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { openingStatus, type OpeningHours } from '@/lib/site/hours'
import { toTelHref } from '@/lib/site/link'

import { HoursStatus } from './HoursStatus'

type Props = {
  phone: string | null
  /** Hours of the main branch (`CompanyData.locations[0]`); none → no status. */
  hours: OpeningHours | null
}

/**
 * The PRO-KOM lines of the K4 bar (K33 §2.1, board `Web-Start`), each with its brand-book colour
 * (`--c-<line>` tokens). Biznes-only: the shared `BRAND_LINKS` serve the other lines' frames.
 */
const LINES = [
  {
    label: 'Biznes',
    href: 'https://prokombiznes.pl',
    color: 'bg-[var(--c-biznes)]',
    current: true,
  },
  { label: 'Instalacje', href: 'https://prokominstalacje.pl', color: 'bg-[var(--c-instalacje)]' },
  { label: 'Software', href: 'https://prokomsoftware.pl', color: 'bg-[var(--c-software)]' },
  { label: 'Tech', href: 'https://prokomserwis.pl', color: 'bg-[var(--c-tech)]' },
] as const

// K4 (K36 §1): no „Zgłoś awarię” or „Aktualności” here — the Konfigurator is the one quick link.
const CONFIGURATOR_HREF = '/konfigurator'

/**
 * Top bar of the Biznes line (spec. §3.1, K4 one row): the PRO-KOM lines, the live opening status,
 * the Konfigurator and the one main phone number. Hidden on phones — the bottom bar takes over.
 */
export function TopBar({ phone, hours }: Props) {
  const tel = phone ? toTelHref(phone) : null
  const status = hours ? openingStatus(hours, new Date()) : null
  return (
    <div className="hidden border-b border-border bg-surface text-sm text-ink-2 sm:block">
      <Container wide className="flex min-h-10 flex-wrap items-center justify-between gap-x-6">
        <nav aria-label="Linie PRO-KOM">
          <ul className="flex flex-wrap items-center gap-x-5">
            {LINES.map((link) => {
              const current = 'current' in link
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
                    <span
                      aria-hidden="true"
                      className={cx('h-[3px] w-3.5 rounded-full', link.color)}
                    />
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {hours && status && <HoursStatus hours={hours} initial={status} />}
          <Link
            href={CONFIGURATOR_HREF}
            className="inline-flex min-h-7 items-center gap-1.5 font-semibold text-ink hover:underline"
          >
            <Icon name="flash" className="size-4" strokeWidth={2} />
            Konfigurator
          </Link>
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
