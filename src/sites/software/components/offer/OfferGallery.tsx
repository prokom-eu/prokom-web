'use client'

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { isVariantOf, type MockupKind } from '@/lib/software/mockups'
import type { SpotKey } from '@/lib/software/spots'
import type { IndexPreview } from '@/lib/software/solutionsIndex'
import { Mockup } from '@/sites/software/components/mockups/Mockup'

import { switchDevice } from './offerTransition'
import { OfferThumb } from './OfferThumb'

type Shot = { kind: MockupKind; variant: string | null; label: string }

const KIND_LABEL: Partial<Record<MockupKind, string>> = {
  site: 'Komputer',
  phone: 'Telefon',
  dash: 'Panel',
  flow: 'Automat',
  care: 'Opieka',
  before: 'Przed i po',
}

/** The shots of a solution: a page also on the phone; a panel or a flow is one picture. */
export function galleryShots(preview: IndexPreview): Shot[] {
  const first = { ...preview, label: KIND_LABEL[preview.kind] ?? '' }
  if (preview.kind === 'site' && isVariantOf('phone', preview.variant)) {
    return [first, { kind: 'phone', variant: preview.variant, label: KIND_LABEL.phone ?? '' }]
  }
  return [first]
}

/** A point of „W cenie” that has an area on the mock-up (`spots`), numbered ① ② ③ … */
export type SpotPoint = { number: number; label: string; spots: readonly SpotKey[] }

type Marker = { number: number; label: string; x: number; y: number }

const matches = (element: Element, spots: readonly SpotKey[]) => {
  const own = (element.getAttribute('data-spot') ?? '').split(' ')
  return spots.some((spot) => own.includes(spot))
}

/**
 * Mock-up gallery of the offer window (OKNO-OFERTY-PREMIUM §2.2): the big mock-up, the
 * „Komputer | Telefon” switch with a sliding pill, the numbered markers of the points of
 * „W cenie” on their areas (a hover or focus on a point lights its area and dims the others;
 * a click on a marker goes to the point), the sample toast that comes in once and leaves after
 * 5 s, a glow behind the frame that follows the cursor. Without a mock-up the old SVG stays (D5).
 */
export function OfferGallery({
  preview,
  thumbnail,
  toast,
  points = [],
  lit = null,
  onMarker,
}: {
  preview?: IndexPreview
  thumbnail?: string
  /** „Telefon ze strony · 3 min temu” — a sample, said so to screen readers. */
  toast?: string
  points?: readonly SpotPoint[]
  /** Areas lit by the point under the cursor or the focus. */
  lit?: readonly SpotKey[] | null
  onMarker?: (number: number) => void
}) {
  const [active, setActive] = useState(0)
  const [markers, setMarkers] = useState<Marker[]>([])
  const shotRef = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const shots = preview ? galleryShots(preview) : []
  const mobilePoint = points.find((point) => point.spots.includes('mobile'))
  const shot = shots[Math.min(active, shots.length - 1)] ?? shots[0]
  const shotKey = shot ? `${shot.kind}-${shot.variant ?? ''}` : ''
  const pointsKey = points.map((point) => `${point.number}:${point.spots.join('+')}`).join(' ')

  // Markers: one per point, on the first part of the mock-up that shows its area. Measured
  // again when the box changes size (the stage scales with it).
  useLayoutEffect(() => {
    const box = shotRef.current
    if (!box) return
    let frame = 0
    const place = () => {
      frame = 0
      const frameBox = box.getBoundingClientRect()
      // The window grows in from 96 % (and the mock-up from 98 %): positions are taken in the
      // box's own pixels, so a scale of the ancestors does not move the markers.
      const scale = frameBox.width / (box.offsetWidth || frameBox.width) || 1
      const parts = Array.from(box.querySelectorAll('[data-spot]'))
      const next: Marker[] = []
      for (const point of points) {
        // The biggest part of the area carries the marker (the widget, not a menu link).
        let part: Element | undefined
        let size = 0
        for (const element of parts) {
          if (!matches(element, point.spots)) continue
          const box = element.getBoundingClientRect()
          if (box.width * box.height > size) {
            size = box.width * box.height
            part = element
          }
        }
        if (!part) continue
        const rect = part.getBoundingClientRect()
        // The dot sits on the top-left corner; a small part of a scaled panel says where it has
        // room (`data-spot-at`, AUDYT-0911 noc #3): „end” — the top-right corner, „before” —
        // outside on the left at half height, „above” — outside over the middle. The dot's
        // centre is 8 px right/down of (x, y).
        const at = part.getAttribute('data-spot-at')
        const left =
          at === 'end' ? rect.right : at === 'above' ? rect.left + rect.width / 2 : rect.left
        const top = at === 'before' ? rect.top + rect.height / 2 : rect.top
        let x = Math.max(0, (left - frameBox.left) / scale - (at === 'before' ? 22 : 8))
        const y = Math.max(0, (top - frameBox.top) / scale - (at === 'above' ? 22 : 8))
        // Two points on the same part: the next marker stands beside the previous one.
        while (next.some((marker) => Math.abs(marker.x - x) < 24 && Math.abs(marker.y - y) < 24)) {
          x += 30
        }
        next.push({ number: point.number, label: point.label, x, y })
      }
      setMarkers(next)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place)
    }
    schedule()
    const sizes = new ResizeObserver(schedule)
    sizes.observe(box)
    // The mock-up's own entrance and a late font move its parts: measure again after them.
    box.addEventListener('animationend', schedule)
    void document.fonts.ready.then(schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      sizes.disconnect()
      box.removeEventListener('animationend', schedule)
    }
    // `points` is read through its key: a new array of the same points needs no new markers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotKey, pointsKey])

  // Lighting: the parts of the lit areas get `data-lit`, the box `data-spot-on` dims the rest.
  useEffect(() => {
    const box = shotRef.current
    const root = glow.current
    if (!box || !root) return
    const on = lit && lit.length > 0 ? lit : null
    box.toggleAttribute('data-spot-on', Boolean(on))
    // The root: the „Telefon” view of the switch is an area too.
    for (const part of Array.from(root.querySelectorAll('[data-spot]'))) {
      part.toggleAttribute('data-lit', Boolean(on && matches(part, on)))
    }
    for (const marker of Array.from(box.querySelectorAll<HTMLElement>('[data-marker]'))) {
      const point = points.find((item) => String(item.number) === marker.dataset.marker)
      marker.toggleAttribute(
        'data-lit',
        Boolean(on && point && point.spots.some((s) => on.includes(s))),
      )
    }
  })

  // The glow behind the frame follows the cursor ±6 px (none with reduced motion, CSS).
  useEffect(() => {
    const element = glow.current
    if (!element || !window.matchMedia('(pointer: fine)').matches) return
    let frame = 0
    let x = 0
    let y = 0
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      x = ((event.clientX - box.left) / box.width - 0.5) * 12
      y = ((event.clientY - box.top) / box.height - 0.5) * 12
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          element.style.setProperty('--glow-x', `${x.toFixed(1)}px`)
          element.style.setProperty('--glow-y', `${y.toFixed(1)}px`)
        })
      }
    }
    element.addEventListener('pointermove', move)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', move)
    }
  }, [])

  const toastNode = toast ? (
    <span
      role="img"
      aria-label={`Przykład powiadomienia: ${toast}`}
      className="sw-offer-toast bg-surface-dark text-white"
      // A new offer plays it again (key of the gallery), not a device switch.
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ok" />
      <span aria-hidden="true" className="truncate">
        {toast}
      </span>
    </span>
  ) : null

  if (!preview || !shot) {
    return (
      <div className="relative">
        <OfferThumb src={thumbnail} eager className="rounded-[22px]" />
        {toastNode}
      </div>
    )
  }

  return (
    <div ref={glow} className="sw-offer-glow">
      <div ref={shotRef} className="sw-offer-shot relative">
        <Mockup key={shot.kind} kind={shot.kind} variant={shot.variant} fit="contain" />
        {markers.map((marker) => (
          <button
            key={marker.number}
            type="button"
            data-marker={marker.number}
            onClick={() => onMarker?.(marker.number)}
            aria-label={`Pokaż w cenie: ${marker.label}`}
            className="sw-offer-marker"
            style={{ '--mx': `${marker.x}px`, '--my': `${marker.y}px` } as CSSProperties}
          >
            <span aria-hidden="true">{marker.number}</span>
          </button>
        ))}
        {toastNode}
      </div>
      {shots.length > 1 && (
        <div
          role="group"
          aria-label="Widok makiety"
          className="sw-segment sw-offer-devices mt-3"
          style={{ gridTemplateColumns: `repeat(${shots.length}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden="true"
            className="sw-segment-pill"
            style={{
              width: `calc((100% - 8px) / ${shots.length})`,
              translate: `${Math.min(active, shots.length - 1) * 100}% 0`,
            }}
          />
          {shots.map((item, i) => (
            <button
              key={item.kind}
              type="button"
              aria-pressed={i === active}
              onClick={() => switchDevice(() => flushSync(() => setActive(i)))}
              // „Wygodna na telefonie” lights the phone view (§2.2); its number stands here.
              data-spot={item.kind === 'phone' ? 'mobile' : undefined}
            >
              {item.label}
              {item.kind === 'phone' && mobilePoint && (
                <span aria-hidden="true" className="sw-offer-device-number">
                  {mobilePoint.number}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
