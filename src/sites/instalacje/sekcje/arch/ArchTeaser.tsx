import Link from 'next/link'

import { getInstalacjeCards, getInstArchNews } from '@/lib/instalacje/data'
import type { ServiceKey } from '@/lib/instalacje/options'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../InstSection'
import { ArchHouseScene } from './ArchHouseScene'
import { hotspotsHtml, INITIAL_ARCH_SCENE } from './archScene'
import { ARCH_SCENE } from './scene'

import '../../widzety/architekci/architekci.css'

const T = A.teaser
const PAGE = '/dla-architektow'

/**
 * The home's `#architekci` after `#uslugi` (ADR-I005 §5, `Main.body.html`): the invitation for
 * architects, the house cross-section in its compact form (views in turn, no layer bar) and the
 * „Nowość” card — the featured published `InstArchNews` card, else the first; without cards no
 * card. Cards are read on every request (no cache), like on the page.
 */
export async function ArchTeaser({ tenantId }: { tenantId: number }) {
  const [cards, news] = await Promise.all([getInstalacjeCards(tenantId), getInstArchNews(tenantId)])
  const hues: Partial<Record<ServiceKey, string>> = Object.fromEntries(
    cards.services.flatMap((s) => (s.key && s.color ? [[s.key, s.color]] : [])),
  )
  const card = news.find((n) => n.featured) ?? news[0]
  const html = ARCH_SCENE.html.replace('%hotspots%', hotspotsHtml(hues, INITIAL_ARCH_SCENE))

  return (
    <InstSection id="architekci" className="xa-s" style={{ padding: '0 0 100px' }}>
      <div className="wrap">
        <div className="arhm ri">
          <div className="arhmt">
            <span className="eye">{T.eyebrow}</span>
            <h2 className="h2">
              {T.heading} <span className="acc">{T.accent}</span>
            </h2>
            <p className="lead">{T.lead}</p>
            <div className="arhml">
              {T.points.map((x) => (
                <div key={x.title}>
                  <span className="arok">
                    <InstIcon name={x.icon} size={14} strokeWidth={2.4} />
                  </span>
                  <span>
                    <b>{x.title}</b>
                    <span>{x.text}</span>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link href={PAGE} className="btn btn-p">
                {T.more}
              </Link>
              <Link href={`${PAGE}#wyslij`} className="btn btn-g">
                <InstIcon name="upload" />
                {T.send}
              </Link>
            </div>
          </div>
          <div className="arhmv">
            <ArchHouseScene viewBox={ARCH_SCENE.viewBox} html={html} hues={hues} compact />
            {card && (
              <Link href={`${PAGE}#nowosci`} className="arhmn">
                <span className="arty">{T.news}</span>
                <span>{card.title}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </InstSection>
  )
}
