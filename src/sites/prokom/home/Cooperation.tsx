import type { HubHome } from '@/lib/prokom/home'
import { isHubLinkLive, type HubPageFlags } from '@/lib/prokom/pages'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'

type Props = {
  texts: HubHome['cooperation']
  pages: HubPageFlags
}

/**
 * „Projektujesz, budujesz albo zamawiasz więcej?” (spec §6.1 pkt 6, board 01 `#wspolpraca`): the
 * way to the B2B pages. A card or button to a page that is still off (v1.1 `/wspolpraca`) is left
 * out — never a dead link (spec §2.2).
 */
export function Cooperation({ texts, pages }: Props) {
  const links = texts.links.filter((link) => isHubLinkLive(link.href, pages))
  const cards = texts.cards.filter((card) => isHubLinkLive(card.href, pages))
  return (
    <section
      id="wspolpraca"
      data-rail-section
      aria-labelledby="wspolpraca-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-coop">
        <div className="pk-coop__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="wspolpraca-h" className="pk-h2">
            {texts.title}
          </h2>
          <p className="pk-lead">{texts.lead}</p>
          {links.length > 0 && (
            <div className="pk-coop__links">
              {links.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={index === 0 ? 'pk-btn pk-btn--accent' : 'pk-btn'}
                >
                  {link.label} <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          )}
        </div>
        {cards.length > 0 && (
          <ul className="pk-coop__cards" role="list">
            {cards.map((card) => (
              <li key={card.title} style={lineStyle(card.line)}>
                <a
                  href={card.href}
                  className="pk-ccard"
                  data-neutral={card.line === 'prokom' ? '' : undefined}
                >
                  <span className="pk-ccard__title">{card.title}</span>
                  <span className="pk-ccard__text">{card.text}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
