import type { HubHome } from '@/lib/prokom/home'
import type { HubNewsLink } from '@/lib/prokom/news'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from './Mark'
import type { HomeLine } from './model'

const DATE = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Warsaw',
})

type Props = {
  texts: HubHome['news']
  news: HubNewsLink[]
  lines: readonly HomeLine[]
  /** `/aktualnosci`, or `null` while the page is off (v1.1 flag). */
  allHref: string | null
}

/**
 * „Co nowego w liniach” (spec §6.1 pkt 9, ADR-H001 pkt 7): the newest posts of the line sites as
 * links to their source — the text stays on its domain. No posts = no section.
 */
export function News({ texts, news, lines, allHref }: Props) {
  if (!news.length) return null
  return (
    <section
      id="aktualnosci"
      data-rail-section
      aria-labelledby="aktualnosci-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="aktualnosci-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        {allHref && (
          <a href={allHref} className="pk-hbtn">
            {texts.allLink} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
      <ul className="pk-news" role="list">
        {news.map((post) => {
          const line = lines.find((entry) => entry.key === post.line)
          const date = new Date(post.publishedAt)
          return (
            <li key={post.href} style={lineStyle(post.line)}>
              <a href={post.href} className="pk-lcard pk-ncard">
                <Mark label={line?.label ?? null} decorative />
                <h3 className="pk-ncard__title">{post.title}</h3>
                {post.lead && <p className="pk-ncard__lead">{post.lead}</p>}
                <span className="pk-ncard__foot">
                  <span className="pk-ncard__meta">
                    {Number.isNaN(date.getTime()) ? null : (
                      <time dateTime={post.publishedAt}>{DATE.format(date)}</time>
                    )}
                    {line?.domain && ` · ${line.domain}`}
                  </span>
                  <span className="pk-chip-go pk-ncard__go">
                    {texts.read} <span aria-hidden="true">↗</span>
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
