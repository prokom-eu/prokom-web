'use client'

import type { CSSProperties } from 'react'

import { useRevealReady } from '@/components/motion/RevealObserver'
import { CONFIGURATOR_ANCHOR } from '@/lib/biznes/procurement/handoff'
import { scheduleRows } from '@/lib/biznes/procurement/logic'
import type { ProcurementPageData } from '@/lib/biznes/procurement/schema'

import { useProcurement } from './ProcurementConfigurator'

const COLUMNS = 10

/**
 * „Twój harmonogram” (ZAOPATRZENIE §6), counted from the configurator. The bars grow from the
 * left when the card rises into view (`data-revealed`, motion only without reduced motion).
 */
export function Schedule({ gantt }: { gantt: ProcurementPageData['steps']['gantt'] }) {
  const { state, data, services } = useProcurement()
  const rows = scheduleRows(state, data, services)
  const reveal = useRevealReady()
  return (
    <div className="zp-gantt zp-card" {...(reveal && { 'data-reveal': '' })}>
      <p className="zp-gh">
        <b>{gantt.title}</b>
        <span>
          {gantt.note} · <a href={`#${CONFIGURATOR_ANCHOR}`}>zmień w zestawie ↑</a>
        </span>
      </p>
      <ol>
        {rows.map((row, i) => (
          <li key={`${i}-${row.label}`} className="zp-grow">
            <span>{row.label}</span>
            <span className="zp-track">
              <span
                className="zp-bar"
                data-tone={row.tone}
                style={
                  {
                    '--i': i,
                    left: `${(row.from / COLUMNS) * 100}%`,
                    width: `${((row.to - row.from) / COLUMNS) * 100}%`,
                  } as CSSProperties
                }
              >
                {row.note}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className="zp-weeks" aria-hidden="true">
        <span />
        <span>
          {Array.from({ length: COLUMNS }, (_, i) => (
            <span key={i}>
              <i className="zp-wk">{gantt.unit} </i>
              {i + 1}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
