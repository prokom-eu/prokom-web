'use client'

import { useId } from 'react'

import type { SoftwareHome } from '@/lib/software/home'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { useAutoTabs } from '../home/useAutoTabs'

type Tech = NonNullable<SoftwareHome['tech']>
type Visual = Tech['tabs'][number]['visual']

/** The picture of a tab: speed gauge, shield, a search result, the stack (board `AU-pc`). */
function TechVisual({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case 'speed':
      return (
        <>
          <svg viewBox="0 0 240 150" className="v-gauge" aria-hidden="true">
            <path d="M30 130a90 90 0 0 1 180 0" className="v-gauge-track" />
            <path d="M30 130a90 90 0 0 1 180 0" className="v-gauge-arc" pathLength={100} />
            <line x1="120" y1="130" x2="120" y2="58" className="v-gauge-needle" />
            <circle cx="120" cy="130" r="8" className="v-gauge-hub" />
          </svg>
          <b className="v-big">{visual.value}</b>
          <span>{visual.caption}</span>
        </>
      )
    case 'security':
      return (
        <>
          <div className="v-shield" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
              <path d="M8.5 12l2.5 2.5 4.5-5" />
            </svg>
          </div>
          <ul className="v-pills">
            {visual.pills.map((pill) => (
              <li key={pill}>{pill}</li>
            ))}
          </ul>
        </>
      )
    case 'search':
      return (
        <div className="v-serp">
          <div className="v-serp-q">{visual.query}</div>
          <div className="v-serp-res" data-ours="">
            <span>{visual.ours[0]}</span>
            <b>{visual.ours[1]}</b>
            <i>{visual.ours[2]}</i>
          </div>
          <div className="v-serp-res">
            <span>{visual.other[0]}</span>
            <b>{visual.other[1]}</b>
          </div>
          <div className="v-serp-ai">
            <b>{visual.ai[0]}</b>
            {visual.ai[1]}
          </div>
        </div>
      )
    case 'stack':
      return (
        <ul className="v-stack">
          {visual.rows.map(([name, value]) => (
            <li key={name}>
              <b>{name}</b>
              {value}
            </li>
          ))}
        </ul>
      )
  }
}

/**
 * „Nie składamy stron z szablonu. Piszemy je pod Twoją firmę.” (ZMIANY-v24 §4 pkt 6, §4.2): one
 * section instead of „Jak robimy”, „Dlaczego nie WordPress” and „Z czego budujemy” — 4 tabs that
 * switch by themselves on the desktop until picked (`useAutoTabs`, like the v23 tabs), each with
 * its animated picture, text, a figure with its source and „them vs us”.
 */
export function TechSection({ tech }: { tech: Tech }) {
  const ids = useId()
  const tabs = useAutoTabs(tech.tabs.length, 6000)
  const tab = tech.tabs[tabs.active] ?? tech.tabs[0]
  if (!tab) return null
  return (
    <section id="technologia" className="v-sec">
      <div className="v-wrap">
        <div className="v-head-row">
          <SectionHead eyebrow={tech.eyebrow} title={tech.title} em={tech.em} />
          {tech.lead && <p className="v-lead v-lead-wide">{tech.lead}</p>}
        </div>
        <div className="sw-glass v-tech" {...tabs.region}>
          <div className="v-tabs" role="tablist" aria-label={tech.eyebrow}>
            {tech.tabs.map((item, index) => {
              const on = index === tabs.active
              return (
                <button
                  key={item.label}
                  ref={tabs.tabRef(index)}
                  id={`${ids}-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`${ids}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => tabs.pick(index)}
                  onKeyDown={tabs.onKeyDown}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <div
            key={tabs.active}
            id={`${ids}-panel`}
            role="tabpanel"
            aria-labelledby={`${ids}-tab-${tabs.active}`}
            className="v-tgrid"
          >
            <div className="v-tvis">
              <TechVisual visual={tab.visual} />
            </div>
            <div className="v-tcol">
              <h3>{tab.title}</h3>
              <p>{tab.text}</p>
              {tab.stat && (
                <div className="v-stat">
                  <b>{tab.stat.v}</b>
                  <span>{tab.stat.t}</span>
                </div>
              )}
              <div className="v-vs">
                <div>
                  <span>{tab.them[0]}</span>
                  {tab.them[1]}
                </div>
                <div data-us="">
                  <span>{tab.us[0]}</span>
                  {tab.us[1]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
