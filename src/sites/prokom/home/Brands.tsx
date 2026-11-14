import { Icon } from '@/components/ui/Icon'
import { type HubBrands, visibleAuthorizations } from '@/lib/prokom/brands'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from './Mark'
import { type HomeLine, plural } from './model'

type Props = {
  brands: HubBrands
  /** Company facts visible here (on production: approved only, spec §3). */
  facts: readonly { value: string }[]
  lines: readonly HomeLine[]
  /** `/partnerzy`, or `null` while the page is off (v1.1 flag). */
  allHref: string | null
}

/**
 * „Marki i autoryzacje” (spec §6.1 pkt 7, board 01 `#marki`): the four authorizations — each only
 * while its company fact is visible — and the brand groups of the lines on the page, without any
 * status (spec §3). Server-rendered.
 */
export function Brands({ brands, facts, lines, allHref }: Props) {
  const authorizations = visibleAuthorizations(brands, facts)
  const lineOf = (key: string) => lines.find((line) => line.key === key)
  const groups = brands.groups.flatMap((group) => {
    const line = lineOf(group.line)
    return line || group.line === 'prokom' ? [{ ...group, label: line?.label ?? null }] : []
  })
  if (!authorizations.length && !groups.length) return null

  return (
    <section id="marki" data-rail-section aria-labelledby="marki-h" className="pk-band">
      <div className={`pk-sect pk-sect--band ${HUB_CONTAINER}`}>
        <div className="pk-sect__head">
          <div className="pk-sect__intro">
            <span className="pk-eb">{brands.eyebrow}</span>
            <h2 id="marki-h" className="pk-h2 pk-h2--big">
              {brands.title}
            </h2>
          </div>
          <div className="pk-sect__aside pk-stack">
            <p className="pk-lead">{brands.lead}</p>
            {allHref && (
              <a href={allHref} className="pk-hbtn">
                {brands.allLink} <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
        {authorizations.length > 0 && (
          <ul className="pk-auth" role="list">
            {authorizations.map((row) => {
              const line = lineOf(row.line)
              return (
                <li key={row.name} className="pk-auth__card" style={lineStyle(row.line)}>
                  <span className="pk-auth__status">
                    <span className="pk-auth__icon" aria-hidden="true">
                      <Icon name="shield" />
                    </span>
                    {row.status}
                  </span>
                  <span className="pk-auth__name">{row.name}</span>
                  <span className="pk-auth__text">{row.text}</span>
                  {line && (
                    <span className="pk-auth__line">
                      <i aria-hidden="true" />
                      {line.name}
                      {line.domain && ` · ${line.domain}`}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {groups.length > 0 && (
          <ul className="pk-bgroups" role="list">
            {groups.map((group) => (
              <li key={group.title} className="pk-bgroup" style={lineStyle(group.line)}>
                <span className="pk-bgroup__top">
                  <Mark label={group.label} />
                  <span className="pk-bgroup__count">
                    {plural(group.brands.length, ['marka', 'marki', 'marek'])}
                  </span>
                </span>
                <span className="pk-bgroup__title">{group.title}</span>
                <span className="pk-bgroup__brands">
                  {group.brands.map((brand) => (
                    <span key={brand} className="pk-bch">
                      {brand}
                    </span>
                  ))}
                </span>
                <span className="pk-bgroup__text">{group.text}</span>
              </li>
            ))}
          </ul>
        )}
        {/* The note speaks of the authorizations above — without them it would mislead. */}
        {authorizations.length > 0 && <p className="pk-note">{brands.note}</p>}
      </div>
    </section>
  )
}
