import type { CSSProperties } from 'react'

import { OpeningStatus } from '@/components/shared/OpeningStatus'
import type { HubHome } from '@/lib/prokom/home'
import type { SharedCompany } from '@/lib/shared/project'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toDirectionsHref } from '@/lib/site/link'

import { HUB_CONTAINER } from '../container'
import { addressLine } from './model'

/**
 * Places of the towns on the schematic (board 01 `#zasieg`, in the panel's order): directions,
 * not a map to scale. Towns past these places stay in the image's description only.
 */
const PLACES: readonly [number, number][] = [
  [64, 37],
  [54, 64],
  [40, 79],
  [72, 47],
  [79, 57],
  [46, 26],
  [44, 8],
  [24, 50],
]

/** Contour lines of the terrain (decoration, the schematic's 0–100 box). */
const CONTOURS = [
  'M-2 22 C 14 12, 30 18, 44 14 S 78 6, 102 16',
  'M-2 34 C 12 28, 26 36, 40 30 S 72 22, 102 32',
  'M-2 64 C 16 58, 28 66, 42 60 S 76 54, 102 62',
  'M-2 74 C 10 70, 30 76, 46 70 S 80 66, 102 72',
  'M70 -2 C 76 14, 88 20, 102 22',
  'M-2 46 C 6 44, 12 52, 18 48',
]
/** The Tatras to the south (Zakopane): a soft silhouette along the bottom edge. */
const PEAKS =
  'M0 100 L0 90 L7 85 L12 88 L19 80 L25 86 L31 79 L37 84 L43 76 L49 83 L55 78 L62 86 L69 81 L76 88 L83 83 L90 89 L100 85 L100 100 Z'

type Props = {
  texts: HubHome['coverage']
  company: SharedCompany
  now: string
  /** `/gdzie-dzialamy`, or `null` while the page is off (v1.1 flag). */
  checkHref: string | null
}

/**
 * „Gdzie działamy” (spec §6.1 pkt 8, board 01 `#zasieg`): the reach in words, the salon card
 * (address, hours and live status from the panel, route in Google Maps — a link, no embedded
 * map) and a schematic of the directions around Rabka-Zdrój. The first town is the centre.
 * Premium pass 17.11 (Krystian: „ładniejsza, dopracowana i premium”): terrain lines, the Tatras,
 * routes with a running signal to pinned towns, a radar sweep — still a schematic, no distances.
 */
export function Coverage({ texts, company, now, checkHref }: Props) {
  const address = addressLine(company)
  const hours = hoursSummary(company.hours)
  const [centre, ...towns] = texts.towns
  const places = PLACES.slice(0, towns.length)

  return (
    <section
      id="zasieg"
      data-rail-section
      aria-labelledby="zasieg-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-reach">
        <div className="pk-reach__text">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="zasieg-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
          <p className="pk-lead pk-lead--big">{texts.lead}</p>
          {address && (
            <div className="pk-salon">
              <div className="pk-salon__top">
                <span className="pk-salon__name">
                  {texts.salon}
                  {company.address && ` · ${company.address.city}`}
                </span>
                <OpeningStatus hours={company.hours} holidays={company.holidays} now={now} />
              </div>
              <span className="pk-salon__where">
                {address}
                {hours && ` · ${hours}`}
              </span>
              <div className="pk-salon__cta">
                <a
                  href={toDirectionsHref(address)}
                  className="pk-hbtn pk-hbtn--accent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {texts.route} <span aria-hidden="true">↗</span>
                </a>
                {checkHref && (
                  <a href={checkHref} className="pk-hbtn">
                    {texts.check}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div
          role="img"
          aria-label={`${texts.mapLabel}: ${texts.towns.join(', ')}`}
          className="pk-reach__map"
        >
          {/* The art is decoration: contour lines, the Tatras to the south, a dot grid. */}
          <svg
            className="pk-reach__art"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="pk-reach-peaks" x1="0" y1="0" x2="0" y2="1">
                <stop className="pk-reach__peak-top" offset="0" />
                <stop className="pk-reach__peak-end" offset="1" />
              </linearGradient>
            </defs>
            {CONTOURS.map((d) => (
              <path key={d} className="pk-reach__contour" d={d} />
            ))}
            <path className="pk-reach__peaks" d={PEAKS} fill="url(#pk-reach-peaks)" />
            {places.map(([x, y], index) => (
              <g key={`${x}-${y}`} style={{ '--i': index } as CSSProperties}>
                <line className="pk-reach__route" x1="50" y1="50" x2={x} y2={y} />
                <line className="pk-reach__signal" x1="50" y1="50" x2={x} y2={y} />
              </g>
            ))}
          </svg>
          <span className="pk-ring pk-ring--4" />
          <span className="pk-ring pk-ring--3" />
          <span className="pk-ring pk-ring--2" />
          <span className="pk-ring pk-ring--1" />
          <span className="pk-reach__sweep" aria-hidden="true" />
          <span className="pk-reach__compass" aria-hidden="true">
            N
          </span>
          <span className="pk-reach__centre">
            <span className="pk-ping" />
            <span className="pk-reach__centre-name">{centre}</span>
          </span>
          {towns.slice(0, PLACES.length).map((town, index) => {
            const [left, top] = PLACES[index] ?? [50, 50]
            return (
              <span
                key={`${index}-${town}`}
                className="pk-reach__town"
                data-up={top > 70 ? '' : undefined}
                style={{ '--x': `${left}%`, '--y': `${top}%`, '--i': index } as CSSProperties}
              >
                <i className="pk-reach__pin" aria-hidden="true" />
                <b>{town}</b>
              </span>
            )
          })}
          <span className="pk-reach__note">{texts.mapNote}</span>
          <span className="pk-eb pk-reach__region">{texts.region}</span>
        </div>
      </div>
    </section>
  )
}
