import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { OSM_MAP } from '@/lib/shared/osmMap.generated'

type Props = {
  /** `light` on light surfaces, `dark` in the footer and dark bands (board Mapa). */
  variant?: 'light' | 'dark'
  /** Height in px: footer 118, contact hero 290, about 400, phone 100–112 (spec §5). */
  height: number
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

const ROAD = 'fill-none [stroke-linecap:round] [stroke-linejoin:round]'

/**
 * The address map of every line (spec §5 `AddressMap`, ADR-022 pkt 5): the OpenStreetMap drawing
 * made once by `scripts/software-osm-map.mjs` — no embedded map, no third-party script, no
 * cookies. The salon is in the middle (the drawing is centred on it, `slice` keeps it there at any
 * height), with two accent rings and the pin; the ODbL credit is always visible.
 */
export function AddressMap({
  variant = 'light',
  height,
  radius = 24,
  label,
  description,
  mapsUrl,
  routeLabel,
  className,
}: Props) {
  const { layers } = OSM_MAP
  const linked = Boolean(mapsUrl && !routeLabel)
  const drawing = (
    <svg
      role="img"
      aria-label={description}
      viewBox={`0 0 ${OSM_MAP.width} ${OSM_MAP.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <rect x={-400} y={-400} width={1600} height={1360} className="fill-(--am-land)" />
      <path d={layers.green} className="fill-(--am-park)" />
      <path d={layers.wood} className="fill-(--am-wood)" />
      <path d={layers.park} className="fill-(--am-parking)" />
      <path d={layers.water} className="fill-(--am-water)" />
      <path d={layers.ww} className={`${ROAD} stroke-(--am-water) [stroke-width:5]`} />
      <path
        d={layers.b}
        className="fill-(--am-block) stroke-(--am-block-line) [stroke-width:0.8]"
      />
      <path
        d={layers.r4}
        className={`${ROAD} stroke-(--am-path) [stroke-dasharray:3_3] [stroke-width:1.4]`}
      />
      <path d={layers.r3} className={`${ROAD} stroke-(--am-casing) [stroke-width:7]`} />
      <path d={layers.r2} className={`${ROAD} stroke-(--am-casing) [stroke-width:11]`} />
      <path d={layers.r1} className={`${ROAD} stroke-(--am-casing) [stroke-width:16]`} />
      <path d={layers.r3} className={`${ROAD} stroke-(--am-road) [stroke-width:4.5]`} />
      <path d={layers.r2} className={`${ROAD} stroke-(--am-road) [stroke-width:8]`} />
      <path d={layers.r1} className={`${ROAD} stroke-(--am-road-main) [stroke-width:12.5]`} />
      <path
        d={layers.rail}
        className="fill-none stroke-(--am-rail) [stroke-dasharray:10_6] [stroke-width:3]"
      />
      <path d={OSM_MAP.target} className="fill-(--am-accent)" />
      {OSM_MAP.labels
        .filter((item) => item.text === 'ul. Orkana')
        .map((item) => (
          <text
            key={item.text}
            transform={`translate(${item.x} ${item.y}) rotate(${item.angle})`}
            textAnchor="middle"
            dy={-6}
            className="fill-(--am-label) stroke-(--am-land) text-[12px] font-extrabold [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]"
          >
            {item.text}
          </text>
        ))}
    </svg>
  )

  return (
    <div
      className={cx('addr-map relative isolate overflow-hidden bg-(--am-land)', className)}
      data-variant={variant}
      style={{ height, borderRadius: radius }}
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
