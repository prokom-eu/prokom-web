'use client'

import { type KeyboardEvent, useId, useState } from 'react'

import type { HubForHome } from '@/lib/prokom/forHome'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'

/**
 * „Konkretnie: co robimy w domu” (board 04 `#tematy`): installation topics as WAI-ARIA tabs (arrow
 * keys, Home, End); the panel shows the topic's tiles, its note and the way to the Instalacje site.
 */
export function TopicTabs({
  texts,
  href,
}: {
  texts: HubForHome['topics']
  /** The Instalacje site, from its panel. */
  href: string | null
}) {
  const baseId = useId()
  const [index, setIndex] = useState(0)
  const topic = texts.items[index] ?? texts.items[0]
  if (!topic) return null
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = texts.items.length - 1
    const moves: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    const to = moves[event.key]
    if (to === undefined) return
    event.preventDefault()
    setIndex(to)
    document.getElementById(`${baseId}-${to}`)?.focus()
  }
  return (
    <section
      id="tematy"
      aria-labelledby="tematy-h"
      className={`pk-sect ${HUB_CONTAINER}`}
      style={lineStyle('instalacje')}
    >
      <div className="pk-sect__intro">
        <span className="pk-eb">{texts.eyebrow}</span>
        <h2 id="tematy-h" className="pk-h2 pk-h2--big">
          {texts.title}
        </h2>
      </div>
      <div
        role="tablist"
        aria-labelledby="tematy-h"
        className="pk-ltabs pk-ltabs--topics"
        onKeyDown={onKey}
      >
        {texts.items.map((item, at) => (
          <button
            key={item.name}
            id={`${baseId}-${at}`}
            type="button"
            role="tab"
            aria-selected={at === index}
            aria-controls={`${baseId}-panel`}
            tabIndex={at === index ? 0 : -1}
            className="pk-ltab"
            onClick={() => setIndex(at)}
          >
            <span className="pk-ltab__name">{item.name}</span>
            <span className="pk-ltab__short">{item.short}</span>
          </button>
        ))}
      </div>
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`${baseId}-${index}`}
        className="pk-area"
      >
        <div className="pk-area__intro">
          <span className="pk-eb pk-eb--line">{topic.eyebrow}</span>
          <h3 className="pk-h3">{topic.title}</h3>
          <p className="pk-area__lead">{topic.lead}</p>
        </div>
        <ul className="pk-area__list" role="list">
          {topic.tiles.map((tile) => (
            <li key={`${tile.label}-${tile.title}`} className="pk-tile">
              <span className="pk-eb pk-eb--line">{tile.label}</span>
              <span className="pk-osv__title">{tile.title}</span>
              <span className="pk-area__text">{tile.text}</span>
            </li>
          ))}
        </ul>
        <div className="pk-area__cta">
          <p className="pk-area__lead">{topic.note}</p>
          {href && (
            <a href={href} className="pk-hbtn pk-hbtn--line">
              {topic.cta} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
