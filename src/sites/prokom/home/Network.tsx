import Image from 'next/image'
import type { CSSProperties } from 'react'

import { Icon } from '@/components/ui/Icon'
import type { VisibleNetwork } from '@/lib/prokom/brands'
import { type HubHome, withVisibleFacts } from '@/lib/prokom/home'
import { isHubLinkLive, type HubPageFlags } from '@/lib/prokom/pages'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { BRAND_LOGOS } from './brandArt'
import { POLAND_PATH, POLAND_VIEWBOX, RABKA_POINT } from './polandMap'

type Props = {
  texts: NonNullable<HubHome['network']>
  /** The network of „Marki” (logo, status, site) — only while its fact is visible. */
  network: VisibleNetwork
  /** Company facts visible here (on production: approved only, spec §3). */
  facts: readonly { value: string }[]
  /** The salon's address from the company data — never typed into the texts. */
  address: string | null
  pages: HubPageFlags
}

/**
 * ALSEN as a premium section above „Współpraca” (runda 1811 D4, Krystian 19.11). A stage in the
 * colour of its line: the partner's logo on a white plate with the agreed status, the network as
 * Poland drawn in points with one lit — our salon in Rabka — and the four things a customer gets.
 * The figure and the salon line show only while their facts are visible. Server-rendered.
 */
export function Network({ texts, network, facts, address, pages }: Props) {
  const logo = BRAND_LOGOS[network.name]
  const [stat] = withVisibleFacts([texts.stat], facts)
  const [point] = withVisibleFacts([texts.point], facts)
  const cta = isHubLinkLive(texts.cta.href, pages) ? texts.cta : null
  const more = isHubLinkLive(texts.more.href, pages) ? texts.more : null
  return (
    <section
      id="alsen"
      data-rail-section
      aria-labelledby="alsen-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-al" style={lineStyle(network.line)}>
        <div className="pk-al__main">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="alsen-h" className="pk-h2 pk-al__title">
            {texts.title}
          </h2>
          <p className="pk-lead pk-al__lead">{texts.lead}</p>
          <div className="pk-al__cta">
            {cta && (
              <a href={cta.href} className="pk-hbtn pk-hbtn--accent pk-hbtn--big">
                {cta.label}
              </a>
            )}
            {more && (
              <a href={more.href} className="pk-hbtn">
                {more.label}
              </a>
            )}
            <a href={network.website} target="_blank" rel="noopener" className="pk-al__site">
              {network.linkLabel}
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="pk-al__stage">
          <div className="pk-al__plate">
            {logo ? (
              <Image
                src={logo.src}
                width={logo.width}
                height={logo.height}
                alt={network.name}
                sizes="(max-width: 640px) 70vw, 300px"
              />
            ) : (
              <span className="pk-al__name">{network.name}</span>
            )}
            <span className="pk-al__status">
              <Icon name="check" />
              {network.status}
            </span>
          </div>

          {(stat || point) && (
            <div className={stat ? 'pk-al__map' : 'pk-al__map pk-al__map--nostat'}>
              {stat && (
                <p className="pk-al__stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                  <small>{stat.note}</small>
                </p>
              )}
              <PolandField lit={Boolean(point)} town={townOf(address)} />
              {point && (
                <p className="pk-al__point">
                  <Icon name="pin" />
                  <span>
                    <strong>{point.text}</strong>
                    {address && <span>{address}</span>}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <ul className="pk-al__points" role="list">
          {texts.points.map((item, index) => (
            <li key={item.title} style={{ '--i': index } as CSSProperties}>
              <span className="pk-al__icon" aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <h3 className="pk-al__ptitle">{item.title}</h3>
              <p className="pk-al__ptext">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/**
 * Poland as a field of points (22.11), Rabka-Zdrój lit with a slow ping while the salon's fact is
 * visible. Decorative: the figure and the salon are in the text next to it.
 */
function PolandField({ lit, town }: { lit: boolean; town: string | null }) {
  const [x, y] = RABKA_POINT
  return (
    <svg className="pk-al__pl" viewBox={POLAND_VIEWBOX} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="pk-al-dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.7" className="pk-al__dot" />
        </pattern>
        <clipPath id="pk-al-clip">
          <path d={POLAND_PATH} />
        </clipPath>
      </defs>
      <path d={POLAND_PATH} className="pk-al__land" />
      <rect width="100%" height="100%" fill="url(#pk-al-dots)" clipPath="url(#pk-al-clip)" />
      <path d={POLAND_PATH} className="pk-al__edge" />
      {lit && (
        <g transform={`translate(${x} ${y})`}>
          <circle r="22" className="pk-al__glow" />
          <circle r="7" className="pk-al__ring" />
          <circle r="5.5" className="pk-al__here" />
          {town && (
            <text x="-14" y="5" textAnchor="end" className="pk-al__town">
              {town}
            </text>
          )}
        </g>
      )}
    </svg>
  )
}

/** „Rabka-Zdrój” from „ul. Orkana 16B, 34-700 Rabka-Zdrój” (the company data, never typed here). */
function townOf(address: string | null): string | null {
  return address?.match(/\d{2}-\d{3}\s+(.+)$/)?.[1]?.trim() || null
}
