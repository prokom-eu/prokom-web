import type { CSSProperties } from 'react'

import { InstIcon } from '../../InstIcon'

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
 * A process axis (RUNDA-V5 §6): numbered nodes on a line that draws itself while the list
 * scrolls through the screen. Each step's segment and node fill with the accent as the line
 * reaches them (`podhale-proces.css`, scroll-driven; drawn in full without support and with
 * reduced motion). Horizontal from 761 px, vertical on a phone. Server-rendered, no JS.
 */
export function ProcessAxis({ steps, getLabel }: Props) {
  return (
    <ol className="proc" style={{ '--n': steps.length } as CSSProperties}>
      {steps.map((step, i) => (
        <li key={step.title} className="procs ri" style={{ '--i': i } as CSSProperties}>
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
  )
}
