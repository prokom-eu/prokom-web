import Link from 'next/link'
import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SharedLineKey } from '@/lib/shared/lines'
import type { OpeningHours } from '@/lib/shared/openingStatus'
import type { SharedCompany, SharedLine } from '@/lib/shared/project'
import { toTelHref } from '@/lib/site/link'

import { AddressMap } from './AddressMap'
import { LegalBar } from './LegalBar'
import { LineLogo } from './LineLogo'
import { LinesBand } from './LinesBand'
import { OpeningStatus } from './OpeningStatus'

export type FooterColumn = { heading: string; links: { label: string; href: string }[] }

export type SiteFooterProps = {
  line: SharedLineKey
  /** Accessible name of the mark, e.g. „PRO-KOM Biznes”. */
  lineName: string
  /** `footer.text` of the line. */
  description: string | null
  /** Three promises with a tick (`shared.footerPromises`). */
  promises: readonly string[]
  /** The line's link columns (`shared.footerColumns`). */
  columns: readonly FooterColumn[]
  company: Pick<SharedCompany, 'name' | 'nip' | 'address' | 'legal' | 'mapsUrl'>
  contact: {
    phone: string | null
    email: string | null
    hours: OpeningHours
    holidays: readonly string[]
    responsePromise: string | null
  }
  lines: readonly SharedLine[]
  legalNote: string | null
  /** Server time (ISO) for the opening status; the year of the copyright comes from it too. */
  now: string
  /** Decoration of the top edge (the Instalacje mountain ridge), drawn by the line. */
  edge?: ReactNode
}

const headingClass = 'text-xs font-extrabold tracking-[0.12em] text-line-dark-ink uppercase'
const linkClass =
  'rounded-md hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text'

function ColumnLinks({ column }: { column: FooterColumn }) {
  return (
    <ul className="flex flex-col gap-[11px]">
      {column.links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <Link href={link.href} className={linkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * Footer of every line (spec §5 `SiteFooter`, board Footer): on the line's dark colour — A the
 * line's part (mark, description, promises, link columns, the shared contact column with the mini
 * map), B `LinesBand` and C `LegalBar` the same everywhere. On a phone the link columns fold into
 * an accordion; everything else stacks.
 */
export function SiteFooter({
  line,
  lineName,
  description,
  promises,
  columns,
  company,
  contact,
  lines,
  legalNote,
  now,
  edge,
}: SiteFooterProps) {
  const tel = contact.phone ? toTelHref(contact.phone) : null
  const { address } = company
  return (
    <footer className="relative bg-line-dark text-sm text-line-dark-text" data-site-footer>
      {edge}
      <div className="mx-auto box-content max-w-[1280px] px-5 pt-[52px] min-[768px]:px-8">
        <div
          className="grid gap-10 min-[900px]:[grid-template-columns:1.5fr_repeat(var(--cols),minmax(0,1fr))_1.25fr]"
          style={{ '--cols': columns.length } as React.CSSProperties}
        >
          <div className="flex flex-col gap-4">
            <LineLogo line={line} alt={lineName} on="dark" height={34} />
            {description && <p className="max-w-[330px] leading-[1.6]">{description}</p>}
            {promises.length > 0 && (
              <ul className="flex flex-col gap-2">
                {promises.map((promise) => (
                  <li
                    key={promise}
                    className="flex items-center gap-[9px] font-bold text-line-dark-ink"
                  >
                    <Icon name="check" strokeWidth={2.4} className="size-4 text-on-dark-text" />
                    {promise}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {columns.map((column) => (
            <nav
              key={column.heading}
              aria-label={column.heading}
              className="hidden flex-col gap-[11px] min-[900px]:flex"
            >
              <h2 className={headingClass}>{column.heading}</h2>
              <ColumnLinks column={column} />
            </nav>
          ))}
          {columns.length > 0 && (
            <div className="flex flex-col border-y border-line-dark-rule min-[900px]:hidden">
              {columns.map((column) => (
                <details
                  key={column.heading}
                  className="group border-b border-line-dark-rule last:border-b-0"
                >
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                    <span className={headingClass}>{column.heading}</span>
                    <Icon
                      name="arrow"
                      strokeWidth={2.2}
                      className="size-4 rotate-90 transition-transform group-open:-rotate-90"
                    />
                  </summary>
                  <nav aria-label={column.heading} className="pb-4">
                    <ColumnLinks column={column} />
                  </nav>
                </details>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3" data-footer-contact>
            <h2 className={headingClass}>Kontakt</h2>
            {address && (
              <AddressMap
                variant="dark"
                height={118}
                radius={14}
                description={`Mapa: ${company.name}, ${address.street}, ${address.postalCode} ${address.city}`}
                mapsUrl={company.mapsUrl}
                routeLabel="Wyznacz trasę"
                className="border border-line-dark-rule"
              />
            )}
            {contact.phone && tel && (
              <a
                href={tel}
                className={cx(
                  linkClass,
                  'font-display text-[22px] font-extrabold text-line-dark-ink',
                )}
              >
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className={cx(linkClass, 'font-bold text-on-dark-text')}
              >
                {contact.email}
              </a>
            )}
            {address && (
              <span className="leading-normal">
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </span>
            )}
            <OpeningStatus hours={contact.hours} holidays={contact.holidays} now={now} onDark />
            {contact.responsePromise && (
              <span className="text-[13px]">{contact.responsePromise}</span>
            )}
          </div>
        </div>

        <LinesBand
          lines={lines}
          current={line}
          className="mt-[34px] border-t border-line-dark-rule pt-[26px]"
        />
        <LegalBar
          company={company}
          legalNote={legalNote}
          year={new Date(now).getUTCFullYear()}
          className="mt-[26px]"
        />
      </div>
    </footer>
  )
}
