import Image from 'next/image'

import { Icon } from '@/components/ui/Icon'
import {
  type HubBrands,
  visibleAuthorizations,
  visibleNetwork,
  type VisibleNetwork,
} from '@/lib/prokom/brands'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { AUTHORIZATION_PRODUCTS, BRAND_LOGOS } from './brandArt'
import { Mark } from './Mark'
import { type HomeLine, plural } from './model'

type Props = {
  brands: HubBrands
  /** Company facts visible here (on production: approved only, spec §3). */
  facts: readonly { value: string }[]
  lines: readonly HomeLine[]
  /** `/partnerzy`, or `null` while the page is off (v1.1 flag). */
  allHref: string | null
  /** `false` while the network has its own section higher on the page — never shown twice. */
  showNetwork?: boolean
}

/**
 * „Marki i autoryzacje” (spec §6.1 pkt 7, board 01 `#marki`): the four authorizations — each only
 * while its company fact is visible — and the brand groups of the lines on the page, without any
 * status (spec §3). Server-rendered.
 */
export function Brands({ brands, facts, lines, allHref, showNetwork = true }: Props) {
  const authorizations = visibleAuthorizations(brands, facts)
  const network = showNetwork ? visibleNetwork(brands, facts) : null
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
                  <AuthorizationArt name={row.name} />
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
        {network && <NetworkCard network={network} />}
        {groups.length > 0 && (
          <ul className="pk-bgroups" role="list">
            {groups.map((group, index) => (
              <li
                key={`${index}-${group.title}`}
                className="pk-bgroup"
                style={lineStyle(group.line)}
              >
                <span className="pk-bgroup__top">
                  <Mark label={group.label} />
                  <span className="pk-bgroup__count">
                    {plural(group.brands.length, ['marka', 'marki', 'marek'])}
                  </span>
                </span>
                <span className="pk-bgroup__title">{group.title}</span>
                <ul className="pk-bgroup__logos" role="list">
                  {group.brands.map((brand) => {
                    const logo = BRAND_LOGOS[brand]
                    return (
                      <li key={brand} className={logo ? 'pk-blogo' : 'pk-blogo pk-blogo--name'}>
                        {logo ? (
                          <Image
                            src={logo.src}
                            width={logo.width}
                            height={logo.height}
                            alt={brand}
                            sizes="140px"
                          />
                        ) : (
                          brand
                        )}
                      </li>
                    )
                  })}
                </ul>
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

/**
 * A partner network (ALSEN, runda 1811 D4) — a wide card under the four authorizations: a network
 * of shops is a different kind of partnership than a producer's, so it is not one of them.
 */
export function NetworkCard({ network }: { network: VisibleNetwork }) {
  const logo = BRAND_LOGOS[network.name]
  return (
    <div className="pk-net" style={lineStyle(network.line)}>
      <span className="pk-auth__plate pk-net__plate">
        {logo ? (
          <Image
            src={logo.src}
            width={logo.width}
            height={logo.height}
            alt={network.name}
            sizes="200px"
          />
        ) : (
          <span className="pk-auth__name">{network.name}</span>
        )}
      </span>
      <span className="pk-net__body">
        <span className="pk-auth__status">
          <span className="pk-auth__icon" aria-hidden="true">
            <Icon name="shield" />
          </span>
          {network.status} · {network.label}
        </span>
        <span className="pk-auth__text">{network.text}</span>
      </span>
      <a href={network.website} target="_blank" rel="noopener" className="pk-net__link">
        {network.linkLabel} <span aria-hidden="true">↗</span>
        <span className="sr-only"> (otwiera się w nowej karcie)</span>
      </a>
    </div>
  )
}

/**
 * Logo of an authorization on a light plate (full-colour logos, both themes) and one of its
 * products on the line's glow. The logo's `alt` names the brand — the card's name for readers.
 */
function AuthorizationArt({ name }: { name: keyof typeof AUTHORIZATION_PRODUCTS }) {
  const logo = BRAND_LOGOS[name]
  const product = AUTHORIZATION_PRODUCTS[name]
  return (
    <span className="pk-auth__art">
      <span className="pk-auth__plate">
        {logo ? (
          <Image src={logo.src} width={logo.width} height={logo.height} alt={name} sizes="160px" />
        ) : (
          <span className="pk-auth__name">{name}</span>
        )}
      </span>
      <span className="pk-auth__photo">
        <Image
          src={product.src}
          width={product.width}
          height={product.height}
          alt={product.alt}
          sizes="(min-width: 1100px) 160px, 40vw"
        />
      </span>
    </span>
  )
}
