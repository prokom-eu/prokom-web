'use client'

import type { CSSProperties, ReactNode } from 'react'

import type { ServiceKey } from '@/lib/instalacje/options'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { safeHue } from '../../sekcje/arch/archScene'
import {
  checklistItems,
  checklistPhases,
  checklistProgress,
  pickObject,
  plural,
  toggleItem,
  toggleSystem,
} from './architektModel'
import { setChecklist, useChecklist } from './checklistStore'

const T = A.checklistSection
const hue = (color: string | undefined) => ({ '--hc': safeHue(color) }) as CSSProperties

type Props = {
  /** Service colours from the panel, by key. */
  hues: Partial<Record<ServiceKey, string>>
  /** The „Checklista w PDF” form (I16c); until then its text only. */
  pdfForm?: ReactNode
}

/**
 * „Checklista projektanta” (`#checklista`, `ar.ck`): an object and systems choose the items to
 * plan, in three phases; ticks with a progress bar, kept in this browser only.
 */
export function DesignerChecklist({ hues, pdfForm }: Props) {
  const s = useChecklist()
  const progress = checklistProgress(s)
  const phases = checklistPhases(s)
  const objName = A.checklist.objects.find((o) => o.key === s.obj)?.name
  const systemName = (key: ServiceKey) => A.checklist.systems.find((x) => x.key === key)?.name

  return (
    <div className="arck ri">
      <div className="card arckl">
        <span className="arckh">{T.objectsTitle}</span>
        <div className="archips" role="group" aria-label={T.objectsTitle}>
          {A.checklist.objects.map((o) => {
            const on = o.key === s.obj
            return (
              <button
                key={o.key}
                type="button"
                className={on ? 'chip on' : 'chip'}
                aria-pressed={on}
                onClick={() => setChecklist((x) => pickObject(x, o.key))}
              >
                <InstIcon name={o.icon} size={16} />
                {o.name}
              </button>
            )
          })}
        </div>
        <span className="arckh">{T.systemsTitle}</span>
        <div className="arsyss" role="group" aria-label={T.systemsTitle}>
          {A.checklist.systems.map((x) => {
            const on = s.sys.includes(x.key)
            return (
              <button
                key={x.key}
                type="button"
                className={on ? 'arsys on' : 'arsys'}
                style={hue(hues[x.key])}
                aria-pressed={on}
                onClick={() => setChecklist((c) => toggleSystem(c, x.key))}
              >
                <i />
                {x.name}
              </button>
            )
          })}
        </div>
        <div className="arpdf">
          <b>{T.pdfTitle}</b>
          <span className="mut" style={{ fontSize: 14 }}>
            {T.pdfText}
          </span>
          {pdfForm}
        </div>
      </div>
      <div className="card arckr">
        <div className="arckt">
          <div>
            <b className="h3">
              {progress.total} {plural(progress.total, 'rzecz', 'rzeczy', 'rzeczy')} {T.toPlan}
            </b>
            <span className="mut">{objName}</span>
          </div>
          <div className="arckp">
            <span aria-live="polite">
              {progress.done} / {progress.total}
            </span>
            <i>
              <s style={{ width: `${progress.pct}%` }} />
            </i>
          </div>
        </div>
        {checklistItems(s).length === 0 && <p className="mut">{T.empty}</p>}
        {phases.map((p) => (
          <div key={p.key} className="arckg">
            <span className="arckgh">
              <InstIcon name={p.icon} size={16} />
              {p.name}
            </span>
            {p.items.map((item) => {
              const on = s.done.includes(item.text)
              return (
                <button
                  key={item.text}
                  type="button"
                  className={on ? 'arci on' : 'arci'}
                  style={hue(hues[item.system])}
                  aria-pressed={on}
                  onClick={() => setChecklist((c) => toggleItem(c, item.text))}
                >
                  <span className="arbox">
                    <InstIcon name="check" size={13} strokeWidth={3.2} />
                  </span>
                  <span className="arckx">{item.text}</span>
                  <em>{systemName(item.system)}</em>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
