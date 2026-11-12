'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { devicesWord, fillDelivery, offerRows, redactWidth } from '@/lib/biznes/procurement/logic'
import type { ProcurementPageData } from '@/lib/biznes/procurement/schema'
import { plural } from '@/lib/plural'

import { ProcIcon } from './icons'
import { useProcurement } from './ProcurementConfigurator'

type Offer = ProcurementPageData['offer']

const SERVICES_WORD: [string, string, string] = ['usługa', 'usługi', 'usług']
const AUTO_MS = 2600

/** Callout number on the sheet. */
function Dot({ n }: { n: number }) {
  return (
    <i className="zp-cdot" aria-hidden="true">
      {n}
    </i>
  )
}

function Redact({ row }: { row: number }) {
  return (
    <span className="zp-rd">
      <i className="zp-redact" style={{ width: redactWidth(row) }} aria-hidden="true" />
      <span className="sr-only">cena w ofercie</span>
    </span>
  )
}

/**
 * Offer preview (ZAOPATRZENIE §4): a white sheet (light in both themes) counted from the
 * configurator — the variant is the class (AGD), prices redacted. Callouts 1–4 light up the
 * matching area; they advance on their own while the sheet is in view and nobody touches them.
 */
export function OfferPreview({ offer, logo }: { offer: Offer; logo: ReactNode }) {
  const { state, dispatch, data, services, totals } = useProcurement()
  const [lit, setLit] = useState(1)
  const manual = useRef(false)
  const sheet = useRef<HTMLDivElement>(null)
  const agd = Boolean(data.classes?.length)
  const { rows, total, services: serviceRows } = offerRows(state, data, services)
  const variant = agd ? state.cls : state.variant
  const columns = offer.columns

  useEffect(() => {
    const node = sheet.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting)
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
    const timer = window.setInterval(() => {
      if (visible && !manual.current) setLit((n) => (n % 4) + 1)
    }, AUTO_MS)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [])

  const light = (n: number) => {
    manual.current = true
    setLit(n)
  }

  return (
    <div className="zp-offer">
      <div className="zp-paper-wrap">
        <div
          ref={sheet}
          className="zp-paper"
          data-it={agd ? undefined : ''}
          data-hl={lit}
          role="figure"
          aria-label="Przykład oferty dla zestawu"
        >
          <span className="zp-wm" aria-hidden="true">
            PRZYKŁAD
          </span>
          <div className="zp-ph">
            {logo}
            <div>
              <b>Oferta handlowa</b>
              {offer.example && (
                <span>
                  {offer.example.number} · {offer.example.validity}
                </span>
              )}
            </div>
          </div>
          <div className="zp-pmeta">
            <span>
              Dla: <b>Twoja firma · NIP</b>
            </span>
            <span>
              {totals.type.title} ×{' '}
              <b>
                {state.count} {plural(state.count, data.unit)}
              </b>
            </span>
          </div>
          <div className="zp-pvar" data-c="3" role="group" aria-label="Warianty oferty">
            {offer.variants.map((label, i) => (
              <button
                key={`${i}-${label}`}
                type="button"
                aria-pressed={i === variant}
                onClick={() =>
                  dispatch(agd ? { type: 'cls', index: i } : { type: 'variant', index: i })
                }
              >
                {label}
              </button>
            ))}
            <Dot n={3} />
          </div>
          <div className="zp-prow zp-prow-h" aria-hidden="true">
            <span className="zp-pn">{columns[0]}</span>
            <span className="zp-pp">
              {columns[1]}
              <Dot n={1} />
            </span>
            {agd && (
              <span className="zp-pc">
                {columns[2]}
                <Dot n={2} />
              </span>
            )}
            <span className="zp-q">{columns[agd ? 3 : 2]}</span>
            <span className="zp-rd">{columns[agd ? 4 : 3]}</span>
          </div>
          {rows.map((row, i) => (
            <div key={`${i}-${row.name}`} className="zp-prow">
              <span className="zp-pn">{row.name}</span>
              <span className="zp-pp" data-c="1">
                {row.params}
              </span>
              {agd && (
                <span className="zp-pc" data-c="2">
                  <span className="zp-ecl" data-e={row.energy}>
                    {row.energy}
                  </span>
                </span>
              )}
              <span className="zp-q">
                {row.qty}
                <span className="sr-only"> szt.</span>
              </span>
              <Redact row={i} />
            </div>
          ))}
          {serviceRows.map((row, i) => (
            <div key={`s${i}-${row.params}`} className="zp-prow zp-prow-svc" data-c="2">
              <span className="zp-pn">
                {row.name}
                {i === 0 && <Dot n={2} />}
              </span>
              <span className="zp-pp">{row.params}</span>
              <span className="zp-q">{row.qty}</span>
              <Redact row={rows.length + i} />
            </div>
          ))}
          <div className="zp-pfoot" data-c="4">
            {offer.footer.map((item, i) => (
              <span key={`${i}-${item.text}`}>{fillDelivery(item.text, totals.deliveryText)}</span>
            ))}
            <Dot n={4} />
          </div>
          <div className="zp-ptot">
            <span>
              Razem {total} {devicesWord(total)}
              {!agd && ` i ${serviceRows.length} ${plural(serviceRows.length, SERVICES_WORD)}`}
            </span>
            <b>Ceny w ofercie na piśmie</b>
          </div>
        </div>
      </div>
      <div>
        <ol className="zp-callouts" onMouseLeave={() => (manual.current = false)}>
          {offer.callouts.map((callout, i) => (
            <li key={`${i}-${callout.title}`}>
              <button
                type="button"
                aria-pressed={lit === i + 1}
                onMouseEnter={() => light(i + 1)}
                onFocus={() => light(i + 1)}
                onClick={() => light(i + 1)}
              >
                <span className="zp-cn" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <b>{callout.title}</b>
                  <span>{callout.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        {offer.note && (
          <p className="zp-note2">
            <ProcIcon name="lock" />
            <span>{offer.note}</span>
          </p>
        )}
      </div>
    </div>
  )
}
