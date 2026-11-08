'use client'

import { type ReactNode, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { isVariantOf, type MockupKind } from '@/lib/software/mockups'
import type { IndexPreview } from '@/lib/software/solutionsIndex'
import { Mockup } from '@/sites/software/components/mockups/Mockup'

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

/**
 * Mock-up gallery of the offer window (ZMIANY-v24 §6.1): the big mock-up and, for a page, the
 * small shots to switch to its phone version. Without a mock-up the old SVG thumbnail stays (D5).
 * Pictures only — the buttons say which view they show.
 */
export function OfferGallery({
  preview,
  thumbnail,
  overlay,
}: {
  preview?: IndexPreview
  thumbnail?: string
  /** Over the big picture (the „Nowe zapytanie” toast). */
  overlay?: ReactNode
}) {
  const [active, setActive] = useState(0)
  if (!preview) {
    return (
      <div className="relative">
        <OfferThumb src={thumbnail} eager className="rounded-[22px]" />
        {overlay}
      </div>
    )
  }
  const shots = galleryShots(preview)
  const shot = shots[Math.min(active, shots.length - 1)] ?? shots[0]!
  return (
    <div>
      <div className="sw-offer-shot relative">
        <Mockup key={shot.kind} kind={shot.kind} variant={shot.variant} fit="contain" />
        {overlay}
      </div>
      {shots.length > 1 && (
        <div className="mt-3 flex gap-2" role="group" aria-label="Widok makiety">
          {shots.map((item, i) => (
            <button
              key={item.kind}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={cx('sw-offer-thumb', i === active && 'is-on')}
            >
              <span className="sw-offer-thumb-pic">
                <Mockup kind={item.kind} variant={item.variant} fit="contain" />
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
