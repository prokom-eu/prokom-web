import Link from 'next/link'

import { getInstalacjeRealizations } from '@/lib/instalacje/data'
import { leadPhoto, matchRealization } from '@/lib/instalacje/realizations'

import { naglosnienie } from '../../dane/naglosnienie'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSectionLazy'
import { SectionHead } from '../../sekcje/SectionHead'
import { RealizationPhotos } from '../realizacje/RealizationPhotosLazy'
import { ApartFamilies, ChurchDemo, SignalChain, SpeakerCalc } from './NaglosnienieWidgetsLazy'

const SECTION = { padding: '0 0 104px' }

/**
 * The Nagłośnienie sections between the hero and the shared ones
 * (`zrodlo/pages/Naglosnienie.body.html`): venues, APART, the zone system, the church, the speaker
 * calculator, council rooms, DSO and „Realizacje nagłośnienia” (the clients
 * agreed, boss 01.11.2026). Folded on a phone as in `zrodlo/fold.json` (`cena` and `faq` by the
 * shared sections).
 */
export async function NaglosnienieSections({ tenantId }: { tenantId: number }) {
  // Round v5 (RUNDA-V5 §4): the realizations named here show their photos from pro-kom.eu.
  const withPhotos = (await getInstalacjeRealizations(tenantId)).filter((r) => r.photos.length > 0)
  const { objects, apart, chain, church, council, dso, realizations } = naglosnienie
  return (
    <>
      <InstSection id="obiekty" fold foldHeight={900} style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...objects.head} />
          <p className="src ri" style={{ margin: '-24px 0 22px' }}>
            {objects.brands}
          </p>
          <div className="g3">
            {objects.items.map((o) => (
              <div key={o.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={o.icon} size={22} />
                </span>
                <b className="h3">{o.title}</b>
                <p>{o.text}</p>
                <div className="tags">
                  {o.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="apart" style={SECTION}>
        <div className="wrap">
          <SectionHead {...apart.head} />
          <ApartFamilies />
          <p className="src ri" style={{ marginTop: 12 }}>
            {apart.note}
          </p>
          <div className="apy ri">
            {apart.why.map((x) => (
              <div key={x.title} className="apyc">
                <span className="ico">
                  <InstIcon name={x.icon} size={22} />
                </span>
                <b>{x.title}</b>
                <p>{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="jak-dziala" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...chain.head} />
          <SignalChain />
        </div>
      </InstSection>

      <InstSection id="kosciol" fold style={SECTION}>
        <div className="wrap split" style={{ alignItems: 'center' }}>
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eye">{church.eyebrow}</span>
            <h2 className="h2">{church.heading}</h2>
            <p className="lead">{church.lead}</p>
            <ul className="list">
              {church.points.map((p) => (
                <li key={p.title}>
                  <i>
                    <InstIcon name="check" size={14} strokeWidth={2.6} />
                  </i>
                  <div>
                    <b>{p.title}</b>
                    <span>{p.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ChurchDemo />
        </div>
      </InstSection>

      <InstSection id="ile-glosnikow" style={SECTION}>
        <div className="wrap">
          <SpeakerCalc />
        </div>
      </InstSection>

      <InstSection id="sala-obrad" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...council.head} />
          <div className="g4">
            {council.items.map((x) => (
              <div key={x.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={x.icon} size={22} />
                </span>
                <b className="h3">{x.title}</b>
                <p>{x.text}</p>
                {'source' in x && <span className="src">{x.source}</span>}
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="dso" fold style={SECTION}>
        <div className="wrap">
          <div className="card dark ri tlaw" data-surface="dark">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eye tlaweye">{dso.eyebrow}</span>
              <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                {dso.heading}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p className="lead">{dso.lead}</p>
              <span className="snd-dso-tx">{dso.partner}</span>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="realizacje-n" fold style={SECTION}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{realizations.eyebrow}</span>
              <h2 className="h2">{realizations.heading}</h2>
            </div>
            <Link href={realizations.all.href} className="btn btn-g">
              {realizations.all.label}
            </Link>
          </div>
          <div className="g3">
            {realizations.items.map((r) => {
              const match = matchRealization(r.name, withPhotos)
              const photos = match && leadPhoto(r.place, match.photos)
              return (
                <div key={r.name} className="card rl ri">
                  {photos ? (
                    <div className="rlimg rlimgp">
                      <RealizationPhotos
                        photos={photos}
                        title={r.name}
                        sizes="(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="rlimg" aria-hidden="true">
                      <svg viewBox="0 0 300 190">
                        <rect width="300" height="190" style={{ fill: 'var(--surface-3)' }} />
                        <path
                          d={realizations.art[r.art]}
                          transform="translate(75 30) scale(.62)"
                          style={{
                            fill: 'none',
                            stroke: 'var(--accent-text)',
                            strokeWidth: 5,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                          }}
                        />
                      </svg>
                    </div>
                  )}
                  <div className="rlb">
                    <span className="tag a" style={{ alignSelf: 'flex-start' }}>
                      {r.kind}
                    </span>
                    <b className="h3">{r.name}</b>
                    <span>{r.place}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </InstSection>
    </>
  )
}
