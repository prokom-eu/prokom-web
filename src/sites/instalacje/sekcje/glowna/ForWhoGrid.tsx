import Link from 'next/link'

import type { MenuEntry } from '@/lib/instalacje/menu'

import { FOR_WHO_CARDS, glownaSekcje } from '../../dane/glownaSekcje'
import type { ObjectKey } from '../../dane/types'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../InstSection'
import { SectionHead } from '../SectionHead'
import { LiveButton } from './LiveButton'
import { ShowAll } from './ShowAll'
import { Arrow } from '../../Arrow'

const t = glownaSekcje.forWho

/**
 * „Dla kogo” (`#dla-kogo`, KOMPONENTY §3): 12 object cards — name, icon and address from the
 * panel by key, the texts and sets of the home page from `dane/glownaSekcje.ts`. A card whose
 * object is not published is left out. On a phone the first 6 show, the rest behind a button.
 */
export function ForWhoGrid({ objects }: { objects: Map<ObjectKey, MenuEntry> }) {
  const cards = FOR_WHO_CARDS.flatMap((card) => {
    const object = objects.get(card.key)
    return object ? [{ ...card, object }] : []
  })
  if (cards.length === 0) return null
  return (
    <InstSection id="dla-kogo" className="xa-s" style={{ padding: '96px 0' }}>
      <div className="wrap">
        <SectionHead
          eyebrow={t.eyebrow}
          heading={t.heading}
          accent={t.accent}
          lead={t.lead}
          leadWidth={440}
        />
        <ShowAll className="obg" more={t.showAll} less={t.collapse}>
          {cards.map(({ key, object, description, set, hue, big, live }) => (
            <div key={key} className={`obc ri oh${hue}${big ? ' big' : ''}`}>
              <div className="oba" aria-hidden="true">
                <span className="obi">
                  <InstIcon name={object.icon ?? 'home'} size={26} />
                </span>
                <svg viewBox="0 0 200 90" preserveAspectRatio="xMaxYMax meet" className="obm">
                  <path d="M0 90 L0 60 L40 34 L70 50 L110 18 L140 40 L170 26 L200 44 L200 90 Z" />
                </svg>
              </div>
              <b className="obt">{object.label}</b>
              <span className="obd">{description}</span>
              <div className="obs">
                {set.map((item) => (
                  <em key={item}>{item}</em>
                ))}
              </div>
              <div className="obf">
                {live && <LiveButton object={live} label={t.live} />}
                <Link href={object.href} className="obl2">
                  {t.more} <Arrow />
                </Link>
              </div>
            </div>
          ))}
        </ShowAll>
        <p className="ri" style={{ margin: '22px 0 0', color: 'var(--ink-2)', fontSize: 15 }}>
          {t.missing}{' '}
          <Link href="/zaplanuj" style={{ color: 'var(--accent-text)', fontWeight: 800 }}>
            {t.missingLink}
          </Link>
        </p>
      </div>
    </InstSection>
  )
}
