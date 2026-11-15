'use client'

import { useState } from 'react'

type Props = {
  items: readonly string[]
  initial: readonly number[]
  done: string
  partial: string[]
}

/**
 * „Sprawdź swój monitoring” (`PoradnikRodo.js → qz`): ticked points, the progress bar fills from
 * the left by their number, the result line. `partial[n]` = the text for n ticked points (a
 * function cannot cross to the client). Checkboxes as toggle buttons like the prototype.
 */
export function GuideQuiz({ items, initial, done, partial }: Props) {
  const [ticked, setTicked] = useState<readonly number[]>(initial)
  const n = ticked.length
  return (
    <div className="card qz">
      {items.map((text, index) => {
        const on = ticked.includes(index)
        return (
          <button
            key={index}
            type="button"
            className={'chk' + (on ? ' on' : '')}
            aria-pressed={on}
            onClick={() => setTicked((t) => (on ? t.filter((x) => x !== index) : [...t, index]))}
          >
            <em aria-hidden="true">{on ? '✓' : ''}</em>
            <span>
              <b>{text}</b>
            </span>
          </button>
        )
      })}
      <div className="prog" aria-hidden="true">
        {items.map((text, index) => (
          <i key={text} className={index < n ? 'on' : undefined} />
        ))}
      </div>
      <b aria-live="polite">{n === items.length ? done : partial[n]}</b>
    </div>
  )
}
