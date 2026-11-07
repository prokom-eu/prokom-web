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
  /** `before`: the slider stands at this percentage instead of sweeping. */
  cut?: number
  className?: string
}

const pick = <T extends string>(list: readonly T[], kind: MockupKind, variant?: string | null) =>
  (isVariantOf(kind, variant) ? variant : list[0]) as T

/**
 * A mock-up of what Software builds (ZMIANY-v24 §8): server component, no JavaScript, drawn on a
 * 640 × 420 stage and scaled to the box width. A picture only — the name and the description of the
 * solution stand next to it, so it is hidden from screen readers.
 */
export function Mockup({ kind, variant, phone, toast, cut, className }: Props) {
  return (
    <div className={className ? `mk ${className}` : 'mk'} aria-hidden="true" data-mockup={kind}>
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
