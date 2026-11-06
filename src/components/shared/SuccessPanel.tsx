'use client'

import { useEffect, useRef } from 'react'

import { Icon } from '@/components/ui/Icon'

export type NextStep = { title: string; text?: string | null }

type Props = {
  /** Inquiry number from the server (`PKB-2026-0042`); none when the answer had no number. */
  number: string | null
  /** The visitor left an e-mail: a confirmation was sent there. */
  emailSent: boolean
  /** „Co dalej” of the line (`shared.contact.nextSteps`), 3 shown. */
  nextSteps?: readonly NextStep[]
  /** „Wyślij kolejne”: back to an empty form. */
  onAgain?: () => void
  heading?: string
}

/**
 * Success screen of every form (spec §5 `ContactForm`, plan F3 pkt 2): the number, the e-mail
 * confirmation, three next steps and „Wyślij kolejne”. Takes focus when it appears, so screen
 * readers announce it and the keyboard continues from here.
 */
export function SuccessPanel({
  number,
  emailSent,
  nextSteps = [],
  onAgain,
  heading = 'Dziękujemy, wiadomość wysłana.',
}: Props) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => box.current?.focus(), [])
  return (
    <div
      ref={box}
      tabIndex={-1}
      role="status"
      className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-6 outline-none focus-visible:outline-2 focus-visible:outline-accent-text"
      data-success-panel
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
          <Icon name="check" strokeWidth={2.4} />
        </span>
        <div>
          <p className="font-display text-xl font-extrabold">{heading}</p>
          {number && (
            <p className="mt-1 text-ink-2">
              Numer zgłoszenia: <b className="text-ink">{number}</b>
            </p>
          )}
          {emailSent && (
            <p className="mt-1 text-ink-2">Potwierdzenie wysłaliśmy na podany adres.</p>
          )}
        </div>
      </div>
      {nextSteps.length > 0 && (
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
            Co dalej
          </p>
          <ol className="mt-2 flex flex-col gap-2">
            {nextSteps.slice(0, 3).map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm font-extrabold text-accent-text">
                  {i + 1}
                </span>
                <span>
                  <b>{step.title}</b>
                  {step.text && <span className="block text-sm text-ink-2">{step.text}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {onAgain && (
        <button
          type="button"
          onClick={onAgain}
          className="self-start rounded-xl border-[1.5px] border-border px-4 py-2.5 font-bold hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          Wyślij kolejne
        </button>
      )}
    </div>
  )
}
