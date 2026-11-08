'use client'

import Link from 'next/link'
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

import { labelKey } from '@/lib/analytics/events'
import { track } from '@/lib/analytics/track'
import type { SoftwareHome } from '@/lib/software/home'
import { Mockup } from '@/sites/software/components/mockups/Mockup'
import { Chip } from '@/sites/software/components/ui/Chip'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { usePausedOffscreen } from './usePausedOffscreen'
import { offerHref, type PriceLine } from '@/lib/software/priceCards'

type Bento = NonNullable<SoftwareHome['bento']>
type Props = { bento: Bento; prices: Record<string, PriceLine> }

const clampCut = (value: number) => Math.max(4, Math.min(96, Math.round(value)))

/** Chips of a card's variants; the chosen one pressed. */
function Variants({
  label,
  items,
  value,
  onChange,
  scroll = false,
}: {
  label: string
  items: { label: string }[]
  value: number
  onChange: (index: number) => void
  scroll?: boolean
}) {
  return (
    <div className={scroll ? 'v-chips v-chips-scroll' : 'v-chips'} role="group" aria-label={label}>
      {items.map((item, index) => (
        <Chip
          key={item.label}
          pressed={index === value}
          onClick={() => {
            onChange(index)
            track('oferta_wariant', { wariant: labelKey(item.label) })
          }}
        >
          {item.label}
        </Chip>
      ))}
    </div>
  )
}

/**
 * Bento „Cztery rzeczy. Zrobione najlepiej.” (ZMIANY-v24 §4.2, board `AU-pc` „oferta”): sites,
 * rebuild, systems and automations; the chips switch the mock-up and the „od” price live, the
 * rebuild card has a before/after slider (drag or arrow keys; it sweeps by itself until touched).
 */
export function BentoSection({ bento, prices }: Props) {
  const [site, setSite] = useState(0)
  const [system, setSystem] = useState(0)
  const [auto, setAuto] = useState(0)
  const [cut, setCut] = useState<number | null>(null)
  const drag = useRef(false)
  const section = usePausedOffscreen<HTMLElement>()

  const siteVariant = bento.sites.variants[site] ?? bento.sites.variants[0]
  const systemVariant = bento.systems.variants[system] ?? bento.systems.variants[0]
  const autoVariant = bento.automations.variants[auto] ?? bento.automations.variants[0]
  if (!siteVariant || !systemVariant || !autoVariant) return null
  const sitePrice = prices[siteVariant.solution]
  const rebuildPrice = prices[bento.rebuild.solution]

  const cutFrom = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    setCut(clampCut(((event.clientX - box.left) / box.width) * 100))
  }
  const onSliderKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, (value: number) => number> = {
      ArrowLeft: (value) => value - 5,
      ArrowRight: (value) => value + 5,
      Home: () => 4,
      End: () => 96,
    }
    const move = keys[event.key]
    if (!move) return
    event.preventDefault()
    setCut((value) => clampCut(move(value ?? 50)))
  }

  return (
    <section ref={section} id="oferta" className="v-sec">
      <div className="v-wrap">
        <div className="v-head-row">
          <SectionHead eyebrow={bento.eyebrow} title={bento.title} em={bento.em} />
          {bento.lead && <p className="v-lead">{bento.lead}</p>}
        </div>
        <div className="v-bento">
          <article className="sw-glass v-b1">
            <div className="v-scr v-b1-scr" aria-hidden="true">
              <div key={siteVariant.variant} className="v-swap">
                <Mockup kind="site" variant={siteVariant.variant} phone fit="contain" />
              </div>
            </div>
            <div className="v-tb">
              <div className="v-row">
                <h3>{bento.sites.title}</h3>
                <b className="v-price">{sitePrice?.price}</b>
              </div>
              <Variants
                label={bento.sites.title}
                items={bento.sites.variants}
                value={site}
                onChange={setSite}
                scroll
              />
              <div className="v-row v-note">
                <span>
                  {siteVariant.text} {sitePrice?.term}.
                </span>
                <Link className="v-link" href={offerHref(siteVariant.solution)}>
                  {bento.details} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>

          <article className="sw-glass v-b2">
            <div
              className="v-scr v-b2-scr v-drag"
              role="slider"
              tabIndex={0}
              aria-label={bento.dragHint.replace(/^⇆\s*/, '')}
              aria-valuemin={4}
              aria-valuemax={96}
              aria-valuenow={cut ?? 50}
              aria-valuetext={`Nowa strona: ${100 - (cut ?? 50)}%`}
              style={cut === null ? undefined : ({ '--mk-cut': `${cut}%` } as React.CSSProperties)}
              onPointerDown={(event) => {
                drag.current = true
                event.currentTarget.setPointerCapture(event.pointerId)
                cutFrom(event)
              }}
              onPointerMove={(event) => {
                if (drag.current) cutFrom(event)
              }}
              onPointerUp={() => {
                drag.current = false
              }}
              onPointerCancel={() => {
                drag.current = false
              }}
              onKeyDown={onSliderKey}
            >
              <Mockup kind="before" cut={cut === null ? undefined : 'parent'} fit="contain" />
            </div>
            <div className="v-tb">
              <div className="v-row">
                <h3>{bento.rebuild.title}</h3>
                <b className="v-price">{rebuildPrice?.price}</b>
              </div>
              <div className="v-row v-note">
                <span>{bento.dragHint}</span>
                <Link className="v-link" href={offerHref(bento.rebuild.solution)}>
                  {bento.details} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>

          <article className="sw-glass v-b3">
            <div className="v-scr v-b2-scr" aria-hidden="true">
              <div key={systemVariant.variant} className="v-swap">
                <Mockup kind="dash" variant={systemVariant.variant} fit="contain" />
              </div>
            </div>
            <div className="v-tb">
              <div className="v-row">
                <h3>{bento.systems.title}</h3>
                <b className="v-price">{prices[systemVariant.solution]?.price}</b>
              </div>
              <div className="v-row">
                <Variants
                  label={bento.systems.title}
                  items={bento.systems.variants}
                  value={system}
                  onChange={setSystem}
                />
                <Link className="v-link" href={offerHref(systemVariant.solution)}>
                  {bento.details} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>

          <article className="sw-glass sw-glass-featured v-b4">
            <div className="v-scr v-b4-scr" aria-hidden="true">
              <div key={autoVariant.variant} className="v-swap">
                <Mockup kind="flow" variant={autoVariant.variant} fit="contain" />
              </div>
            </div>
            <div className="v-tb">
              <p className="sw-eyebrow">{bento.automations.eyebrow}</p>
              <h3>{bento.automations.title}</h3>
              <p className="v-text">{bento.automations.text}</p>
              <Variants
                label={bento.automations.title}
                items={bento.automations.variants}
                value={auto}
                onChange={setAuto}
              />
              <Link className="v-link" href={offerHref(autoVariant.solution)}>
                {prices[autoVariant.solution]?.price} · {bento.automations.link}{' '}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
