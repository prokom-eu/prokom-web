import type { CSSProperties } from 'react'

import { InstIcon } from '../../InstIcon'
import { ProcessAxisPlay } from './ProcessAxisPlay'

export type ProcessAxisStep = {
  icon?: string
  title: string
  text: string
  /** „Co dostajesz” (RUNDA-V5 §6); without it the step has no such line. */
  get?: string
}

type Props = {
  steps: readonly ProcessAxisStep[]
  getLabel?: string
}

/**
 * A process axis (RUNDA-V5 §6, runda v6 §1.6): numbered nodes on a line. Once, when it enters the
 * screen, the line draws itself in 1.2 s, the nodes fill in turn (150 ms apart, a small pop) and
 * the cards rise in (70 ms apart) — `ProcessAxisPlay` + `podhale-proces.css`. The end state is
 * always full; without JS or with reduced motion it is drawn at once. Horizontal from 1101 px,
 * vertical on a tablet and a phone. The list itself is server-rendered.
 */
export function ProcessAxis({ steps, getLabel }: Props) {
  return (
    <ProcessAxisPlay>
      <ol className="proc" style={{ '--n': steps.length } as CSSProperties}>
        {steps.map((step, i) => (
          <li key={step.title} className="procs" style={{ '--i': i } as CSSProperties}>
            <span className="procn" aria-hidden="true">
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span className="on">{String(i + 1).padStart(2, '0')}</span>
            </span>
            <div className="procc">
              <h3 className="proct">
                {step.icon ? <InstIcon name={step.icon} size={20} className="proci" /> : null}
                {step.title}
              </h3>
              <p>{step.text}</p>
              {step.get ? (
                <p className="procg">
                  {getLabel ? <span>{getLabel}</span> : null}
                  {step.get}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </ProcessAxisPlay>
  )
}
