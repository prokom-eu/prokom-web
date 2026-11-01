import { headers } from 'next/headers'
import Link from 'next/link'

import { getEnv } from '@/lib/env'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import type { InstAboutBlock as InstAboutBlockData } from '@/payload-types'

import { oFirmie as T } from '../../dane/oFirmie'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { JsonLd } from '../../sekcje/JsonLd'
import { PageCtaBand } from '../../sekcje/PageCtaBand'

type Props = { block: InstAboutBlockData; tenantId: number }

/**
 * About the company `/o-firmie` (ADR-I002 §0, `OFirmie.body.html`): the hero with the map of the
 * salon, the lines of PRO-KOM, the principles, the company data from `CompanyData`, the CTA band.
 * Deviations from the prototype in `dane/oFirmie.ts`. The block carries the page's h1.
 */
export async function InstAboutBlock({ block, tenantId }: Props) {
  const [company, host] = await Promise.all([
    getCompanyData(),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const { hero } = block
  const crumb = hero?.crumb || 'O firmie'
  const locations = company?.locations ?? []
  const office = locations[0]

  return (
    <>
      {origin && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: 'Start', url: `${origin}/` },
            { name: crumb, url: `${origin}/o-firmie` },
          ])}
        />
      )}
      <section id="hero" className="phero">
        <div className="hgrid" />
        <div className="hglow" />
        <div className="wrap" style={{ position: 'relative' }}>
          <nav className="crumb in d1" aria-label="Okruszki">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" style={{ color: 'var(--ink)' }}>
              {crumb}
            </span>
          </nav>
          <div className="phw">
            <div className="pht2">
              {hero?.eyebrow && <span className="eye in d1">{hero.eyebrow}</span>}
              <h1 className="h1 in d2">
                {hero?.h1a}
                {hero?.h1b && (
                  <>
                    {' '}
                    <span className="acc">{hero.h1b}</span>
                  </>
                )}
              </h1>
              {hero?.lead && <p className="lead in d3">{hero.lead}</p>}
              {hero?.facts && hero.facts.length > 0 && (
                <div className="pkv in d4">
                  {hero.facts.map((k) => (
                    <div key={k.id ?? k.value} className="kv">
                      <b>{k.value}</b>
                      <span>{k.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="phv in d3">
              <div className="ofmap card">
                <svg viewBox="0 0 460 360" role="img" aria-label={T.map.label}>
                  <path
                    d="M0 300 L60 240 L120 270 L190 180 L260 250 L320 200 L390 260 L460 220 V360 H0 Z"
                    className="ofmt"
                  />
                  <path
                    d="M178 196 L190 180 L204 198 Z M310 214 L320 200 L332 216 Z"
                    style={{ fill: 'var(--inst-scene-snow)' }}
                  />
                  <path
                    d="M140 110 C160 160, 170 200, 200 250 S 230 300, 250 320"
                    className="ofroad"
                  />
                  <g>
                    <circle cx="140" cy="110" r="10" className="ofpin" />
                    <circle cx="140" cy="110" r="24" className="ofring" />
                    <text x="172" y="104" className="ofl">
                      {office?.city ?? 'Rabka-Zdrój'}
                    </text>
                    <text x="172" y="122" className="ofs">
                      {office?.street ? `salon · ${office.street}` : T.map.salon}
                    </text>
                  </g>
                  <g>
                    <circle cx="200" cy="232" r="5" className="ofdot" />
                    <text x="212" y="236" className="ofs">
                      Nowy Targ
                    </text>
                  </g>
                  {/* One salon (boss 01.11.2026): Zakopane is a town of the travel zone, like Nowy Targ. */}
                  <g>
                    <circle cx="250" cy="320" r="5" className="ofdot" />
                    <text x="262" y="324" className="ofs">
                      Zakopane
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InstSection id="linie" style={{ padding: '40px 0 104px' }}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{T.lines.eyebrow}</span>
              <h2 className="h2">{T.lines.heading}</h2>
            </div>
            <p className="lead" style={{ maxWidth: 460 }}>
              {T.lines.lead}
            </p>
          </div>
          <div className="g4">
            {T.lines.items.map((l) => (
              <Link
                key={l.title}
                href={l.href}
                className={'lnc ri' + ('current' in l && l.current ? ' cur' : '')}
                aria-current={'current' in l && l.current ? 'page' : undefined}
              >
                <span className="ico">
                  <InstIcon name={l.icon} size={22} />
                </span>
                <b className="h3">{l.title}</b>
                <p>{l.text}</p>
                <span style={{ color: 'var(--accent-text)', fontWeight: 800, marginTop: 'auto' }}>
                  {l.link}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="jak" style={{ padding: '0 0 104px' }}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{T.principles.eyebrow}</span>
              <h2 className="h2">{T.principles.heading}</h2>
            </div>
          </div>
          <div className="g3">
            {T.principles.items.map((v) => (
              <div key={v.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={v.icon} size={22} />
                </span>
                <b className="h3">{v.title}</b>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="dane" style={{ padding: '0 0 104px' }}>
        <div className="wrap">
          <div className="card ri ofdane">
            <div>
              <span className="eye">{T.data.company}</span>
              <p>
                {company?.name}
                {office && (
                  <>
                    <br />
                    {office.street}, {office.postalCode} {office.city}
                  </>
                )}
                {company?.nip && (
                  <>
                    <br />
                    {T.data.nip} {company.nip}
                  </>
                )}
              </p>
            </div>
            <div>
              <span className="eye">{T.data.salons}</span>
              <p>
                {locations.map((l, index) => (
                  <span key={`${l.city}-${index}`}>
                    {index > 0 && <br />}
                    {l.city}, {l.street}
                    {l.hours?.length ? (
                      <>
                        <br />
                        {hoursSummary(l.hours)}
                      </>
                    ) : null}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </InstSection>

      <PageCtaBand tenantId={tenantId} cta={block.cta} titleId="cta-about-title" />
    </>
  )
}
