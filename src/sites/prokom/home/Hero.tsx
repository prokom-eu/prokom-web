import { CountUp } from '@/components/motion/CountUp'
import { OpeningStatus } from '@/components/shared/OpeningStatus'
import { Icon } from '@/components/ui/Icon'
import { type HubHome, withVisibleFacts } from '@/lib/prokom/home'
import type { IconName } from '@/lib/shared/icons'
import type { SharedCompany } from '@/lib/shared/project'
import { toTelHref } from '@/lib/site/link'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { splitLastSentence } from './heroText'
import { HeroTiles } from './HomeIslands'
import type { HomeLine } from './model'

type Props = {
  home: HubHome
  lines: HomeLine[]
  /** Company facts visible here (on production: approved only, spec §3). */
  facts: { value: string; label: string }[]
  company: SharedCompany
  /** The company's phones (`SiteSettings` of the hub). */
  phone: string | null
  phone2: string | null
  now: string
}

const LINE_STRIPES = ['biznes', 'instalacje', 'software', 'tech', 'gaming'] as const

/**
 * Hero of the home page (spec §6.1 pkt 1, board 01 `#start`): the PRO-KOM tile with the five line
 * colours, a search field that opens `/szukaj`, hint chips, „Dobierz” and the company phone; the
 * five line tiles with slides; company numbers; and the trust bar. Numbers and trust items tied to
 * a fact show only while the fact is visible (`withVisibleFacts`).
 */
export function Hero({ home, lines, facts, company, phone, phone2, now }: Props) {
  const { hero } = home
  const tel = phone ? toTelHref(phone) : null
  const tel2 = phone2 ? toTelHref(phone2) : null
  const [titleStart, titleEnd] = splitLastSentence(hero.title)
  const counters = withVisibleFacts(hero.counters, facts)
  const trust = withVisibleFacts(hero.trustBar, facts)
  const urlOf = (line: string) => lines.find((entry) => entry.key === line)?.url ?? null

  return (
    <>
      <section id="start" data-rail-section aria-labelledby="start-h" className="pk-hero">
        <div aria-hidden="true" className="pk-hero__dots" />
        <div className={`pk-hero__inner ${HUB_CONTAINER}`}>
          <HeroTiles
            lines={lines.map(({ key, name, label, domain, url, hero: tile }) => ({
              key,
              name,
              label,
              domain,
              url,
              hero: tile,
            }))}
            techStages={home.lines.techStages.map((stage) => stage.title)}
          >
            <div className="pk-hb-main">
              <span aria-hidden="true" className="pk-hstr">
                {LINE_STRIPES.map((line) => (
                  <i key={line} style={lineStyle(line)} />
                ))}
              </span>
              <span aria-hidden="true" className="pk-hdots" />
              <div className="pk-hb-main__pills">
                <span className="pk-pill pk-pill--accent">{hero.eyebrow}</span>
                <OpeningStatus
                  hours={company.hours}
                  holidays={company.holidays}
                  now={now}
                  variant="pill"
                />
              </div>
              {/* H1 = „PRO-KOM” (spec §4): the hyphen is real text, drawn as the green bar. */}
              <div className="pk-hb-main__h1">
                <h1 id="start-h" className="pk-hb-main__word">
                  <span className="pk-wm">PRO</span>
                  <span className="pk-hy">-</span>
                  <span className="pk-wm">KOM</span>
                </h1>
                <p className="pk-hb-main__title">
                  {titleStart}
                  {titleEnd && <span className="pk-hb-main__em"> {titleEnd}</span>}
                </p>
              </div>
              <p className="pk-hb-main__lead">{hero.lead}</p>

              <div className="pk-hb-main__body">
                <form action="/szukaj" method="get" role="search" className="pk-hq">
                  <Icon name="search" className="pk-hq__icon" />
                  <label htmlFor="pk-hq" className="sr-only">
                    Czego potrzebujesz?
                  </label>
                  <input
                    id="pk-hq"
                    name="q"
                    type="search"
                    autoComplete="off"
                    placeholder={hero.hints[0] ? `np. ${hero.hints[0].text}` : undefined}
                    className="pk-hq__input"
                  />
                  <button type="submit" className="pk-hq__go">
                    Szukaj
                  </button>
                </form>
                <ul className="pk-hch-list" aria-label="Najczęściej szukane">
                  {hero.chips.map((chip) => (
                    <li key={chip.label}>
                      <a
                        href={`/szukaj?q=${encodeURIComponent(chip.label)}`}
                        className="pk-hch"
                        style={lineStyle(chip.line)}
                      >
                        <span aria-hidden="true" />
                        {chip.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {/* Company numbers inside the tile (Krystian 15.11: instead of the steps and of a
                    separate strip under the hero) — only the facts visible here. */}
                {counters.length > 0 && (
                  <ul className="pk-hfacts">
                    {counters.map((counter) => (
                      <li key={counter.label}>
                        <span className="pk-hfacts__value">
                          <CountUp text={counter.value} />
                        </span>
                        <span className="pk-hfacts__label">{counter.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="pk-hb-main__cta">
                  <a href="#dobierz" className="pk-hcta">
                    {hero.cta} <span aria-hidden="true">→</span>
                  </a>
                  {phone && tel && (
                    <span className="pk-hphones">
                      <a href={tel} className="pk-hphone">
                        {phone}
                      </a>
                      {phone2 && tel2 && (
                        <a href={tel2} className="pk-hphone">
                          {phone2}
                        </a>
                      )}
                    </span>
                  )}
                  <span className="pk-hb-main__note">{hero.unsure}</span>
                </div>
              </div>
            </div>
          </HeroTiles>
        </div>
      </section>

      {trust.length > 0 && (
        <div className="pk-mqw" aria-label="Autoryzacje i fakty" role="region">
          <div className="pk-mq">
            {[0, 1].map((copy) => (
              <ul key={copy} className="pk-mq__list" aria-hidden={copy === 1 ? true : undefined}>
                {trust.map((item) => {
                  const href = item.line === 'prokom' ? '/o-firmie' : urlOf(item.line)
                  const body = (
                    <>
                      <span className="pk-mqc" aria-hidden="true">
                        <Icon name={trustIcon(item)} />
                      </span>
                      <span className="pk-mqi__text">
                        <span className="pk-mqi__note">{item.note}</span>
                        <span>{item.title}</span>
                      </span>
                    </>
                  )
                  return (
                    <li key={item.title} style={lineStyle(item.line)}>
                      {href ? (
                        <a href={href} className="pk-mqi" tabIndex={copy === 1 ? -1 : undefined}>
                          {body}
                          <span aria-hidden="true" className="pk-mqa">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <span className="pk-mqi">{body}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/** Icon of a trust-bar item: the company, an authorization, or the line's offer. */
function trustIcon(item: HubHome['hero']['trustBar'][number]): IconName {
  if (item.line === 'prokom') return 'cal'
  if (item.facts.length > 0) return 'shield'
  const byLine: Record<string, IconName> = {
    instalacje: 'home',
    software: 'site',
    tech: 'wrench',
    gaming: 'pc',
  }
  return byLine[item.line] ?? 'check'
}
