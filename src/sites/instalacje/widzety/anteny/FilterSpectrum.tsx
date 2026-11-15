'use client'

import { useState } from 'react'

import { anteny } from '../../dane/anteny'

const F = anteny.filter

/** The LTE/5G filter switch and the spectrum it changes (`#filtr-5g`). */
export function FilterSpectrum() {
  const [on, setOn] = useState(false)
  const state = on ? F.on : F.off
  return (
    <>
      <div className="spbar">
        <button
          type="button"
          className={`lkpw${on ? ' on' : ''}`}
          aria-pressed={on}
          onClick={() => setOn((value) => !value)}
        >
          <i />
          <b>{state.label}</b>
        </button>
        <span className="mut" aria-live="polite">
          {state.text}
        </span>
      </div>
      <div className={`spec${on ? ' f' : ''}`}>
        <div className="spax">
          {F.axis.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="sptrack">
          <div className="sptv">
            <b>{F.tv.title}</b>
            <span>{F.tv.text}</span>
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="splte">
            <b>{F.lte.title}</b>
            <span>{F.lte.text}</span>
          </div>
        </div>
        <div className="spfil" aria-hidden="true" />
      </div>
    </>
  )
}
