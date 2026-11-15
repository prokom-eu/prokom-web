import type { HubOffer } from '@/lib/prokom/offer'
import { isHubLinkLive, type HubPageFlags } from '@/lib/prokom/pages'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from '../home/Mark'
import { plural } from '../home/model'
import type { OfferLine } from './model'

/**
 * „Kto czym się zajmuje” (board 02 `#linie`): one card per line — audience, promise, phone and
 * domain from the panels; the card opens the catalog with only that line (`?linia=`).
 */
export function LinesGrid({ texts, lines }: { texts: HubOffer['lines']; lines: OfferLine[] }) {
  return (
    <section id="linie" aria-labelledby="linie-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="linie-h" className="pk-h2">
            {texts.title}
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <ul className="pk-o5" role="list">
        {lines.map((line) => (
          <li key={line.key} style={lineStyle(line.key)}>
            <a href={`/linie?linia=${line.key}#katalog`} className="pk-lcard pk-olc">
              <Mark label={line.label} />
              <span className="pk-olc__short">{line.short}</span>
              <span className="pk-olc__who">
                <strong>{texts.who}</strong> {line.who}
              </span>
              <span className="pk-olc__foot">
                {line.promise && (
                  <span className="pk-olc__promise">
                    <i aria-hidden="true" />
                    {line.promise}
                  </span>
                )}
                {(line.phone || line.domain) && (
                  <span className="pk-olc__contact">
                    {line.phone && <span className="pk-olc__phone">{line.phone}</span>}
                    {line.domain && <span>{line.domain}</span>}
                  </span>
                )}
                <span className="pk-olc__count">
                  {plural(line.count, ['usługa', 'usługi', 'usług'])} {texts.inCatalog}{' '}
                  <span aria-hidden="true">↑</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** „Co dalej” (board 02 `#dalej`): links to the next pages; a page that is still off is left out. */
export function NextSteps({ texts, pages }: { texts: HubOffer['next']; pages: HubPageFlags }) {
  const items = texts.items.filter((item) => isHubLinkLive(item.href, pages))
  if (!items.length) return null
  return (
    <section
      id="dalej"
      aria-labelledby="dalej-h"
      className={`pk-sect pk-sect--last ${HUB_CONTAINER}`}
    >
      <div className="pk-sect__intro">
        <span className="pk-eb">{texts.eyebrow}</span>
        <h2 id="dalej-h" className="pk-h2">
          {texts.title}
        </h2>
      </div>
      <ul className="pk-onx-list" role="list">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="pk-onx">
              <span className="pk-onx__title">{item.title}</span>
              <span className="pk-onx__text">{item.text}</span>
              <span aria-hidden="true" className="pk-onx__go">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
