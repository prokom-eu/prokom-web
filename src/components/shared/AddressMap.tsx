import type { CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'

type Props = {
  /** `light` on light surfaces, `dark` in the footer and dark bands (board Mapa). */
  variant?: 'light' | 'dark'
  /** Height in px: footer 118, contact hero 290, about 400, phone 100–112 (spec §5). */
  height: number
  /** Height below 768 px when it differs (contact hero on a phone: 108, spec §7). */
  mobileHeight?: number
  radius?: number
  /** Card next to the pin („PRO-KOM” / „ul. Orkana 16B, Rabka-Zdrój”); none in the footer. */
  label?: { title: string; text: string } | null
  /** Accessible description of the drawing, e.g. „Mapa: PRO-KOM, ul. Orkana 16B, 34-700 Rabka-Zdrój”. */
  description: string
  /** „Wyznacz trasę”: `CompanyData.mapsUrl`, opened in a new tab only on click. */
  mapsUrl: string | null
  /** Text of the route button; without it the whole map is the link. */
  routeLabel?: string
  className?: string
}

/** The drawing as a static file (`scripts/address-map-svg.mjs`): cached between pages. */
export const ADDRESS_MAP_SRC = '/brand/mapa-orkana.svg'
/** Its coordinates (800 × 560), centred on the salon. */
const VIEW_BOX = '0 0 800 560'

/**
 * The address map of every line (spec §5 `AddressMap`, ADR-022 pkt 5): the OpenStreetMap drawing
 * made once by `scripts/software-osm-map.mjs` and written to a static file — no embedded map, no
 * third-party script, no cookies; `<use>` passes the variant’s `--am-*` colours into it. The salon
 * is in the middle (the drawing is centred on it, `slice` keeps it there at any height), with two
 * accent rings and the pin; the ODbL credit is always visible.
 */
export function AddressMap({
  variant = 'light',
  height,
  mobileHeight,
  radius = 24,
  label,
  description,
  mapsUrl,
  routeLabel,
  className,
}: Props) {
  const linked = Boolean(mapsUrl && !routeLabel)
  const drawing = (
    <svg
      role="img"
      aria-label={description}
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <use href={`${ADDRESS_MAP_SRC}#map`} />
    </svg>
  )

  return (
    <div
      className={cx(
        'addr-map relative isolate overflow-hidden bg-(--am-land)',
        mobileHeight !== undefined && 'h-(--am-h-sm) min-[768px]:h-(--am-h)',
        className,
      )}
      data-variant={variant}
      style={
        mobileHeight === undefined
          ? { height, borderRadius: radius }
          : ({
              '--am-h': `${height}px`,
              '--am-h-sm': `${mobileHeight}px`,
              borderRadius: radius,
            } as CSSProperties)
      }
      data-address-map
    >
      {linked ? (
        <a href={mapsUrl!} target="_blank" rel="noopener" className="addr-map__link">
          {drawing}
          <span className="sr-only">Wyznacz trasę (Mapy Google, nowe okno)</span>
        </a>
      ) : (
        drawing
      )}
      <span aria-hidden="true" className="addr-map__ring addr-map__ring--soft" />
      <span aria-hidden="true" className="addr-map__ring addr-map__ring--line" />
      <span aria-hidden="true" className="addr-map__pin">
        <span />
      </span>
      {label && (
        <span className="addr-map__card">
          <b>{label.title}</b>
          <span>{label.text}</span>
        </span>
      )}
      {mapsUrl && routeLabel && (
        <a href={mapsUrl} target="_blank" rel="noopener" className="addr-map__route" data-route>
          <Icon name="pin" className="size-4" />
          {routeLabel}
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> (Mapy Google, nowe okno)</span>
        </a>
      )}
      <span className="addr-map__credit">
        ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
          OpenStreetMap contributors
          <span className="sr-only"> (nowe okno)</span>
        </a>
      </span>
    </div>
  )
}
