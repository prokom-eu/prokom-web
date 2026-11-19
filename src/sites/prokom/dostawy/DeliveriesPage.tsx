import Link from 'next/link'

import { getHubSettings } from '@/lib/prokom/data'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'
import { HeroArt } from '../subpages/HeroArt'
import { lineStyle } from '../lineColors'
import { Faq } from '../home/Faq'
import { faqTokens } from '../home/model'
import { NextSteps } from '../linie/OfferSections'
import {
  FormListSummary,
  ListBar,
  ObjectsSection,
  RequestListSection,
  ScopeSection,
  SegmentPicker,
} from './DeliveriesClient'
import { DeliveriesState } from './DeliveriesState'
import { DeliveriesFormPart } from '../form/FormParts'
import { HubForm } from '../form/HubForm'

/** The Biznes subpages for the details of an area (spec §6.5 „Związek z Biznesem”). */
const BIZNES_DETAILS: Record<string, string> = {
  biznes: '/dostawy-it-dla-firm',
  prokom: '/agd-rtv-dla-firm',
}

/**
 * `/inwestycje-i-dostawy` (spec §6.5, board 17 `Dostawy.dc.html`): the hub's main B2B page — hero
 * with three ways and six segments, what we deliver, the request list, example objects, scope,
 * steps, brands, comparison and formalities, after delivery, FAQ, the inquiry form and the
 * floating list bar. Texts and data from `HubSettings.deliveries`. No prices.
 */
export async function DeliveriesPage({ tenant }: { tenant: SiteTenant }) {
  const [shared, settings] = await Promise.all([
    getSharedData(tenant.id),
    getHubSettings(tenant.id),
  ])
  const data = settings.deliveries
  if (!data || !shared) {
    return (
      <h1 className={`py-10 font-display text-5xl font-extrabold ${HUB_CONTAINER}`}>PRO-KOM</h1>
    )
  }
  const { page } = data
  const biznes = shared.lines.find((line) => line.key === 'biznes')?.url ?? null
  const phone = shared.line.phone
  const tel = phone ? toTelHref(phone) : null
  const coverage = isHubLinkLive('/gdzie-dzialamy', settings.pages) ? '/gdzie-dzialamy' : null

  return (
    <DeliveriesState groups={data.listGroups} firstSegment={data.segments[0]?.key ?? ''}>
      <div className="pk-home pk-business">
        <section aria-labelledby="dostawy-h" className="pk-ohero">
          <div aria-hidden="true" className="pk-hero__dots" />
          <div className={`pk-ohero__inner ${HUB_CONTAINER}`}>
            <div className="pk-bhero">
              <div className="pk-ohero__intro">
                <span className="pk-eb">{page.hero.eyebrow}</span>
                <h1 id="dostawy-h" className="pk-h1">
                  {page.hero.title}
                </h1>
                <p className="pk-lead pk-lead--big">{page.hero.lead}</p>
                <div className="pk-coop__links">
                  <a href="#lista" className="pk-hbtn pk-hbtn--accent">
                    {page.hero.cta} <span aria-hidden="true">↓</span>
                  </a>
                  {phone && tel && (
                    <a href={tel} className="pk-hbtn pk-hbtn--phone">
                      {phone}
                    </a>
                  )}
                </div>
              </div>
              <HeroArt kind="deliveries" />
            </div>
            <ol className="pk-dways">
              {page.hero.ways.map((way, index) => (
                <li key={way.href}>
                  <a href={way.href} className="pk-onx">
                    <span className="pk-roll__n">{index + 1}</span>
                    <span className="pk-onx__title">{way.title}</span>
                    <span aria-hidden="true" className="pk-onx__go">
                      ↓
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <SegmentPicker
              texts={page.hero}
              segments={data.segments.map((segment) =>
                // A segment's button to a page that is still off (v1.1 `/wspolpraca`) is left out.
                isHubLinkLive(segment.cta.href, settings.pages)
                  ? segment
                  : { ...segment, cta: undefined },
              )}
            />
            {data.facts.length > 0 && (
              <ul className="pk-bfacts" role="list">
                {data.facts.map((fact) => (
                  <li key={fact.value}>
                    <span className="pk-bfacts__value">{fact.value}</span>
                    <span className="pk-bfacts__label">{fact.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section id="co-dostarczamy" aria-labelledby="co-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__head">
            <div className="pk-sect__intro">
              <span className="pk-eb">{page.areas.eyebrow}</span>
              <h2 id="co-h" className="pk-h2 pk-h2--big">
                {page.areas.title}
              </h2>
            </div>
            <p className="pk-lead pk-sect__aside">{page.areas.lead}</p>
          </div>
          <ul className="pk-o5" role="list">
            {data.areas.map((area) => {
              const details = biznes && BIZNES_DETAILS[area.line]
              return (
                <li key={area.title} style={lineStyle(area.line)}>
                  <div className="pk-lcard pk-care">
                    <span className="pk-olc__short">{area.title}</span>
                    <span className="pk-mark__label">{area.lines}</span>
                    <span className="pk-olc__who">{area.text}</span>
                    <span className="pk-od__chips">
                      {area.tags.map((tag) => (
                        <span key={tag} className="pk-ocp">
                          {tag}
                        </span>
                      ))}
                    </span>
                    <span className="pk-olc__who">
                      <strong>{page.areas.how}</strong> {area.how}
                    </span>
                    {details && (
                      <a href={`${biznes}${details}`} className="pk-chip-go">
                        {page.areas.details} <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <RequestListSection
          texts={page.list}
          groups={data.listGroups}
          services={data.services}
          terms={data.terms}
          details={
            biznes
              ? Object.entries(BIZNES_DETAILS).map(([line, path]) => ({
                  line,
                  href: `${biznes}${path}`,
                  label: page.areas.details,
                }))
              : []
          }
        />
        <ObjectsSection texts={page.objects} objects={data.objects} groups={data.listGroups} />
        <ScopeSection texts={page.scope} levels={data.levels} tabs={data.prepTabs} />

        <section id="proces" aria-labelledby="proces-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__intro">
            <span className="pk-eb">{page.steps.eyebrow}</span>
            <h2 id="proces-h" className="pk-h2 pk-h2--big">
              {page.steps.title}
            </h2>
          </div>
          <ol className="pk-roll pk-dsteps">
            {data.steps.map((step, index) => (
              <li key={step.title} className="pk-roll__step">
                <span className="pk-roll__n">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="pk-roll__title">{step.title}</h3>
                <p className="pk-roll__text">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="marki-dostaw"
          aria-labelledby="marki-d-h"
          className={`pk-sect ${HUB_CONTAINER}`}
        >
          <div className="pk-sect__head">
            <div className="pk-sect__intro">
              <span className="pk-eb">{page.brands.eyebrow}</span>
              <h2 id="marki-d-h" className="pk-h2 pk-h2--big">
                {page.brands.title}
              </h2>
            </div>
            {isHubLinkLive('/partnerzy', settings.pages) && (
              <Link href="/partnerzy" className="pk-hbtn">
                {page.brands.all} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <ul className="pk-bgroups pk-bgroups--even" role="list">
            {data.brands.map((group) => (
              <li key={group.title} className="pk-bgroup" style={lineStyle(group.line)}>
                <span className="pk-bgroup__title">{group.title}</span>
                <span className="pk-bgroup__brands">
                  {group.items.map((brand) => (
                    <span key={brand.name} className="pk-bch" title={brand.note}>
                      {brand.name}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="pk-note">{page.brands.note}</p>
        </section>

        <section id="formalnosci" aria-labelledby="cmp-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__intro">
            <span className="pk-eb">{page.compare.eyebrow}</span>
            <h2 id="cmp-h" className="pk-h2 pk-h2--big">
              {page.compare.title}
            </h2>
          </div>
          <div className="pk-cmp-wrap">
            <table className="pk-cmp">
              <thead>
                <tr>
                  <th scope="col">{page.compare.area}</th>
                  <th scope="col">{page.compare.other}</th>
                  <th scope="col" className="pk-cmp__one">
                    {page.compare.ours}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.comparison.map((row) => (
                  <tr key={row.title}>
                    <th scope="row">{row.title}</th>
                    <td>{row.other}</td>
                    <td className="pk-cmp__one">{row.ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* `#przetargi`: the home page's „Zamówienia publiczne” links here (runda 1811 D14). */}
          <div id="przetargi" className="pk-sect__intro scroll-mt-24">
            <span className="pk-eb">{page.formal.eyebrow}</span>
            <h3 className="pk-h3">{page.formal.title}</h3>
          </div>
          <ul className="pk-roll" role="list">
            {data.formalities.map((item) => (
              <li key={item.title} className="pk-roll__step">
                <h4 className="pk-roll__title">{item.title}</h4>
                <p className="pk-roll__text">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="po-dostawie" aria-labelledby="po-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__head">
            <div className="pk-sect__intro">
              <span className="pk-eb">{page.after.eyebrow}</span>
              <h2 id="po-h" className="pk-h2 pk-h2--big">
                {page.after.title}
              </h2>
            </div>
            <p className="pk-lead pk-sect__aside">{page.after.lead}</p>
          </div>
          <ul className="pk-o5" role="list">
            {data.after.map((item) => (
              <li key={item.title} className="pk-lcard pk-care" style={lineStyle(item.line)}>
                <span className="pk-olc__short">{item.title}</span>
                <span className="pk-olc__who">{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="pk-plan__note">
            {page.after.towns}{' '}
            {data.towns
              .map((town) => (town.salon ? `${town.name} (salon)` : town.name))
              .join(' · ')}
            {coverage && (
              <>
                {' '}
                · <a href={coverage}>{page.after.coverage} →</a>
              </>
            )}
          </p>
        </section>

        <Faq
          texts={{
            eyebrow: page.faq.eyebrow,
            title: page.faq.title,
            helpLink: '',
            items: data.faq,
          }}
          tokens={faqTokens(shared.company, phone)}
          helpHref={null}
        />

        <section
          id="formularz"
          aria-labelledby="formularz-h"
          className={`pk-sect ${HUB_CONTAINER}`}
        >
          <div className="pk-contact">
            <FormListSummary texts={page} groups={data.listGroups} segments={data.segments} />
            <div className="pk-contact__write">
              <HubForm
                shared={shared}
                sendLabel={page.form.cta}
                placeholder={data.segments[0]?.form.descPlaceholder}
                prefill={
                  <DeliveriesFormPart
                    label={page.form.eyebrow}
                    data={{
                      segments: data.segments,
                      listGroups: data.listGroups,
                      services: data.services,
                      labels: {
                        pcs: page.list.pcs,
                        yours: page.list.yours,
                        segments: page.hero.segmentsLabel,
                      },
                    }}
                  />
                }
              />
              <p className="pk-plan__note">{page.form.note}</p>
            </div>
          </div>
        </section>

        <NextSteps
          texts={{ eyebrow: page.next.eyebrow, title: page.next.title, items: data.next }}
          pages={settings.pages}
        />
        <ListBar texts={page.list} groups={data.listGroups} />
      </div>
    </DeliveriesState>
  )
}
