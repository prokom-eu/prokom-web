import { Icon } from '@/components/ui/Icon'

import { OSM_MAP } from './osmMap.generated'

type Props = {
  /** „Wyznacz trasę”: Google Maps, opened only on click. */
  routeHref: string
  routeLabel: string
  zoomLabel: string
  /** Card in the corner: eyebrow and address. */
  pin: { eyebrow: string | null; street: string; city: string } | null
  /** Accessible name of the drawing. */
  label: string
}

const ROAD = 'fill-none [stroke-linecap:round] [stroke-linejoin:round]'

/**
 * Map of the contact page (v23, ZMIANY-v23 §6): a drawing from OpenStreetMap data made once by
 * `scripts/software-osm-map.mjs` — no embedded map, no third-party script, no cookies. Colours
 * are `--map-*` tokens; the building at Orkana 16B and the pin take the accent, the pin pulses
 * only without reduced motion. The OSM credit is always visible (ODbL).
 */
export function OsmMap({ routeHref, routeLabel, zoomLabel, pin, label }: Props) {
  const { layers } = OSM_MAP
  const [pinX, pinY] = OSM_MAP.pin
  return (
    <div
      data-reveal
      data-osm-map
      className="relative min-h-[340px] overflow-hidden rounded-[26px] bg-(--map-land) shadow-[inset_0_0_0_1px_var(--border)] min-[641px]:min-h-[520px] min-[641px]:rounded-[30px]"
    >
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${OSM_MAP.width} ${OSM_MAP.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <rect width={OSM_MAP.width} height={OSM_MAP.height} className="fill-(--map-land)" />
        <path d={layers.green} className="fill-(--map-park)" />
        <path d={layers.wood} className="fill-(--map-wood)" />
        <path d={layers.park} className="fill-(--map-parking)" />
        <path d={layers.water} className="fill-(--map-water)" />
        <path d={layers.ww} className={`${ROAD} stroke-(--map-water) [stroke-width:5]`} />
        <path
          d={layers.b}
          className="fill-(--map-block) stroke-(--map-block-line) [stroke-width:0.8]"
        />
        <path
          d={layers.r4}
          className={`${ROAD} stroke-(--map-path) [stroke-dasharray:3_3] [stroke-width:1.4]`}
        />
        <path d={layers.r3} className={`${ROAD} stroke-(--map-casing) [stroke-width:7]`} />
        <path d={layers.r2} className={`${ROAD} stroke-(--map-casing) [stroke-width:11]`} />
        <path d={layers.r1} className={`${ROAD} stroke-(--map-casing) [stroke-width:16]`} />
        <path d={layers.r3} className={`${ROAD} stroke-(--map-road) [stroke-width:4.5]`} />
        <path d={layers.r2} className={`${ROAD} stroke-(--map-road) [stroke-width:8]`} />
        <path d={layers.r1} className={`${ROAD} stroke-(--map-road-main) [stroke-width:12.5]`} />
        <path
          d={layers.rail}
          className="fill-none stroke-(--map-rail) [stroke-dasharray:10_6] [stroke-width:3]"
        />
        <path d={OSM_MAP.target} className="fill-accent stroke-card [stroke-width:2]" />
        {OSM_MAP.labels.map((item) => (
          <text
            key={item.text}
            transform={`translate(${item.x} ${item.y}) rotate(${item.angle})`}
            textAnchor="middle"
            dy={-6}
            className="fill-(--map-label) stroke-(--map-land) text-[12px] font-extrabold [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]"
          >
            {item.text}
          </text>
        ))}
        {OSM_MAP.station ? (
          <g>
            <g transform={`translate(${OSM_MAP.station.x} ${OSM_MAP.station.y})`}>
              <circle r={11} className="fill-card stroke-(--map-label) [stroke-width:1.5]" />
              <path
                d="M-5 -4h10v6h-10zM-4 4l-1.5 2.5M4 4l1.5 2.5M-5 -1h10"
                className="fill-none stroke-(--map-label) [stroke-linecap:round] [stroke-width:1.6]"
              />
            </g>
            <text
              x={OSM_MAP.station.x - 16}
              y={OSM_MAP.station.y + 32}
              textAnchor="end"
              className="fill-(--map-label) stroke-(--map-land) text-[12px] font-bold [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]"
            >
              {OSM_MAP.station.text}
            </text>
          </g>
        ) : null}
        <g transform={`translate(${pinX} ${pinY})`}>
          <circle
            r={16}
            className="origin-center fill-accent opacity-25 motion-safe:animate-[map-pulse_2.4s_ease-out_infinite] [transform-box:fill-box]"
          />
          <path
            d="M0 0c-9-11-14-17-14-24a14 14 0 0 1 28 0c0 7-5 13-14 24z"
            transform="translate(0 -6)"
            className="fill-accent stroke-white [stroke-width:2.5]"
          />
          <circle cy={-30} r={5.5} className="fill-white" />
        </g>
      </svg>

      {pin ? (
        <div className="absolute top-3.5 left-3.5 flex max-w-[calc(100%-28px)] flex-col gap-1 rounded-2xl bg-card px-4 py-3 shadow-raised">
          {pin.eyebrow ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent-text">
              <i aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              {pin.eyebrow}
            </span>
          ) : null}
          <b className="text-lg leading-tight">{pin.street}</b>
          <span className="text-[13px] text-ink-2">{pin.city}</span>
        </div>
      ) : null}
      {/* Buttons and the credit share the bottom row (the credit wraps under the buttons on a
          narrow phone), so the address card on top never covers the credit. */}
      <div className="absolute right-3.5 bottom-3.5 left-3.5 flex flex-wrap items-end gap-2">
        <a
          href={routeHref}
          data-route
          rel="noopener"
          target="_blank"
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-button px-5 font-extrabold text-accent-ink shadow-raised"
        >
          <Icon name="pin" className="size-4" />
          {routeLabel}
          <span className="sr-only"> (Mapy Google, nowe okno)</span>
        </a>
        <a
          href={OSM_MAP.osmHref}
          rel="noopener"
          target="_blank"
          className="inline-flex min-h-12 items-center rounded-2xl bg-card px-5 font-extrabold text-ink shadow-raised"
        >
          {zoomLabel}
          <span className="sr-only"> (OpenStreetMap, nowe okno)</span>
        </a>
        <span className="ml-auto rounded-full bg-card/85 px-2 py-0.5 text-[11px] text-ink-2">
          ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            rel="noopener"
            target="_blank"
            // At least 24 px high (WCAG 2.5.8, audyt 01.11 P2) in the small attribution pill.
            className="inline-flex min-h-6 items-center underline-offset-2 hover:underline"
          >
            autorzy OpenStreetMap
            <span className="sr-only"> (nowe okno)</span>
          </a>
        </span>
      </div>
    </div>
  )
}
