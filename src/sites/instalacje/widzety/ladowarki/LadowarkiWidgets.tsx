'use client'

import Image from 'next/image'
import { type CSSProperties, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { CHARGER_KEYS, type ChargerKey, ladowarki } from '../../dane/ladowarki'
import { InstIcon } from '../../InstIcon'
import { useInterval } from '../../sekcje/useInterval'
import {
  ANIM_MS,
  ANIM_STEPS,
  calcView,
  type CalcState,
  type ConfigState,
  configView,
  FLAKES,
  homeLimited,
  INITIAL_CALC,
  INITIAL_CONFIG,
  ON_BOARD,
  PATH_MS,
  pickPath,
  POWERS,
  RANGES,
  SHOWCASE_MS,
} from './ladowarkiModel'

const M = ladowarki.models

/*
 * Shared state of the page: the showcase in the hero (`sh`), the „Dobierz wersję” buttons of the
 * cards and the configurator (`cf`) — „Dobierz wersję” picks the model in both (`cfgTo` of the
 * prototype). A tiny store as on the Sieci page: the widgets sit in the hero slot and in the
 * sections.
 */
type EvStore = { sh: number; shTouched: boolean; cfg: ConfigState }
const SERVER: EvStore = { sh: 0, shTouched: false, cfg: INITIAL_CONFIG }
let store = SERVER
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
function setEv(next: (s: EvStore) => EvStore) {
  store = next(store)
  for (const l of listeners) l()
}
const useEv = () =>
  useSyncExternalStore(
    subscribe,
    () => store,
    () => SERVER,
  )
/** „Dobierz wersję”: this model in the showcase and in the configurator. */
const configure = (i: number) =>
  setEv((s) => ({ ...s, sh: i, shTouched: true, cfg: { ...s.cfg, cm: i } }))

function ChargerImage({ k, className }: { k: ChargerKey; className: string }) {
  const m = M[k]
  return (
    <Image
      src={m.image.src}
      width={m.image.width}
      height={m.image.height}
      alt={m.alt}
      className={className}
      // Small WebP files already (4–28 KB); the repo does not use Next's optimizer.
      unoptimized
    />
  )
}

const SH = ladowarki.showcase

/**
 * Elzab EcoPower showcase in the Ładowarki hero (`zrodlo/pages/Ladowarki.body.html` #pheroA):
 * the three models, their power and three parameters. Goes to the next model every 4.6 s until
 * the first touch (paused off screen, in a hidden tab and with reduced motion).
 */
export function ChargerShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const ev = useEv()
  // The store outlives client navigation: back to the start when the page is left.
  useEffect(() => () => setEv(() => SERVER), [])
  useInterval(() => setEv((s) => ({ ...s, sh: (s.sh + 1) % 3 })), SHOWCASE_MS, {
    enabled: !ev.shTouched,
    target: ref,
  })
  const key = CHARGER_KEYS[ev.sh]!
  const S = M[key]
  return (
    <div ref={ref} className="ill evsh" role="region" aria-label={SH.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={SH.tabsLabel}>
          {CHARGER_KEYS.map((k, i) => (
            <button
              key={k}
              type="button"
              className={ev.sh === i ? 'on' : ''}
              aria-pressed={ev.sh === i}
              onClick={() => setEv((s) => ({ ...s, sh: i, shTouched: true }))}
            >
              {M[k].name}
            </button>
          ))}
        </div>
        <span className="tag a">{S.kind}</span>
      </div>
      <div className="evstage">
        <div className="evglow" />
        {CHARGER_KEYS.map((k, i) => (
          <ChargerImage key={k} k={k} className={M[k].imageClass + (ev.sh === i ? ' on' : '')} />
        ))}
        <div className="evbadge">
          <b>{S.power}</b>
          <span>{S.powerSub}</span>
        </div>
      </div>
      <div className="evinfo" aria-live="polite">
        <div>
          <b className="h3">
            {SH.brand} {S.name}
          </b>
          <p className="mut" style={{ margin: '6px 0 0' }}>
            {S.text}
          </p>
        </div>
        <ul className="evspec">
          {S.specs.map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </li>
          ))}
        </ul>
        <a href="#model" className="btn btn-g evgo" onClick={() => configure(ev.sh)}>
          {SH.pick} {S.name}
          <InstIcon name="arrow" size={16} />
        </a>
      </div>
    </div>
  )
}

/** Model cards of `#oferta`: the picture and „Dobierz wersję” (to the configurator). */
export function ChargerCards() {
  return (
    <div className="g3 evcards">
      {CHARGER_KEYS.map((k, i) => {
        const p = M[k]
        return (
          <article key={k} className={'card evcard ri' + (i === 1 ? ' hot' : '')}>
            <div className="evtile">
              <ChargerImage k={k} className={p.imageClass} />
              <span className="evtk">{p.kind}</span>
            </div>
            <div className="evcb">
              <span className="svk">{p.who}</span>
              <b className="h3">
                {SH.brand} {p.name}
              </b>
              <p className="mut" style={{ margin: 0 }}>
                {p.text}
              </p>
              <div className="evpw">
                <b>{p.power}</b>
                <span>{p.powerSub}</span>
              </div>
              <ul className="list" style={{ gap: 8 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontSize: 14.5 }}>
                    <i>
                      <InstIcon name="check" size={13} strokeWidth={2.6} />
                    </i>
                    <span className="ev-soft">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="evchips">
                {p.variants.map((v) => (
                  <span key={v} className="tag">
                    {v}
                  </span>
                ))}
              </div>
              <a href="#model" className="btn btn-g evcbtn" onClick={() => configure(i)}>
                {ladowarki.offer.pick}
                <InstIcon name="arrow" size={16} />
              </a>
            </div>
          </article>
        )
      })}
    </div>
  )
}

const CF = ladowarki.config

/**
 * Version configurator (`#model`): model and its options, what the version needs from the
 * installation, „Zapytaj o tę wersję” with the configuration for the planner (ADR-I002 §4).
 */
export function ChargerConfigurator() {
  const { cfg } = useEv()
  const v = configView(cfg)
  const set = (patch: Partial<ConfigState>) => setEv((s) => ({ ...s, cfg: { ...s.cfg, ...patch } }))
  return (
    <div className="evcfg ri">
      <div className="evcv">
        <div className="evglow" />
        <ChargerImage k={v.key} className={`${M[v.key].imageClass} on`} />
        {v.colour && (
          <span className="evcol" style={{ '--sw': `var(${v.colour.token})` } as CSSProperties}>
            <i />
            {v.colour.name}
          </span>
        )}
      </div>
      <div className="evco">
        <div className="cq">
          <span>{CF.model}</span>
          <div className="seg" role="group" aria-label={CF.model}>
            {CHARGER_KEYS.map((k, i) => (
              <button
                key={k}
                type="button"
                className={cfg.cm === i ? 'on' : ''}
                aria-pressed={cfg.cm === i}
                onClick={() => set({ cm: i })}
              >
                {M[k].name}
              </button>
            ))}
          </div>
        </div>
        {v.options.map((o) => (
          <div key={o.key} className="cq">
            <span>{o.label}</span>
            <div className="seg" role="group" aria-label={o.label}>
              {o.choices.map((n, i) => (
                <button
                  key={n}
                  type="button"
                  className={cfg[o.key] === i ? 'on' : ''}
                  aria-pressed={cfg[o.key] === i}
                  onClick={() => set({ [o.key]: i })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
        {v.colour && (
          <div className="cq">
            <span>{CF.colour}</span>
            <div className="evsw" role="group" aria-label={CF.colour}>
              {CF.colours.map(([name, token], i) => (
                <button
                  key={name}
                  type="button"
                  className={cfg.wc === i ? 'evswb on' : 'evswb'}
                  style={{ '--sw': `var(${token})` } as CSSProperties}
                  aria-pressed={cfg.wc === i}
                  aria-label={name}
                  title={name}
                  onClick={() => set({ wc: i })}
                />
              ))}
            </div>
            <small className="evsm">{CF.colourNote}</small>
          </div>
        )}
      </div>
      <div className="evcr" aria-live="polite">
        <span className="svk">{CF.yours}</span>
        <b className="evcrn">{v.title}</b>
        <ul className="evspec">
          {v.out.map(([k, val]) => (
            <li key={k}>
              <span>{k}</span>
              <b>{val}</b>
            </li>
          ))}
        </ul>
        <div className="evinst">
          <InstIcon name="bolt" size={18} />
          <span>{v.install}</span>
        </div>
        <a className="btn btn-p" href={v.href}>
          {CF.ask}
        </a>
      </div>
    </div>
  )
}

const C = ladowarki.calc

/** A row of the calculator's choices (`.seg` with `aria-pressed`, as in the prototype). */
function Choice({
  items,
  value,
  onPick,
  disabled,
}: {
  items: readonly string[]
  value: number
  onPick: (i: number) => void
  disabled?: (i: number) => boolean
}) {
  return (
    <div className="seg">
      {items.map((n, i) => {
        const off = disabled?.(i) ?? false
        return (
          <button
            key={n}
            type="button"
            className={(value === i ? 'on' : '') + (off ? ' xc-dis' : '')}
            aria-pressed={value === i}
            disabled={off}
            title={off ? C.homeMax : undefined}
            onClick={() => onPick(i)}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Charging time calculator (`#kalkulator`): where you charge, battery, range, charger power and
 * what the car takes, with the winter scene. Goes through the three places every 5.2 s until
 * the first touch; the battery fills all the time (paused off screen and with reduced motion).
 */
export function ChargingCalc() {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CalcState>(INITIAL_CALC)
  const [touched, setTouched] = useState(false)
  const [anim, setAnim] = useState(0)
  useInterval(() => setAnim((a) => (a + 1) % ANIM_STEPS), ANIM_MS, { enabled: true, target: ref })
  useInterval(() => setState((s) => pickPath(s, (s.path + 1) % 3)), PATH_MS, {
    enabled: !touched,
    target: ref,
  })
  const touch = (next: (s: CalcState) => CalcState) => {
    setTouched(true)
    setState(next)
  }
  const v = calcView(state, anim)

  return (
    <div ref={ref} className="ill ri" role="region" aria-label={C.label}>
      <div className="illbar">
        <div className="seg" role="group" aria-label={C.pathsLabel}>
          {C.paths.map((p, i) => (
            <button
              key={p.key}
              type="button"
              className={state.path === i ? 'on' : ''}
              aria-pressed={state.path === i}
              onClick={() => touch((s) => pickPath(s, i))}
            >
              <InstIcon name={p.icon} size={15} />
              {p.name}
            </button>
          ))}
        </div>
        <span className="tag a">{v.device}</span>
      </div>
      <svg className="evs" viewBox="0 0 640 260" aria-hidden="true">
        <rect width="640" height="260" className="evsky" />
        <path
          d="M0 180 L80 120 L150 150 L240 96 L330 146 L420 110 L520 150 L640 116 V200 H0 Z"
          className="evmtn"
        />
        <path d="M226 102 L240 96 L252 104 Z M410 114 L420 110 L430 116 Z" className="evsnow" />
        <rect y="200" width="640" height="60" className="evgnd" />
        <rect x="40" y="40" width="150" height="160" className="evwall" />
        <rect x="88" y="86" width="56" height="78" rx="12" className="evbox" />
        <rect x="98" y="98" width="36" height="20" rx="4" className="evlcd" />
        <foreignObject x="98" y="102" width="36" height="14" className="fo">
          <div className="fot evkw2">{v.kw}</div>
        </foreignObject>
        <circle cx="116" cy="138" r="7" className="evled" />
        <path d="M116 164 C116 230, 330 236, 372 172" className="evcab" />
        <g className="evcar">
          <path
            d="M300 200 V170 Q302 150 330 146 L380 120 Q400 110 440 110 L500 112 Q530 116 556 146 L590 154 Q606 160 606 178 V200 Z"
            className="evbody"
          />
          <path
            d="M392 124 L440 116 L452 146 H372 Z M462 116 L500 118 Q520 122 538 146 H470 Z"
            className="evglass"
          />
          <circle cx="358" cy="202" r="22" className="evwh" />
          <circle cx="548" cy="202" r="22" className="evwh" />
          <circle cx="358" cy="202" r="9" className="evhub" />
          <circle cx="548" cy="202" r="9" className="evhub" />
          <rect x="364" y="164" width="14" height="12" rx="3" className="evport" />
        </g>
        <g transform="translate(400 54)">
          <rect width="190" height="44" rx="12" className="evbat" />
          <rect x="6" y="6" height="32" rx="8" className="evfill" style={{ width: v.fill }} />
          <rect x="190" y="14" width="7" height="16" rx="2" className="evbat" />
          <foreignObject x="0" y="11" width="190" height="22" className="fo">
            <div className="fot evpct2">{v.pct}%</div>
          </foreignObject>
        </g>
        {FLAKES.map((f, i) => (
          <circle
            key={i}
            cx={f.x}
            cy={f.y}
            r={f.r}
            className="evflake"
            style={{ animationDuration: f.duration, animationDelay: f.delay }}
          />
        ))}
      </svg>
      <div className="evcalc">
        <div className="cq">
          <span>
            {C.battery}: {state.bat} kWh
          </span>
          <input
            className="rng"
            type="range"
            min="30"
            max="110"
            step="5"
            value={state.bat}
            onChange={(e) => touch((s) => ({ ...s, bat: Number(e.target.value) || 60 }))}
            aria-label={C.batteryLabel}
          />
        </div>
        <div className="cq">
          <span>{C.range}</span>
          <Choice
            items={RANGES.map((r) => r[2])}
            value={state.rg}
            onPick={(i) => touch((s) => ({ ...s, rg: i }))}
          />
        </div>
        <div className="cq">
          <span>{C.power}</span>
          <Choice
            items={POWERS.map((p) => p[1])}
            value={v.pw}
            disabled={(i) => homeLimited(state, i)}
            onPick={(i) => touch((s) => ({ ...s, pw: i }))}
          />
        </div>
        <div className="cq">
          <span>{C.car}</span>
          <Choice
            items={ON_BOARD.map((p) => p[1])}
            value={state.obc}
            onPick={(i) => touch((s) => ({ ...s, obc: i }))}
          />
        </div>
      </div>
      <div className="evres" aria-live={touched ? 'polite' : 'off'}>
        <div>
          <span>{C.time}</span>
          <b>{v.time}</b>
        </div>
        <div>
          <span>{C.energy}</span>
          <b>{v.kwh} kWh</b>
        </div>
        <div>
          <span>{C.effective}</span>
          <b>{v.eff} kW</b>
        </div>
        <div>
          <span>{C.supply}</span>
          <b>{v.supply}</b>
        </div>
      </div>
      <div className="nvrnote ev-note">{v.note}</div>
    </div>
  )
}
