'use client'

import { type CSSProperties, useRef, useState } from 'react'

import { alarmy } from '../../dane/alarmy'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  DOOR_MS,
  doorPhone,
  holiday,
  HOLIDAY_INITIAL,
  HOLIDAY_MAX,
  HOLIDAY_MIN,
  INTERCOM_INITIAL,
  VERSION_INITIAL,
  versionItems,
} from './alarmModel'

const fill = (token: string): CSSProperties => ({ fill: `var(--${token})` })

/** „Wersje alarmu” (`#wersje`): elements of the chosen object lit, the rest dimmed. */
export function AlarmVersions() {
  const T = alarmy.versions
  const [index, setIndex] = useState(VERSION_INITIAL)
  const version = T.items[index] ?? T.items[0]!
  return (
    <div className="card alv ri">
      <div className="illbar" style={{ padding: '0 0 14px' }}>
        <div className="seg" role="group" aria-label={T.tabsLabel}>
          {T.items.map((v, i) => (
            <button
              key={v.name}
              type="button"
              className={index === i ? 'on' : ''}
              aria-pressed={index === i}
              onClick={() => setIndex(i)}
            >
              <InstIcon name={v.icon} size={15} />
              {v.name}
            </button>
          ))}
        </div>
        <span className="tag a">{version.sub}</span>
      </div>
      <div className="alvg xb-alv">
        {versionItems(index).map(({ key, on }) => {
          const el = T.elements[key]
          return (
            <div key={key} className={on ? 'alvi on' : 'alvi'}>
              <span className="ico" style={{ width: 40, height: 40 }}>
                <InstIcon name={el.icon} size={19} />
              </span>
              <div>
                <b>{el.name}</b>
                <span>{el.text}</span>
                <em>{el.model}</em>
              </div>
            </div>
          )
        })}
      </div>
      <p className="src" style={{ margin: '12px 0 0' }}>
        {T.note}
      </p>
    </div>
  )
}

/**
 * Door phone screen (`#wideodomofon`): the call goes ringing → talk → gate open → closed every
 * 2.6 s until the visitor presses a button (paused off screen and with reduced motion).
 */
export function DoorPhone() {
  const T = alarmy.doorPhone
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState(0)
  const [touched, setTouched] = useState(false)
  useInterval(() => setState((s) => (s + 1) % T.states.length), DOOR_MS, {
    enabled: !touched,
    target: ref,
  })
  const d = doorPhone(state)
  const s = T.states[state] ?? T.states[0]!
  const press = (next: number) => {
    setTouched(true)
    setState(next)
  }
  return (
    <div ref={ref} className="phone">
      <div className="phs" style={{ minHeight: 520 }}>
        <div className="phh">
          <span>{T.screen}</span>
          <span>{d.time}</span>
        </div>
        <div className={d.ringing ? 'vdscr ring' : 'vdscr'}>
          <svg viewBox="0 0 300 220" aria-hidden="true">
            <rect width="300" height="220" style={fill('il-door-bg')} />
            <rect y="150" width="300" height="70" style={fill('il-door-ground')} />
            <path
              d="M0 120 H300"
              style={{ stroke: 'var(--inst-scene-wall-line)' }}
              strokeWidth="5"
            />
            <path
              d="M20 96 V150 M70 96 V150 M230 96 V150 M280 96 V150"
              style={{ stroke: 'var(--inst-scene-wall-line)' }}
              strokeWidth="7"
            />
            <rect
              x="98"
              y="70"
              width="104"
              height="150"
              style={{ fill: 'var(--il-door)', stroke: 'var(--il-door-frame)' }}
              strokeWidth="5"
            />
            <circle cx="150" cy="104" r="22" style={fill('il-face')} />
            <path d="M112 220 V160 a38 38 0 0 1 76 0 V220 Z" style={fill('il-red')} />
            <rect x="122" y="168" width="56" height="38" rx="4" style={fill('il-parcel')} />
            <text
              x="130"
              y="192"
              style={{ fill: 'var(--inst-plan-white)', fontFamily: 'var(--font-sans)' }}
              fontWeight="800"
              fontSize="12"
            >
              {T.parcel}
            </text>
          </svg>
          <span className="vdl">{s.label}</span>
        </div>
        <div className="phn" aria-live={touched ? 'polite' : 'off'}>
          <InstIcon name={s.icon} />
          <span>{s.message}</span>
        </div>
        <div className="vdb">
          <button type="button" className={d.talk ? 'on' : ''} onClick={() => press(1)}>
            <InstIcon name="phone" size={20} />
            <span>{T.buttons.talk}</span>
          </button>
          <button type="button" className={d.gate ? 'on' : ''} onClick={() => press(2)}>
            <InstIcon name="lock" size={20} />
            <span>{T.buttons.gate}</span>
          </button>
          <button type="button" onClick={() => press(2)}>
            <InstIcon name="gate" size={20} />
            <span>{T.buttons.drive}</span>
          </button>
        </div>
        <div className="phcap">{T.caption}</div>
      </div>
    </div>
  )
}

/** „Masz w ścianie przewody od starego domofonu?” (`#domofony`): the answer picks the system. */
export function IntercomQuestion() {
  const T = alarmy.intercoms.question
  const [index, setIndex] = useState(INTERCOM_INITIAL)
  const answer = T.answers[index] ?? T.answers[0]!
  return (
    <div className="card dmq ri">
      <span className="svk">{T.kicker}</span>
      <b className="h3">{T.title}</b>
      <div className="seg">
        {T.answers.map((a, i) => (
          <button
            key={a.label}
            type="button"
            className={index === i ? 'on' : ''}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="labres" aria-live="polite">
        <InstIcon name="check" size={20} />
        <div>
          <b>{answer.result}</b>
          <span>{answer.text}</span>
        </div>
      </div>
      <span className="src">{T.note}</span>
    </div>
  )
}

/** „Nikogo nie ma od miesiąca” (`#dom-letniskowy`): a winter in the empty house on a slider. */
export function HolidayHouse() {
  const T = alarmy.holiday
  const [day, setDay] = useState(HOLIDAY_INITIAL)
  const v = holiday(day)
  const feed = v.feed.length
    ? v.feed
    : [{ icon: 'check', title: T.empty.title, sub: T.empty.sub, tone: 'ok' as const }]
  return (
    <div className="card dark ri dlw" data-surface="dark">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="eye dleye">{T.eyebrow}</span>
        <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
          {T.heading}
        </h2>
        <p className="lead">{T.lead}</p>
        <div className="cq">
          <span className="dlday">
            {T.day} {day} {T.sinceLeaving} · {v.date}
          </span>
          <input
            className="rng"
            type="range"
            min={HOLIDAY_MIN}
            max={HOLIDAY_MAX}
            step="1"
            value={day}
            onChange={(e) => setDay(Number(e.target.value) || HOLIDAY_INITIAL)}
            aria-label={T.sliderLabel}
          />
        </div>
        <div className="dlstat">
          <div className={v.inside.bad ? 'dls bad' : 'dls'}>
            <InstIcon name="thermo" />
            <span>{T.stats.inside}</span>
            <b>{v.inside.value}</b>
          </div>
          <div className="dls">
            <InstIcon name="snow" />
            <span>{T.stats.outside}</span>
            <b>{v.outside}</b>
          </div>
          <div className={v.leak ? 'dls bad' : 'dls'}>
            <InstIcon name="drop" />
            <span>{T.stats.water}</span>
            <b>{v.leak ? T.stats.leak : T.stats.dry}</b>
          </div>
        </div>
      </div>
      <div className="phone">
        <div className="phs" style={{ minHeight: 460 }}>
          <div className="phh">
            <span>{T.app}</span>
            <span>{v.clock}</span>
          </div>
          <div className="pht" style={{ fontSize: 18 }}>
            {T.house}
          </div>
          {feed.map((f, i) => (
            <div key={`${f.title}${i}`} className={`phn dlf ${f.tone}`}>
              <InstIcon name={f.icon} />
              <div>
                <b>{f.title}</b>
                <span>{f.sub}</span>
              </div>
            </div>
          ))}
          <div className="phcap">{T.caption}</div>
        </div>
      </div>
    </div>
  )
}
