import Link from 'next/link'
import { Fragment } from 'react'

import { cx } from '@/components/ui/cx'
import type { SharedCompany } from '@/lib/shared/project'

export type LegalBarProps = {
  company: Pick<SharedCompany, 'name' | 'nip' | 'address' | 'legal'>
  /** The line's second line („Oferta skierowana do przedsiębiorców…”) — `shared.legalNote`. */
  legalNote?: string | null
  /** Year of the copyright — passed in, so the server and tests agree. */
  year: number
  /** The line's own legal pages, after „Polityka prywatności” (Software: Regulamin, AUDYT-0811 #7). */
  extraLinks?: readonly { label: string; href: string }[]
  className?: string
}

/** The same order on every site (spec §5 `LegalBar`). */
const LINKS = [
  ['privacy', 'Polityka prywatności'],
  ['cookies', 'Cookies'],
  ['accessibility', 'Dostępność'],
  ['sitemap', 'Mapa strony'],
] as const

const linkClass =
  'inline-flex min-h-6 items-center rounded-md hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text'

/**
 * Legal bar at the very bottom of the footer (spec §5 `LegalBar`, board Footer C): the company,
 * address and NIP from `CompanyData`, the line's note, the four legal pages from `CompanyData.legal`
 * and „Do góry”. Identical on every domain apart from the line's note.
 */
export function LegalBar({ company, legalNote, year, extraLinks = [], className }: LegalBarProps) {
  const { address } = company
  const where = address ? ` · ${address.street}, ${address.postalCode} ${address.city}` : ''
  return (
    <div
      className={cx(
        'flex flex-col gap-4 border-t border-line-dark-rule pt-[18px] pb-[22px] text-[12.5px] min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:gap-6',
        className,
      )}
      data-legal-bar
    >
      <div className="flex flex-col gap-1">
        <span className="text-line-dark-ink" data-legal-line>
          © {year} {company.name}
          {where} · NIP {company.nip}
        </span>
        {legalNote && <span>{legalNote}</span>}
      </div>
      <nav
        aria-label="Informacje prawne"
        className="flex flex-wrap items-center gap-x-[18px] gap-y-1 text-line-dark-ink"
      >
        {LINKS.map(([key, label]) => (
          <Fragment key={key}>
            <Link href={company.legal[key]} className={linkClass}>
              {label}
            </Link>
            {key === 'privacy' &&
              extraLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
          </Fragment>
        ))}
        <a
          href="#"
          className={cx(
            linkClass,
            'gap-1.5 border border-line-dark-rule px-2.5 py-1.5 hover:no-underline hover:bg-line-dark-current',
          )}
        >
          Do góry <span aria-hidden="true">↑</span>
        </a>
      </nav>
    </div>
  )
}
