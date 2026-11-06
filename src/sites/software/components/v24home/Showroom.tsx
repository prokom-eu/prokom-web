'use client'

import Link from 'next/link'
import { useState, type KeyboardEvent } from 'react'

import type { SoftwareHome } from '@/lib/software/home'
import { Mockup } from '@/sites/software/components/mockups/Mockup'
import { Segment } from '@/sites/software/components/ui/Segment'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

type Showroom = NonNullable<SoftwareHome['showroom']>
type Mode = 'site' | 'phone' | 'system'

/**
 * Showroom „Tak może wyglądać Twoja strona albo system” (ZMIANY-v24 §4.2, board `AU-pc`
 * „podglady”): industries as tabs, the view switch (site / on a phone / system), the mock-up of the
 * industry, four points and „Policz dla tej branży” — the wizard with the industry set
 * (`/dobierz?firma=<key>`).
 */
export function ShowroomSection({ showroom }: { showroom: Showroom }) {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<Mode>('site')
  const industry = showroom.industries[active] ?? showroom.industries[0]
  if (!industry) return null
  const count = showroom.industries.length

  const features =
    mode === 'system' ? [industry.systemName, ...showroom.systemFeatures] : industry.features
  const subtitle =
    mode === 'system'
      ? `${showroom.systemPrefix} ${industry.systemName.toLowerCase()}`
      : `${showroom.sitePrefix} ${industry.name.toLowerCase()}`

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    if (step === undefined) return
    event.preventDefault()
    const next = (index + step + count) % count
    setActive(next)
    document.getElementById(`v-ind-${next}`)?.focus()
  }

  return (
    <section id="podglady-v24" className="v-sec">
      <div className="v-wrap">
        <SectionHead
          eyebrow={showroom.eyebrow}
          title={showroom.title}
          em={showroom.em}
          lead={showroom.lead}
          align="center"
          className="v-head-center"
        />
        <div className="v-shw">
          <div className="v-indgrid" role="tablist" aria-label={showroom.eyebrow}>
            {showroom.industries.map((item, index) => {
              const on = index === active
              return (
                <button
                  key={item.key}
                  id={`v-ind-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="v-stage"
                  tabIndex={on ? 0 : -1}
                  className="v-ind"
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >
                  <span className="v-ii" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                  </span>
                  {item.name}
                </button>
              )
            })}
          </div>
          <div
            id="v-stage"
            role="tabpanel"
            aria-labelledby={`v-ind-${active}`}
            className="sw-glass v-stage"
          >
            <div className="v-stbar">
              <div className="v-stname">
                <b>{industry.name}</b>
                <span>{subtitle}</span>
              </div>
              <Segment
                label={showroom.modes.join(' / ')}
                options={[
                  { value: 'site', label: showroom.modes[0] },
                  { value: 'phone', label: showroom.modes[1] },
                  { value: 'system', label: showroom.modes[2] },
                ]}
                value={mode}
                onChange={setMode}
                className="v-modes"
              />
            </div>
            <div className="v-scr v-stscr" aria-hidden="true">
              <div className="v-stglow" />
              <div key={`${industry.key}-${mode}`} className="v-swap">
                {mode === 'system' ? (
                  <Mockup kind="dash" variant={industry.system} fit="contain" />
                ) : mode === 'phone' ? (
                  <Mockup kind="phone" variant={industry.site} toast fit="contain" />
                ) : (
                  <Mockup kind="site" variant={industry.site} phone fit="contain" />
                )}
              </div>
            </div>
            <div className="v-stfoot">
              <ul className="v-feats">
                {features.map((feature) => (
                  <li key={feature}>
                    <i aria-hidden="true">✓</i>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link className="v-btn" href={`/dobierz?firma=${industry.key}`}>
                {showroom.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
