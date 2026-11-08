'use client'

import { useId } from 'react'

import { useAutoTabs } from '@/sites/software/components/home/useAutoTabs'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

export type ProcessStep = {
  num: string
  name: string
  duration: string | null
  /** „Etap 01 · 30 min” — filled on the server (`stageEyebrow`). */
  eyebrow: string
  heading: string
  text: string | null
  pay: string | null
  payNote: string | null
}

type Props = { eyebrow: string; title: string; em: string | null; steps: ProcessStep[] }

/**
 * „Większość płacisz po odbiorze” (ZMIANY-v24 §4 pkt 9, §4.2, pattern `s_7`): heading and the card
 * of the picked stage on the left (sticky on the desktop), the 5 stages on the right — the picked
 * one in the accent, the ones before it ticked off. Tabs switch by themselves on the desktop until
 * picked (`useAutoTabs`, like the v23 process); each stage card is its tab panel, the others inert.
 */
export function ProcessSection({ eyebrow, title, em, steps }: Props) {
  const ids = useId()
  const tabs = useAutoTabs(steps.length, 6000)
  if (steps.length === 0) return null
  return (
    <section id="proces" className="v-sec">
      <div className="v-wrap v-proc" {...tabs.region}>
        <div className="v-proc-side">
          <SectionHead eyebrow={eyebrow} title={title} em={em} />
          {/* All cards in one cell: the tallest sets the height, so switching never moves the page. */}
          <div className="v-proc-cards">
            {steps.map((item, index) => {
              const on = index === tabs.active
              return (
                <div
                  key={item.num}
                  id={`${ids}-panel-${index}`}
                  role="tabpanel"
                  aria-labelledby={`${ids}-tab-${index}`}
                  inert={!on}
                  className="sw-glass v-proc-card"
                >
                  <span className="sw-eyebrow">{item.eyebrow}</span>
                  <h3>{item.heading}</h3>
                  {item.text && <p>{item.text}</p>}
                  {item.pay && (
                    <div className="v-proc-pay">
                      <b>{item.pay}</b>
                      {item.payNote && <span>{item.payNote}</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="v-steps" role="tablist" aria-label="Etapy" aria-orientation="vertical">
          {steps.map((item, index) => {
            const on = index === tabs.active
            return (
              <button
                key={item.num}
                ref={tabs.tabRef(index)}
                id={`${ids}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`${ids}-panel-${index}`}
                tabIndex={on ? 0 : -1}
                data-done={index < tabs.active ? '' : undefined}
                onClick={() => tabs.pick(index)}
                onKeyDown={tabs.onKeyDown}
              >
                <span className="v-step-n" aria-hidden="true">
                  {item.num}
                </span>
                <b>{item.name}</b>
                {item.duration && <span>{item.duration}</span>}
                {on && tabs.rotating ? <i className="v-tab-progress" aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
