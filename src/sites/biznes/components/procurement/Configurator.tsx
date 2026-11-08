'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'

import { devicesWord, kindsWord } from '@/lib/biznes/procurement/logic'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import { plural } from '@/lib/plural'

import { ProcIcon } from './icons'
import { ProcImage } from './parts'
import { useProcurement } from './ProcurementConfigurator'

type Labels = {
  typeLabel: string
  countLabel: string
  classLabel?: string
  servicesLabel?: string
  more?: string
  deliveryLabel: string
}

/** A number that runs to its new value (§3 „liczy się płynnie”); reduced motion jumps. */
function useTween(value: number): number {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = from.current
    from.current = value
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const began = performance.now()
    let frame = 0
    const step = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - began) / 450)
      setShown(Math.round(start + (value - start) * (1 - (1 - p) ** 3)))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return shown
}

function Segment({
  label,
  options,
  current,
  onPick,
}: {
  label: string
  options: string[]
  current: number
  onPick: (index: number) => void
}) {
  const id = useId()
  return (
    <div>
      <span className="zp-lbl" id={id}>
        {label}
      </span>
      <div className="zp-seg" role="group" aria-labelledby={id}>
        {options.map((option, i) => (
          <button
            key={`${i}-${option}`}
            type="button"
            aria-pressed={i === current}
            onClick={() => onPick(i)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * „Ułóż zestaw” (ZAOPATRZENIE §3): type, count, class (AGD), delivery, the items with their
 * packshots, „Coś jeszcze?”, the IT services, and the navy summary with „Wyślij do wyceny”.
 */
export function ConfiguratorPanel({
  labels,
  classHints,
  images,
}: {
  labels: Labels
  classHints: readonly string[]
  images: Record<number, IndexImage>
}) {
  const { state, dispatch, data, services, totals, message, sendToForm, notify } = useProcurement()
  const [copied, setCopied] = useState(false)
  const moreTimer = useRef(0)
  const countId = useId()
  const sumId = useId()
  const devices = useTween(totals.devices)
  const { type, chosen, kinds, deliveryText } = totals
  const unit = plural(state.count, data.unit)
  const hint = data.classes?.length ? classHints[state.cls]?.trim() : undefined
  const chosenServices = services.filter((_, i) => state.services.includes(i))

  const copy = () => {
    const done = navigator.clipboard?.writeText(message) ?? Promise.reject(new Error('clipboard'))
    done
      .then(() => {
        setCopied(true)
        notify('Lista skopiowana — wklej ją w mailu albo w formularzu')
        window.setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => notify('Przeglądarka nie pozwoliła skopiować — użyj „Wyślij do wyceny”'))
  }

  return (
    <div className="zp-conf">
      <div className="zp-conf-main zp-card">
        <div className="zp-ctrl">
          <Segment
            label={labels.typeLabel}
            options={data.types.map((item) => item.title)}
            current={state.type}
            onPick={(index) => dispatch({ type: 'type', index })}
          />
          <div>
            <span className="zp-lbl" id={countId}>
              {labels.countLabel}
            </span>
            <div className="zp-stepper" role="group" aria-labelledby={countId}>
              <button
                type="button"
                aria-label="Mniej"
                disabled={state.count <= 1}
                onClick={() => dispatch({ type: 'count', value: state.count - 1 })}
              >
                −
              </button>
              <output aria-live="polite">{state.count}</output>
              <button
                type="button"
                aria-label="Więcej"
                disabled={state.count >= 500}
                onClick={() => dispatch({ type: 'count', value: state.count + 1 })}
              >
                +
              </button>
            </div>
          </div>
          {data.classes && data.classes.length > 0 && labels.classLabel && (
            <Segment
              label={labels.classLabel}
              options={data.classes}
              current={state.cls}
              onPick={(index) => dispatch({ type: 'cls', index })}
            />
          )}
          <Segment
            label={labels.deliveryLabel}
            options={data.delivery.options.map((option) => option.label)}
            current={data.delivery.options.findIndex((option) => option.stages === state.stages)}
            onPick={(index) =>
              dispatch({ type: 'stages', value: data.delivery.options[index]!.stages })
            }
          />
        </div>
        {hint && (
          <p className="zp-clshint">
            Przykładowe marki w tej klasie: <b>{hint}</b>
          </p>
        )}
        <ul className="zp-items">
          {type.items.map((item, i) => {
            const on = !state.off.includes(i)
            return (
              <li key={`${state.type}-${i}`} style={{ '--i': i } as CSSProperties}>
                <button
                  type="button"
                  className="zp-itm"
                  aria-pressed={on}
                  onClick={() => dispatch({ type: 'item', index: i })}
                >
                  <span className="zp-tick" aria-hidden="true">
                    <ProcIcon name="check" />
                  </span>
                  <span className="zp-qty">× {item.qty * state.count}</span>
                  <span className="zp-itm-pic" aria-hidden="true">
                    {item.image && images[item.image] ? (
                      <ProcImage id={item.image} images={images} decorative />
                    ) : (
                      item.icon && <ProcIcon name={item.icon} />
                    )}
                  </span>
                  <b>{item.name}</b>
                  <small>{item.desc}</small>
                </button>
              </li>
            )
          })}
        </ul>
        {labels.more && (
          <label className="zp-more">
            <ProcIcon name="plus" />
            <span className="sr-only">Dodatkowe pozycje</span>
            <input
              placeholder={labels.more}
              maxLength={300}
              onChange={(event) => {
                const value = event.target.value
                window.clearTimeout(moreTimer.current)
                moreTimer.current = window.setTimeout(() => dispatch({ type: 'more', value }), 300)
              }}
            />
          </label>
        )}
        {services.length > 0 && (
          <>
            {labels.servicesLabel && (
              <span className="zp-lbl zp-svc-lbl">{labels.servicesLabel}</span>
            )}
            <div className="zp-svc">
              {services.map((service, i) => (
                <button
                  key={`${i}-${service.label}`}
                  type="button"
                  aria-pressed={state.services.includes(i)}
                  onClick={() => dispatch({ type: 'service', index: i })}
                >
                  <span className="zp-bx" aria-hidden="true">
                    <ProcIcon name="check" />
                  </span>
                  {service.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <aside className="zp-sum zp-card" aria-labelledby={sumId}>
        <h3 id={sumId}>
          {type.title} · {state.count} {unit}
        </h3>
        <div className="zp-sum-big">
          <div aria-hidden="true">
            <b>{devices}</b>
            <span>{devicesWord(totals.devices)}</span>
          </div>
          <div aria-hidden="true">
            <b>{kinds}</b>
            <span>{kindsWord(kinds)}</span>
          </div>
          <p className="sr-only" aria-live="polite">
            {totals.devices} {devicesWord(totals.devices)}, {kinds} {kindsWord(kinds)}
          </p>
        </div>
        <ul>
          {chosen.map((item, i) => (
            <li key={`${i}-${item.name}`}>
              <span>{item.name}</span>
              <b>× {item.total}</b>
            </li>
          ))}
          {state.more && (
            <li>
              <span>Dodatkowo</span>
              <b>{state.more}</b>
            </li>
          )}
          {data.classes?.length ? (
            <li>
              <span>Klasa sprzętu</span>
              <b>{data.classes[state.cls] ?? '—'}</b>
            </li>
          ) : (
            chosenServices.map((service, i) => (
              <li key={`${i}-${service.label}`}>
                <span>{service.label}</span>
                <b>✓</b>
              </li>
            ))
          )}
        </ul>
        <p className="zp-sum-dl">
          <span>Dostawa</span>
          <b>{deliveryText}</b>
        </p>
        <div className="zp-sum-row">
          <a href="#formularz" className="zp-btn zp-btn-white" onClick={sendToForm}>
            Wyślij do wyceny
            <ProcIcon name="arrow" />
          </a>
          <button type="button" className="zp-copy" aria-label="Kopiuj listę" onClick={copy}>
            <ProcIcon name="copy" />
            <span aria-hidden="true">{copied ? 'Skopiowano' : 'Kopiuj'}</span>
          </button>
        </div>
        <p className="zp-sum-note">
          Bez cen na stronie — wycena pod Twój termin. <a href="#steps">Zobacz harmonogram</a>
        </p>
      </aside>
    </div>
  )
}
