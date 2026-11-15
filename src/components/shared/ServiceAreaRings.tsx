import { Fragment } from 'react'

import { cx } from '@/components/ui/cx'
import {
  AREA_BOX,
  AREA_RINGS,
  AREA_SCALE,
  areaRings,
  placeLabels,
  type Box,
} from '@/lib/shared/areaRings'
import type { ServiceZone } from '@/lib/shared/zones'
import { toTelHref } from '@/lib/site/link'

import { AccentText } from './HeadingText'

type Props = {
  zones: readonly ServiceZone[]
  salon: { city: string; street: string; geo: { lat: number; lng: number } }
  /** The panel's „Dojazd — tytuł” / „Dojazd — wstęp”. */
  title: string
  lead?: string | null
  headingId: string
  /** The line's numbers for „Twojej miejscowości nie ma?”. */
  phones: readonly string[]
  headingEmClass?: string
  className?: string
}

/** The salon's card on the drawing: left of and above the centre, reserved for the labels. */
const CARD: Box = { x: 80, y: 150, width: 160, height: 92 }
const pct = (value: number, of: number) => `${(value / of) * 100}%`
const RING_FILL = [0.03, 0.05, 0.09]
const RING_STROKE = [0.2, 0.26, 0.4]

/**
 * Service area of the Kontakt page as rings (runda 1411, board Obszar): the salon in the middle,
 * rings of 15 / 35 / 55 km, the towns of `CompanyData.serviceZones` at their true place (known
 * coordinates, `townGeo`), labels placed without overlaps; beside it the towns grouped by ring and
 * the line's numbers. Drawn on the server — no motion but a soft pulse at the salon (none with
 * reduced motion). Phone: the drawing at full width with dots only, the lists under it.
 */
export function ServiceAreaRings({
  zones,
  salon,
  title,
  lead,
  headingId,
  phones,
  headingEmClass,
  className,
}: Props) {
  const rings = areaRings(zones, salon.geo, salon.city)
  if (rings.towns.length === 0 && rings.unplaced.length === 0) return null
  const marker: Box = { x: rings.center.x - 22, y: rings.center.y - 22, width: 44, height: 44 }
  const labels = placeLabels(rings.towns, [CARD, marker])
  const groups = AREA_RINGS.map((limit, i) => ({
    label: i === 0 ? `Do ${limit} km` : `${AREA_RINGS[i - 1]}–${limit} km`,
    towns: rings.towns.filter((t) => t.ring === i).map((t) => t.town),
  }))
  const farther = [
    ...rings.towns.filter((t) => t.ring === AREA_RINGS.length).map((t) => t.town),
    ...rings.unplaced,
  ]
  if (farther.length) groups.push({ label: 'Dalej', towns: farther })
  const calls = phones.flatMap((phone) => {
    const href = toTelHref(phone)
    return href ? [{ phone, href }] : []
  })
  const { width: W, height: H } = AREA_BOX
  const { x: cx0, y: cy0 } = rings.center
  const lineY = CARD.y + CARD.height / 2

  return (
    <div
      className={cx(
        // Phone and tablet: heading, drawing, towns, numbers. Wide: the text column on the left,
        // the drawing over its full height on the right.
        'relative isolate grid grid-cols-1 gap-x-9 gap-y-6 overflow-hidden rounded-[34px] bg-line-dark p-6 text-line-dark-text min-[768px]:p-10 min-[1200px]:grid-cols-[400px_minmax(0,1fr)] min-[1200px]:grid-rows-[auto_auto_1fr]',
        className,
      )}
      data-service-rings
    >
      <div className="flex flex-col gap-5 min-[1200px]:col-start-1 min-[1200px]:row-start-1 min-[1200px]:pt-3">
        <span className="flex items-center gap-2.5 text-xs font-extrabold tracking-[0.16em] text-on-dark-text uppercase">
          <span aria-hidden="true" className="h-0.5 w-[22px] bg-current" />
          Obszar działania
        </span>
        <h2
          id={headingId}
          className="font-display text-[clamp(30px,3vw,40px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-line-dark-ink"
        >
          <AccentText text={title} emClass={headingEmClass} />
        </h2>
        {lead && <p className="text-[15px] leading-relaxed">{lead}</p>}
      </div>
      <ul className="flex flex-col gap-3 min-[1200px]:col-start-1 min-[1200px]:row-start-2">
        {groups
          .filter((group) => group.towns.length > 0)
          .map((group, i) => (
            <li
              key={group.label}
              className="flex flex-col gap-2 rounded-[18px] border border-line-dark-rule bg-line-dark-card px-4 py-3.5"
              data-ring-group
            >
              <span className="flex justify-between gap-3 text-xs font-extrabold tracking-[0.08em] text-on-dark-text uppercase">
                <span>{group.label}</span>
                {i === 0 && (
                  <span className="font-bold tracking-normal text-line-dark-text normal-case">
                    w linii prostej
                  </span>
                )}
              </span>
              {/* Phone: two columns of towns; wider: one flowing line with commas. */}
              <span className="grid grid-cols-2 gap-x-3 text-[15px] leading-relaxed text-line-dark-ink min-[768px]:block">
                {group.towns.map((town, j) => (
                  <Fragment key={town}>
                    <span>{town}</span>
                    {j < group.towns.length - 1 && <span className="max-[767px]:hidden">, </span>}
                  </Fragment>
                ))}
              </span>
            </li>
          ))}
      </ul>
      {calls.length > 0 && (
        <p className="self-end text-sm font-extrabold min-[1200px]:col-start-1 min-[1200px]:row-start-3">
          Twojej miejscowości nie ma? Zadzwoń:{' '}
          {calls.map((call, i) => (
            <Fragment key={call.href}>
              {i > 0 && ' lub '}
              <a
                href={call.href}
                className="whitespace-nowrap text-line-dark-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text"
              >
                {call.phone}
              </a>
            </Fragment>
          ))}
        </p>
      )}

      <figure className="m-0 flex min-w-0 flex-col gap-2 max-[1199px]:row-start-2 min-[1200px]:col-start-2 min-[1200px]:row-span-3 min-[1200px]:row-start-1">
        <div
          className="@container relative mx-auto aspect-[19/16] w-full max-w-[760px]"
          role="img"
          aria-label={`Schemat: ${salon.city} w środku, miejscowości w odległości do ${AREA_RINGS.join(', ')} km`}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden="true">
            {[...AREA_RINGS].reverse().map((km, i) => (
              <circle
                key={km}
                cx={cx0}
                cy={cy0}
                r={km * AREA_SCALE}
                fill="var(--on-dark)"
                fillOpacity={RING_FILL[i]}
                stroke="var(--on-dark)"
                strokeOpacity={RING_STROKE[i]}
                strokeDasharray={i < 2 ? '3 6' : undefined}
              />
            ))}
            {rings.towns.map((t) => (
              <line
                key={t.town}
                x1={cx0}
                y1={cy0}
                x2={t.x}
                y2={t.y}
                stroke="var(--on-dark)"
                strokeOpacity="0.16"
              />
            ))}
            {AREA_RINGS.map((km) => {
              const d = (km * AREA_SCALE) / Math.SQRT2
              return (
                <text
                  key={km}
                  x={cx0 - d}
                  y={cy0 + d}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--on-dark)"
                  fillOpacity="0.8"
                  fontSize="11"
                  fontWeight="800"
                  className="hidden @[680px]:inline"
                >
                  {km} km
                </text>
              )
            })}
            {rings.towns.map((t) => (
              <circle
                key={t.town}
                cx={t.x}
                cy={t.y}
                r="4"
                fill="var(--on-dark)"
                stroke="var(--on-dark)"
                strokeOpacity="0.2"
                strokeWidth="6"
              />
            ))}
            <path
              d={`M${cx0 - 8} ${cy0 - 8} L${CARD.x + CARD.width + 60} ${lineY} L${CARD.x + CARD.width} ${lineY}`}
              fill="none"
              stroke="var(--on-dark)"
              strokeOpacity="0.7"
              strokeWidth="1.5"
              className="hidden @[680px]:inline"
            />
          </svg>
          {/* Labels in HTML (12 px at any size): only when the drawing has room for them. */}
          {labels.map((t) => (
            <span
              key={t.town}
              aria-hidden="true"
              className="absolute hidden h-[22px] items-center rounded-full border border-line-dark-rule bg-line-dark px-2 text-[12px] font-bold whitespace-nowrap text-line-dark-ink @[680px]:flex"
              style={{ left: pct(t.label.x, W), top: pct(t.label.y, H) }}
            >
              {t.town}
            </span>
          ))}
          <span
            aria-hidden="true"
            className="area-pulse absolute size-10 rounded-full bg-on-dark/40"
            style={{ left: pct(cx0, W), top: pct(cy0, H) }}
          />
          <span
            aria-hidden="true"
            className="absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-button shadow-[0_0_0_5px_var(--on-dark)]"
            style={{ left: pct(cx0, W), top: pct(cy0, H) }}
          />
          <span
            aria-hidden="true"
            className="absolute hidden flex-col gap-0.5 rounded-2xl bg-card px-4 py-3 whitespace-nowrap text-ink shadow-raised @[680px]:flex"
            style={{ left: pct(CARD.x, W), top: pct(CARD.y, H) }}
          >
            <span className="text-[11px] font-extrabold tracking-[0.14em] text-accent-text uppercase">
              Salon i serwis
            </span>
            <span className="font-display text-[17px] font-extrabold">{salon.city}</span>
            <span className="text-xs text-ink-2">{salon.street}</span>
          </span>
        </div>
        <figcaption className="text-right text-[12px] text-line-dark-text">
          Schemat wg współrzędnych miejscowości, odległości w linii prostej
        </figcaption>
      </figure>
    </div>
  )
}
