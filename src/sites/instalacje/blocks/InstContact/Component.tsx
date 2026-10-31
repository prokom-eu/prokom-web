import { headers } from 'next/headers'
import Link from 'next/link'
import { connection } from 'next/server'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getInstalacjeSettings } from '@/lib/instalacje/data'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { openingStatus } from '@/lib/site/hours'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import type { InstContactBlock as InstContactBlockData } from '@/payload-types'

import { kontakt as K } from '../../dane/kontakt'
import { navigation } from '../../dane/nawigacja'
import type { InstIconName } from '../../icons'
import { InstIcon } from '../../InstIcon'
import { CtaBandView } from '../../powloka/CtaBandView'
import { HoursLive } from '../../powloka/HoursLive'
import { JsonLd } from '../../sekcje/JsonLd'
import { ContactForm } from '../../widzety/kontakt/ContactForm'
import { ContactHero } from '../../widzety/kontakt/ContactHero'

import '../../widzety/kontakt/kontakt.css'

type Props = { block: InstContactBlockData; tenantId: number }

const mapsSearch = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

/**
 * The contact page `/kontakt` (ADR-I002 §0, `Kontakt.body.html`): hero with the contact cards,
 * the salons' hours and the map of the travel zones; the form `#napisz` with the salons beside
 * it; the CTA band from the panel. Phone and e-mail from `SiteSettings`, WhatsApp from
 * `InstalacjeSettings`, salons, hours and NIP from `CompanyData` — no external map script, the
 * route opens Google Maps in a new tab. The block carries the page's h1.
 */
export async function InstContactBlock({ block, tenantId }: Props) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const [site, settings, company, host] = await Promise.all([
    getSiteSettings(tenantId),
    getInstalacjeSettings(tenantId),
    getCompanyData(),
    headers().then((h) => h.get('host')),
  ])
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const waHref = settings.whatsapp ? toWhatsAppHref(settings.whatsapp) : null
  const locations = company?.locations ?? []
  const first = locations[0]
  const status = first?.hours?.length ? openingStatus(first.hours, new Date()) : null
  const { hero, cta } = block
  // One row per opening span, like the prototype: „Rabka-Zdrój, pn–pt” · „9:00–17:00”.
  const hourRows = locations.flatMap((l) =>
    (l.hours?.length ? hoursSummary(l.hours).split(' · ') : []).map((span) => {
      const [days = '', time = ''] = span.split(' ')
      return { label: `${l.city}, ${days}`, time }
    }),
  )
  if (!locations.some((l) => l.hours?.some((row) => row.days.includes('sun')))) {
    hourRows.push({ label: K.hours.sunday, time: K.hours.closed })
  }
  const C = K.cards

  type Card = { icon: InstIconName; title: string; text: string; value: string; href: string }
  const cards: Card[] = []
  if (phone) cards.push({ ...C.phone, value: phone.label, href: phone.href })
  if (waHref && settings.whatsapp) {
    cards.push({
      ...C.whatsapp,
      value: settings.whatsapp,
      href: `${waHref}?text=${encodeURIComponent(C.whatsapp.message)}`,
    })
  }
  if (site?.email) {
    cards.push({
      ...C.email,
      value: site.email,
      href: `mailto:${site.email}?subject=${encodeURIComponent(C.email.subject)}`,
    })
  }
  cards.push({ ...C.planner, value: '', href: C.planner.href })

  const band = {
    ...navigation.ctaBand,
    eyebrow: cta?.eyebrow || navigation.ctaBand.eyebrow,
    title: cta?.heading || navigation.ctaBand.title,
    text: cta?.text || navigation.ctaBand.text,
  }
  const salons = locations.map((l) => `${l.city}, ${l.street}`).join(' · ')

  return (
    <>
      {origin && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: 'Start', url: `${origin}/` },
            { name: hero?.crumb || 'Kontakt', url: `${origin}/kontakt` },
          ])}
        />
      )}
      <section id="hero" className="phero" style={{ paddingBottom: 60 }}>
        <div className="hgrid" />
        <div className="hglow" />
        <div className="wrap" style={{ position: 'relative' }}>
          <nav className="crumb in d1" aria-label="Okruszki">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" style={{ color: 'var(--ink)' }}>
              {hero?.crumb || 'Kontakt'}
            </span>
          </nav>
          <ContactHero
            intro={
              <>
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
              </>
            }
            details={
              <>
                <div className="ctc2 in d4">
                  {cards.map((card) => (
                    <a key={card.title} href={card.href} className="card ct">
                      <span className="ico s">
                        <InstIcon name={card.icon} />
                      </span>
                      <b>{card.title}</b>
                      <span>{card.text}</span>
                      {card.value && <span style={{ fontSize: 12.5 }}>{card.value}</span>}
                    </a>
                  ))}
                </div>
                {locations.length > 0 && (
                  <div
                    className="card in d5"
                    style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <b style={{ fontSize: 16 }}>{K.hours.title}</b>
                    {hourRows.map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          fontSize: 15,
                          borderBottom: '1px solid var(--border)',
                          paddingBottom: 8,
                        }}
                      >
                        <span className="mut">{row.label}</span>
                        <b style={{ textAlign: 'right' }}>{row.time}</b>
                      </div>
                    ))}
                    {first?.hours?.length && status ? (
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink-soft)' }}>
                        {first.city}: <HoursLive hours={first.hours} initial={status} />
                      </span>
                    ) : null}
                  </div>
                )}
              </>
            }
          />
        </div>
      </section>

      <section id="napisz" style={{ padding: '0 0 104px' }}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{K.form.eyebrow}</span>
              <h2 className="h2">{K.form.heading}</h2>
            </div>
            <Link href="/zaplanuj" className="btn btn-g">
              {K.form.planner}
            </Link>
          </div>
          <div className="zpw">
            <ContactForm formToken={formToken} />
            <div className="card zsum ri sticky">
              <span className="eye">{K.salons.eyebrow}</span>
              {locations.map((l) => {
                const address = `${l.street}, ${l.postalCode} ${l.city}`
                return (
                  <div
                    key={l.name}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      paddingBottom: 12,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <b style={{ fontSize: 17 }}>{l.city}</b>
                    <span className="mut">{address}</span>
                    <a
                      href={mapsSearch(`${company?.name ?? 'PRO-KOM'}, ${address}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-text)', fontWeight: 800, fontSize: 14 }}
                    >
                      {K.salons.route}
                    </a>
                  </div>
                )
              })}
              {company?.name && (
                <span className="mut" style={{ fontSize: 13.5 }}>
                  {company.name}
                  {company.nip ? ` · NIP ${company.nip}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      <CtaBandView band={band} phone={phone} salons={salons} titleId="cta-contact-title" page />
    </>
  )
}
