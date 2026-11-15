import {
  DASH_VARIANTS,
  FLOW_VARIANTS,
  isVariantOf,
  SITE_VARIANTS,
  type DashVariant,
  type FlowVariant,
  type MockupKind,
  type SiteVariant,
} from '@/lib/software/mockups'

import { MockBefore } from './Before'
import { MockCare, MockDash, MockFlow } from './Panels'
import { MockPhone, MockSite } from './Site'

type Props = {
  kind: MockupKind
  /** One of the kind's variants (`lib/software/mockups`); an unknown one falls back to the first. */
  variant?: string | null
  /** `site`: a small phone over the browser (hero of the start page). */
  phone?: boolean
  /** `site` with a phone, `phone`: the „Nowe zapytanie” toast. */
  toast?: boolean
  /**
   * `before`: the slider stands at this percentage instead of sweeping; `parent` — it follows the
   * `--mk-cut` of an outer element (the hand-held slider of the bento, SWA2b).
   */
  cut?: number | 'parent'
  /**
   * `width` (default): the box is 640 × 420 scaled to its width. `contain`: the box takes the size
   * its parent gives it and the stage fits inside, centred (frames of other shapes on the boards).
   */
  fit?: 'width' | 'contain'
  className?: string
}

const pick = <T extends string>(list: readonly T[], kind: MockupKind, variant?: string | null) =>
  (isVariantOf(kind, variant) ? variant : list[0]) as T

/**
 * A mock-up of what Software builds (ZMIANY-v24 §8): server component, no JavaScript, drawn on a
 * 640 × 420 stage and scaled to the box width. A picture only — the name and the description of the
 * solution stand next to it, so it is hidden from screen readers.
 */
export function Mockup({ kind, variant, phone, toast, cut, fit = 'width', className }: Props) {
  const classes = ['mk', fit === 'contain' && 'mk-contain', className].filter(Boolean).join(' ')
  return (
    <div className={classes} aria-hidden="true" data-mockup={kind}>
      <div className="mk-stage">
        {kind === 'site' && (
          <MockSite
            variant={pick<SiteVariant>(SITE_VARIANTS, kind, variant)}
            phone={phone}
            toast={toast}
          />
        )}
        {kind === 'phone' && (
          <MockPhone variant={pick<SiteVariant>(SITE_VARIANTS, kind, variant)} toast={toast} />
        )}
        {kind === 'dash' && <MockDash variant={pick<DashVariant>(DASH_VARIANTS, kind, variant)} />}
        {kind === 'flow' && <MockFlow variant={pick<FlowVariant>(FLOW_VARIANTS, kind, variant)} />}
        {kind === 'care' && <MockCare />}
        {kind === 'before' && <MockBefore cut={cut} />}
      </div>
    </div>
  )
}
