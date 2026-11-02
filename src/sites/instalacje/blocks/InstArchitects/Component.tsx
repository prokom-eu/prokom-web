import { headers } from 'next/headers'
import { connection } from 'next/server'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { getEnv } from '@/lib/env'
import { MediaImage } from '@/components/MediaImage'
import { issueFormToken } from '@/lib/inquiry/spam'
import {
  getInstalacjeCards,
  getInstalacjeHome,
  getInstalacjeSettings,
  getInstArchNews,
} from '@/lib/instalacje/data'
import type { ServiceKey } from '@/lib/instalacje/options'
import { serviceJsonLd } from '@/lib/instalacje/seo'
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { InstArchitectsBlock as InstArchitectsBlockData } from '@/payload-types'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { AnchorsBar } from '../../powloka/AnchorsBar'
import { ArchHouseScene } from '../../sekcje/arch/ArchHouseScene'
import { hotspotsHtml, INITIAL_ARCH_SCENE, safeHue } from '../../sekcje/arch/archScene'
import { ARCH_SCENE } from '../../sekcje/arch/scene'
import { InstSection } from '../../sekcje/InstSection'
import { LEGAL_NOTE } from '../../dane/prawo'
import { Faq } from '../../sekcje/Faq'
import { JsonLd } from '../../sekcje/JsonLd'
import { SectionHead } from '../../sekcje/SectionHead'
import { ArchitectForm } from '../../widzety/architekci/ArchitectForm'
import { AudienceTabs } from '../../widzety/architekci/AudienceTabs'
import { EmailForm } from '../../widzety/architekci/EmailForm'
import { DesignerChecklist } from '../../widzety/architekci/DesignerChecklist'
import { DeveloperTabs } from '../../widzety/architekci/DeveloperTabs'
import { type ArchService, InstallationsTabs } from '../../widzety/architekci/InstallationsTabs'
import { SolutionsExplorer } from '../../widzety/architekci/SolutionsExplorer'
import { StageTabs } from '../../widzety/architekci/StageTabs'

import { Count } from '../../sekcje/Count'

type Props = { block: InstArchitectsBlockData; tenantId: number }

const PATH = '/dla-architektow'

/**
 * The page for architects and developers `/dla-architektow` (ADR-I005, `Architekci.body.html`):
 * the hero from the panel with the house cross-section, anchors and the sections in the
 * prototype's order. No CTA band: the form is the last section (meta `cta: false`). The block
 * carries the page's h1.
 */
export async function InstArchitectsBlock({ block, tenantId }: Props) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const [cards, news, settings, site, home, host] = await Promise.all([
    getInstalacjeCards(tenantId),
    getInstArchNews(tenantId),
    getInstalacjeSettings(tenantId),
    getSiteSettings(tenantId),
    getInstalacjeHome(tenantId),
    headers().then((h) => h.get('host')),
  ])
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  const contact = settings.architects
  const phoneLabel = contact?.phone || site?.phone || null
  const phoneHref = phoneLabel ? toTelHref(phoneLabel) : null
  const phone = phoneLabel && phoneHref ? { label: phoneLabel, href: phoneHref } : null
  const mail = contact?.email || site?.email || null
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const hues: Partial<Record<ServiceKey, string>> = Object.fromEntries(
    cards.services.flatMap((s) => (s.key && s.color ? [[s.key, s.color]] : [])),
  )
  const services: ArchService[] = cards.services.flatMap((s) =>
    s.key
      ? [
          {
            key: s.key,
            name: s.name,
            caption: s.menuCaption ?? null,
            icon: s.icon ?? null,
            href: s.slug ? `/${s.slug}` : null,
            color: s.color ?? null,
          },
        ]
      : [],
  )
  const sceneHtml = ARCH_SCENE.html.replace('%hotspots%', hotspotsHtml(hues, INITIAL_ARCH_SCENE))
  const { hero } = block
  const crumb = hero?.crumb || 'Dla architektów'
  const fold = (id: string) =>
    A.fold[id] ? { fold: true, foldHeight: A.fold[id] } : { fold: false }

  return (
    // The prototype's page hue (`pkSt: --h` = the line's turquoise, Monitoring's colour):
    // section eyebrows and odd sections take it, like the service pages.
    <div className="inst-svc inst-ar" style={{ '--h': safeHue(hues.kam) } as CSSProperties}>
      {origin && (
        <>
          <JsonLd
            data={serviceJsonLd({
              origin,
              path: PATH,
              name: crumb,
              description: hero?.lead,
              serviceType: 'Projekt instalacji niskoprądowych dla architektów i deweloperów',
              audience: ['architekci', 'projektanci wnętrz', 'deweloperzy', 'generalni wykonawcy'],
            })}
          />
          {news.length > 0 && (
            <JsonLd
              data={itemListJsonLd({
                name: A.newsSection.eyebrow,
                items: news.map((n) => ({ name: n.title, url: origin + PATH + '#nowosci' })),
              })}
            />
          )}
          <JsonLd
            data={breadcrumbJsonLd([
              { name: 'Start', url: `${origin}/` },
              { name: crumb, url: `${origin}${PATH}` },
            ])}
          />
        </>
      )}

      <section id="hero" className="phero arhero">
        <div className="hgrid" />
        <div className="hglow" />
        <div className="hglow2" />
        <div className="wrap">
          <nav className="crumb in d1" aria-label="Okruszki">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{crumb}</span>
          </nav>
          <div className="arhead">
            {/* The audience stays above, outside the h1 (redakcja §1): a short h1 without it. */}
            <div className="in d2">
              {hero?.eyebrow && <p className="eye h1k">{hero.eyebrow}</p>}
              <h1 className="h1">
                {hero?.h1a || crumb} {hero?.h1b && <span className="acc">{hero.h1b}</span>}
              </h1>
            </div>
            <div className="arheadr in d3">
              {hero?.lead && <p className="lead">{hero.lead}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {A.hero.buttons.map((b) => (
                  <a key={b.href} href={b.href} className={b.primary ? 'btn btn-p' : 'btn btn-g'}>
                    {b.icon && <InstIcon name={b.icon} />}
                    {b.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="arstage in d4">
            <ArchHouseScene viewBox={ARCH_SCENE.viewBox} html={sceneHtml} hues={hues} />
          </div>
          {hero?.facts && hero.facts.length > 0 && (
            <div className="arkvs in d5">
              {hero.facts.map((fact) => (
                <div key={fact.id ?? fact.value} className="kv">
                  <b>
                    <Count text={fact.value} />
                  </b>
                  <span>{fact.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <AnchorsBar anchors={A.anchors.filter((a) => a.id !== 'nowosci' || news.length > 0)} />

      <InstSection id="dla-ciebie" style={{ padding: '88px 0 0' }}>
        <div className="wrap">
          <AudienceTabs />
        </div>
      </InstSection>

      <InstSection id="problemy" style={{ padding: '104px 0 96px' }} {...fold('problemy')}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.problemsSection.eyebrow}
            heading={A.problemsSection.heading}
            accent={A.problemsSection.accent}
            lead={A.problemsSection.lead}
            leadWidth={440}
          />
          <div className="g4 arpr">
            {A.problems.map((p) => (
              <div key={p.title} className="card arprc ri">
                <span className="ico">
                  <InstIcon name={p.icon} size={22} />
                </span>
                <b className="h3">{p.title}</b>
                <p className="arprd">{p.text}</p>
                <div className="arpra">
                  <em>{A.problemsSection.answer}</em>
                  <span>{p.answer}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="arbr ri">
            <div className="arbrl">
              <b>{A.problemsSection.bravasTitle}</b>
              <span>{A.problemsSection.bravasText}</span>
            </div>
            {A.bravas.map((b) => (
              <div key={b.value} className="arbri">
                <b>
                  <Count text={b.value} />
                </b>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="etapy" className="bnd bnd-tint" style={{ padding: '104px 0 104px' }}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.stagesSection.eyebrow}
            heading={A.stagesSection.heading}
            accent={A.stagesSection.accent}
            lead={A.stagesSection.lead}
            leadWidth={440}
          />
          <StageTabs />
        </div>
      </InstSection>

      <InstSection id="wymiana" style={{ padding: '104px 0 96px' }}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.exchangeSection.eyebrow}
            heading={A.exchangeSection.heading}
            accent={A.exchangeSection.accent}
            lead={A.exchangeSection.lead}
            leadWidth={420}
          />
          <div className="arwy ri">
            <div className="card arwyc">
              <span className="eye">{A.exchangeSection.fromYou}</span>
              {A.exchange.fromYou.map((x) => (
                <div key={x.title} className="arwyi">
                  <i />
                  <div>
                    <b>{x.title}</b>
                    <span>{x.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="arwya" aria-hidden="true">
              <InstIcon name="arrow" size={28} strokeWidth={2.2} />
            </div>
            <div className="arwyc hi">
              <span className="eye">{A.exchangeSection.fromUs}</span>
              {A.exchange.fromUs.map((x) => (
                <div key={x.title} className="arwyi">
                  <span className="arok">
                    <InstIcon name="check" size={14} strokeWidth={3} />
                  </span>
                  <div>
                    <b>{x.title}</b>
                    <span>{x.text}</span>
                  </div>
                </div>
              ))}
              <p className="arwyn">{A.exchangeSection.note}</p>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection
        id="checklista"
        className="bnd bnd-soft"
        style={{ padding: '104px 0 104px' }}
        {...fold('checklista')}
      >
        <div className="wrap">
          <SectionHead
            eyebrow={A.checklistSection.eyebrow}
            heading={A.checklistSection.heading}
            accent={A.checklistSection.accent}
            lead={A.checklistSection.lead}
            leadWidth={430}
          />
          <DesignerChecklist
            hues={hues}
            pdfForm={<EmailForm kind="checklist" formToken={formToken} />}
          />
        </div>
      </InstSection>

      <InstSection id="liczby" style={{ padding: '104px 0 96px' }} {...fold('liczby')}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.numbersSection.eyebrow}
            heading={A.numbersSection.heading}
            accent={A.numbersSection.accent}
            lead={A.numbersSection.lead}
            leadWidth={440}
          />
          <div className="arlz">
            {A.numbers.map((z) => (
              <div
                key={z.value + z.title}
                className="arlzc ri"
                style={{ '--hc': safeHue(hues[z.service]) } as CSSProperties}
              >
                <b>
                  <Count text={z.value} />
                </b>
                <span className="arlzt">{z.title}</span>
                <p>{z.text}</p>
              </div>
            ))}
          </div>
          <p className="src ri" style={{ marginTop: 16 }}>
            {A.numbersSection.note}
          </p>
        </div>
      </InstSection>

      <InstSection id="instalacje" style={{ padding: '104px 0 104px' }}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.installationsSection.eyebrow}
            heading={A.installationsSection.heading}
            accent={A.installationsSection.accent}
            lead={A.installationsSection.lead}
            leadWidth={440}
          />
          <InstallationsTabs services={services} />
        </div>
      </InstSection>

      {/* No published card (a fresh database, all withdrawn): no section and no anchor. */}
      {news.length > 0 && (
        <InstSection id="nowosci" className="bnd bnd-tint" style={{ padding: '104px 0 104px' }}>
          <div className="wrap">
            <SectionHead
              eyebrow={A.newsSection.eyebrow}
              heading={A.newsSection.heading}
              accent={A.newsSection.accent}
              lead={A.newsSection.lead}
            />
            <SolutionsExplorer
              cards={news}
              hues={hues}
              newsletterForm={<EmailForm kind="news" formToken={formToken} />}
            />
            <p className="src ri" style={{ marginTop: 14 }}>
              {A.newsSection.note}
            </p>
          </div>
        </InstSection>
      )}

      <InstSection id="deweloperzy" style={{ padding: '104px 0 104px' }}>
        <div className="wrap">
          <DeveloperTabs />
        </div>
      </InstSection>

      <InstSection id="przepisy" style={{ padding: '0 0 104px' }} {...fold('przepisy')}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.lawSection.eyebrow}
            heading={A.lawSection.heading}
            accent={A.lawSection.accent}
            lead={A.lawSection.lead}
            leadWidth={440}
          />
          <div className="artlw ri">
            <div className="artlline" />
            {A.timeline.map((t) => (
              <div key={t.date} className={t.now ? 'artl now' : 'artl'}>
                <i />
                <b>{t.date}</b>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
          <div className="arprz">
            {A.law.map((r) => (
              <div key={r.title} className="card arprc2 ri">
                <div className="arprh">
                  <span className={`arprst ${r.tone}`}>{r.status}</span>
                  <span className="arprd2">{r.date}</span>
                </div>
                <b className="h3" style={{ fontSize: 20 }}>
                  {r.title}
                </b>
                <p>{r.text}</p>
                <div className="arprp">
                  <em>{A.lawSection.inProject}</em>
                  <span>{r.inProject}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="src ri" style={{ marginTop: 16 }}>
            {LEGAL_NOTE} Stan na {A.lawAsOf}, aktualizujemy przy każdej zmianie.
          </p>
        </div>
      </InstSection>

      <InstSection
        id="doswiadczenie"
        style={{ padding: '104px 0 96px' }}
        {...fold('doswiadczenie')}
      >
        <div className="wrap">
          <SectionHead
            eyebrow={A.experienceSection.eyebrow}
            heading={A.experienceSection.heading}
            accent={A.experienceSection.accent}
            lead={A.experienceSection.lead}
            leadWidth={440}
          />
          <div className="arexkv ri">
            {A.experience.map((k) => (
              <div key={k.value}>
                <b>
                  <Count text={k.value} />
                </b>
                <span>{k.label}</span>
              </div>
            ))}
          </div>
          <div className="arexg">
            {/* Only realizations published with the client's consent (I2 hook). */}
            {home.realizations.length > 0 && (
              <div className="card arexr ri">
                <span className="eye">{A.experienceSection.realizations}</span>
                <div className="arexl">
                  {home.realizations.map((r) => (
                    <div key={r.id}>
                      <b>{r.title}</b>
                      <span>{[r.place, r.scope].filter(Boolean).join(' · ')}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/realizacje"
                  className="btn btn-g btn-s"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {A.experienceSection.realizationsAll}
                </Link>
              </div>
            )}
            <div className="card arexb ri">
              <span className="eye">{A.experienceSection.brands}</span>
              <div className="arexbr">
                {A.brands.map((b) => (
                  <span key={b}>{b}</span>
                ))}
              </div>
              <p className="mut" style={{ margin: 0, fontSize: 14.5 }}>
                {A.experienceSection.brandsNote}{' '}
                <a href="https://prokombiznes.pl" style={{ color: 'var(--accent-text)' }}>
                  prokombiznes.pl
                </a>
                . {A.experienceSection.brandsAuth}
              </p>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection
        id="biblioteka"
        className="bnd bnd-soft"
        style={{ padding: '104px 0 104px' }}
        {...fold('biblioteka')}
      >
        <div className="wrap">
          <SectionHead
            eyebrow={A.librarySection.eyebrow}
            heading={A.librarySection.heading}
            accent={A.librarySection.accent}
            lead={A.librarySection.lead}
            leadWidth={440}
          />
          <div className="g4 arlibo">
            {A.libraryOwn.map((o) => (
              <div key={o.title} className="card arlibc ri">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span className="ico">
                    <InstIcon name={o.icon} size={22} />
                  </span>
                  <span className="tag">{o.format}</span>
                </div>
                <b className="h3" style={{ fontSize: 19 }}>
                  {o.title}
                </b>
                <p>{o.text}</p>
                <span className="arlibs">{o.status}</span>
              </div>
            ))}
          </div>
          <div className="arlibe ri">
            <span className="arckh">{A.librarySection.tools}</span>
            <div className="arlibg">
              {A.libraryTools.map((e) => (
                <a
                  key={e.href}
                  href={e.href}
                  className="arlibx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <b>{e.title}</b>
                    <span>{e.text}</span>
                  </span>
                  <em>{e.kind} ↗</em>
                </a>
              ))}
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="pokaz" style={{ padding: '104px 0 96px' }}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{A.presentationsSection.eyebrow}</span>
              <h2 className="h2">
                {A.presentationsSection.heading}{' '}
                <span className="acc">{A.presentationsSection.accent}</span>
              </h2>
            </div>
            <a href="#wyslij" className="btn btn-p">
              {A.presentationsSection.cta}
            </a>
          </div>
          <div className="g3">
            {A.presentations.map((p) => (
              <div key={p.title} className="card arpk ri">
                <span className="ico">
                  <InstIcon name={p.icon} size={22} />
                </span>
                <b className="h3">{p.title}</b>
                <p>{p.text}</p>
                {p.tag && (
                  <span className="tag" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
                    {p.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="zasady" style={{ padding: '0 0 96px' }} {...fold('zasady')}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.rulesSection.eyebrow}
            heading={A.rulesSection.heading}
            accent={A.rulesSection.accent}
          />
          <div className="g3">
            {A.rules.map((z) => (
              <div key={z.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={z.icon} size={22} />
                </span>
                <b className="h3">{z.title}</b>
                <p>{z.text}</p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      {/* „Twój opiekun”: only with a name in the panel (no boss's markers on the page, spec §10). */}
      {contact && (
        <InstSection id="opiekun" style={{ padding: '0 0 104px' }}>
          <div className="wrap">
            <div className="arop ri" data-surface="dark">
              <div className="aropp">
                {contact.photo ? (
                  <MediaImage image={contact.photo} sizes="160px" className="aropi" />
                ) : (
                  <div className="aropa" aria-hidden="true">
                    <svg viewBox="0 0 120 120">
                      <circle cx="60" cy="46" r="22" />
                      <path d="M18 116c4-26 22-38 42-38s38 12 42 38" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="aropt">
                <span className="eye" style={{ color: 'var(--inst-dark-accent)' }}>
                  {A.contactSection.eyebrow}
                </span>
                <h2 className="h2" style={{ fontSize: 'clamp(28px, 2.8vw, 40px)' }}>
                  {contact.name}
                </h2>
                <span className="aropr">{contact.role || A.contactSection.role}</span>
                <p className="aropq">{contact.quote || A.contactSection.quote}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {phone && (
                    <a href={phone.href} className="btn hbtn-p">
                      <InstIcon name="phone" />
                      <span>{phone.label}</span>
                    </a>
                  )}
                  {mail && (
                    <a href={'mailto:' + mail} className="btn hbtn-g">
                      <InstIcon name="mail" />
                      {mail}
                    </a>
                  )}
                </div>
                <span className="aropn">{contact.responseText || A.contactSection.response}</span>
              </div>
            </div>
          </div>
        </InstSection>
      )}

      <Faq
        heading={A.faqSection.heading}
        eyebrow={A.faqSection.eyebrow}
        items={A.faq}
        aside={{
          title: A.faqSection.aside.title,
          text: A.faqSection.aside.text,
          button: A.faqSection.aside.cta,
          href: A.faqSection.aside.href,
        }}
        phone={phone}
        fold
      />

      <InstSection id="wyslij" className="bnd bnd-plan" style={{ padding: '104px 0 104px' }}>
        <div className="wrap">
          <div className="arfm ri">
            <div className="arfml">
              <span className="eye">{A.formSection.eyebrow}</span>
              <h2 className="h2">
                {A.formSection.heading} <span className="acc">{A.formSection.accent}</span>
              </h2>
              <p className="lead">{A.formSection.lead}</p>
              <div className="arsteps">
                {A.formSection.steps.map((s, i) => (
                  <div key={s}>
                    <em>{i + 1}</em>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card arfmr">
              <ArchitectForm formToken={formToken} phone={phone} email={mail} />
            </div>
          </div>
        </div>
      </InstSection>
    </div>
  )
}
