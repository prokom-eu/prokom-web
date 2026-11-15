'use client'

import { useState } from 'react'

import { anteny } from '../../dane/anteny'
import { InstIcon } from '../../InstIcon'
import { type Answer, quizResult } from './quiz'

const Q = anteny.quiz

/** One question with three answers (`.zkseg`, toggles with `aria-pressed`). */
function Question({
  label,
  options,
  value,
  onPick,
}: {
  label: string
  options: readonly string[]
  value: Answer
  onPick: (answer: Answer) => void
}) {
  return (
    <div className="tvqi" role="group" aria-label={label}>
      <span className="usl">{label}</span>
      <div className="zkseg">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`zksg${value === index ? ' on' : ''}`}
            aria-pressed={value === index}
            onClick={() => onPick(index as Answer)}
          >
            <b>{option}</b>
          </button>
        ))}
      </div>
    </div>
  )
}

/** „Czy mój telewizor jest gotowy?” in `#multipleksy`: two questions, the result read aloud. */
export function TvQuiz() {
  const [q1, setQ1] = useState<Answer>(-1)
  const [q2, setQ2] = useState<Answer>(-1)
  const result = Q.results[quizResult(q1, q2)]
  return (
    <div className="tvq">
      <Question label={Q.q1.label} options={Q.q1.options} value={q1} onPick={setQ1} />
      <Question label={Q.q2.label} options={Q.q2.options} value={q2} onPick={setQ2} />
      <div className={`tvres${result.tone ? ` ${result.tone}` : ''}`} aria-live="polite">
        <span className="ico s">
          <InstIcon name="tv" />
        </span>
        <div>
          <b>{result.title}</b>
          <span>{result.text}</span>
        </div>
      </div>
    </div>
  )
}
