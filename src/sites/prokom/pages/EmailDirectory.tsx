import { CopyEmail } from '@/components/shared/CopyEmail'
import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { Icon } from '@/components/ui/Icon'
import { extraEmailsToShow } from '@/lib/prokom/data'
import type { HubLineContact } from '@/lib/prokom/lineContacts'
import type { SharedLine } from '@/lib/shared/project'

import { Mark } from '../home/Mark'
import { lineStyle } from '../lineColors'

type Props = {
  /** The hub's own address (`SiteSettings` of `prokom`) — the office, for anything general. */
  main: string | null
  /** The orders mailbox and the like (`HubSettings.extraEmails`, switched on). */
  extras: readonly { label: string; email: string }[]
  /** Contacts of the five lines (their own panels win, `CompanyData.lines` fills the gaps). */
  lines: readonly HubLineContact[]
  /** `CompanyData.lines` — the short description of each line. */
  company: readonly SharedLine[]
}

/**
 * „Adresy e-mail” on `/kontakt` (Krystian 22.11): every mailbox of the company in one place — the
 * office and the orders mailbox first, then one card a line in its colour with what it does, the
 * address with „Kopiuj” and its site. Every address from the panel; a line without one is left
 * out. Nothing at all while there is no address to show.
 */
export function EmailDirectory({ main, extras, lines, company }: Props) {
  const firm = [
    ...(main
      ? [{ label: 'Biuro', note: 'Sprawy ogólne — przekażemy je do właściwej linii.', email: main }]
      : []),
    ...extraEmailsToShow(extras, main).map((row) => ({ ...row, note: null })),
  ]
  const own = lines.filter((line) => line.email)
  if (!firm.length && !own.length) return null
  return (
    <section
      id="adresy-e-mail"
      aria-labelledby="adresy-e-mail-h"
      className={`${PAGE_CONTAINER} pk-mails`}
    >
      <div className="pk-mails__head">
        <span className="pk-eb">Napisz bezpośrednio</span>
        <h2 id="adresy-e-mail-h" className="pk-h2">
          Każda linia ma swoją skrzynkę.
        </h2>
        <p className="pk-lead">
          Wiadomość trafia prosto do zespołu, który się sprawą zajmie. Nie wiesz, do kogo napisać?
          Biuro przekaże ją dalej.
        </p>
      </div>
      {firm.length > 0 && (
        <ul className="pk-mails__firm" role="list">
          {firm.map((row) => (
            <li key={row.email} className="pk-mails__box">
              <span className="pk-mails__icon" aria-hidden="true">
                <Icon name="mail" />
              </span>
              <span className="pk-mails__text">
                <span className="pk-mails__label">{row.label}</span>
                {row.note && <span className="pk-mails__note">{row.note}</span>}
              </span>
              <CopyEmail email={row.email} className="pk-mails__copy" />
            </li>
          ))}
        </ul>
      )}
      {own.length > 0 && (
        <ul className="pk-mails__lines" role="list">
          {own.map((line) => {
            const about = company.find((item) => item.key === line.key)
            return (
              <li key={line.key} className="pk-mails__line" style={lineStyle(line.key)}>
                <span className="pk-mails__badge">
                  <Mark
                    label={about?.logoLabel ?? line.name.toLocaleUpperCase('pl-PL')}
                    size="xs"
                  />
                </span>
                {about?.description && <p className="pk-mails__about">{about.description}</p>}
                <CopyEmail email={line.email ?? ''} className="pk-mails__copy" />
                {line.url && line.domain && (
                  <a href={line.url} className="pk-mails__site">
                    {line.domain}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
