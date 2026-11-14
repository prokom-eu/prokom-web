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
  [60, 40],
  [54, 64],
  [40, 79],
  [72, 47],
  [79, 57],
  [46, 26],
  [44, 8],
  [24, 50],
]

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
 */
export function Coverage({ texts, company, now, checkHref }: Props) {
  const address = addressLine(company)
  const hours = hoursSummary(company.hours)
  const [centre, ...towns] = texts.towns

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
          <span className="pk-ring pk-ring--4" />
          <span className="pk-ring pk-ring--3" />
          <span className="pk-ring pk-ring--2" />
          <span className="pk-ring pk-ring--1" />
          <span className="pk-reach__centre">
            <span className="pk-ping" />
            <span className="pk-reach__centre-name">{centre}</span>
          </span>
          {towns.slice(0, PLACES.length).map((town, index) => {
            const [left, top] = PLACES[index] ?? [50, 50]
            return (
              <span
                key={town}
                className="pk-reach__town"
                style={{ '--x': `${left}%`, '--y': `${top}%` } as CSSProperties}
              >
                {town}
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
