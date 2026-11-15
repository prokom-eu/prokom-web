import Link from 'next/link'

import { getHubSettings } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'
import { SegmentPicker } from '../dostawy/DeliveriesClient'
import { ChoiceState } from '../dostawy/ChoiceState'
import { Faq } from '../home/Faq'
import { faqTokens } from '../home/model'
import { lineStyle } from '../lineColors'
import { NextSteps } from '../linie/OfferSections'
import { CooperationFormPart } from '../form/FormParts'
import { HubForm } from '../form/HubForm'
import { RoleFormSummary } from './RoleFormSummary'

/**
 * `/wspolpraca` (spec §6.6, board 16 `Wspolpraca.dc.html`), a v1.1 page (flag `pages.cooperation`):
 * hero with six roles (the choice changes the plan and the form heading), stages, scope, larger
 * deliveries, suppliers, rules, FAQ, the form and „Co dalej”. Texts from `HubSettings.cooperation`;
 * phones and e-mail from the panels. No „opiekun” promise (spec §6.6).
 */
export async function CooperationPage({ tenant }: { tenant: SiteTenant }) {
  const [shared, settings, contacts] = await Promise.all([
    getSharedData(tenant.id),
    getHubSettings(tenant.id),
    getHubLineContacts(tenant.id),
  ])
  const data = settings.cooperation
  if (!data || !shared) {
    return (
      <h1 className={`py-10 font-display text-5xl font-extrabold ${HUB_CONTAINER}`}>PRO-KOM</h1>
    )
  }
  const { page } = data
  const lineOf = (key: string) => shared.lines.find((line) => line.key === key)
  const instalacje = lineOf('instalacje')?.url ?? null
  const phone = shared.line.phone
  const tel = phone ? toTelHref(phone) : null

  return (
    <ChoiceState first={data.roles[0]?.key ?? ''}>
      <div className="pk-home pk-business">
        <section aria-labelledby="wspolpraca-h" className="pk-ohero">
          <div aria-hidden="true" className="pk-hero__dots" />
          <div className={`pk-ohero__inner ${HUB_CONTAINER}`}>
            <div className="pk-ohero__intro">
              <span className="pk-eb">{page.hero.eyebrow}</span>
              <h1 id="wspolpraca-h" className="pk-h1">
                {page.hero.title}
              </h1>
              <p className="pk-lead pk-lead--big">{page.hero.lead}</p>
              <div className="pk-coop__links">
                <a href="#formularz" className="pk-hbtn pk-hbtn--accent">
                  {page.hero.cta} <span aria-hidden="true">↓</span>
                </a>
                {phone && tel && (
                  <a href={tel} className="pk-hbtn pk-hbtn--phone">
                    {phone}
                  </a>
                )}
              </div>
            </div>
            <SegmentPicker
              texts={{
                segmentsLabel: page.hero.rolesLabel,
                segmentsHint: page.hero.rolesHint,
                start: page.hero.start,
              }}
              segments={data.roles}
            />
            {data.facts.length > 0 && (
              <ul className="pk-bfacts" role="list">
                {data.facts.map((fact, index) => (
                  <li key={`${index}-${fact.value}`}>
                    <span className="pk-bfacts__value">{fact.value}</span>
                    <span className="pk-bfacts__label">{fact.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section id="etapy" aria-labelledby="etapy-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__head">
            <div className="pk-sect__intro">
              <span className="pk-eb">{page.stages.eyebrow}</span>
              <h2 id="etapy-h" className="pk-h2 pk-h2--big">
                {page.stages.title}
              </h2>
            </div>
            <p className="pk-lead pk-sect__aside">{page.stages.lead}</p>
          </div>
          <ol className="pk-roll">
            {data.stages.map((stage, index) => (
              <li key={stage.title} className="pk-roll__step">
                <span className="pk-roll__n">
                  {String(index + 1).padStart(2, '0')} · {stage.when}
                </span>
                <h3 className="pk-roll__title">{stage.title}</h3>
                <p className="pk-roll__text">{stage.lead}</p>
                <dl className="pk-roll__who">
                  <div>
                    <dt>{page.stages.we}</dt>
                    <dd>{stage.we}</dd>
                  </div>
                  <div>
                    <dt>{page.stages.you}</dt>
                    <dd>{stage.you}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </section>

        <section id="zakres" aria-labelledby="zakres-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__intro">
            <span className="pk-eb">{page.scope.eyebrow}</span>
            <h2 id="zakres-h" className="pk-h2 pk-h2--big">
              {page.scope.title}
            </h2>
          </div>
          <ul className="pk-o5" role="list">
            {data.scopes.map((scope) => (
              <li key={scope.name} className="pk-lcard pk-care" style={lineStyle(scope.line)}>
                <span className="pk-olc__short">{scope.name}</span>
                <span className="pk-mark__label">{scope.tag}</span>
                <ul className="pk-dots" role="list">
                  {scope.items.map((item) => (
                    <li key={item.title}>
                      <span>
                        <b>{item.title}</b> — {item.text} <em>{item.when}</em>
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {instalacje && (
            <a
              href={`${instalacje}${page.scope.architectsPath}`}
              className="pk-onx"
              style={lineStyle('instalacje')}
            >
              <span className="pk-onx__title">{page.scope.architectsTitle}</span>
              <span className="pk-onx__text">{page.scope.architectsText}</span>
              <span aria-hidden="true" className="pk-onx__go">
                ↗
              </span>
            </a>
          )}
        </section>

        <section id="dostawy" aria-labelledby="dostawy-h2" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-coop">
            <div className="pk-coop__intro">
              <span className="pk-eb">{page.deliveries.eyebrow}</span>
              <h2 id="dostawy-h2" className="pk-h2">
                {page.deliveries.title}
              </h2>
              <p className="pk-lead">{page.deliveries.lead}</p>
              <div className="pk-coop__links">
                <Link href="/inwestycje-i-dostawy" className="pk-hbtn pk-hbtn--accent">
                  {page.deliveries.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <ul className="pk-grants" role="list">
              {data.deliveries.map((item) => (
                <li key={item.title}>
                  <span className="pk-osv__text">
                    <span className="pk-osv__title">{item.title}</span>
                    <span className="pk-osv__short">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="dostawcy" aria-labelledby="dostawcy-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__head">
            <div className="pk-sect__intro">
              <span className="pk-eb">{page.suppliers.eyebrow}</span>
              <h2 id="dostawcy-h" className="pk-h2 pk-h2--big">
                {page.suppliers.title}
              </h2>
            </div>
            <div className="pk-sect__aside pk-stack">
              <p className="pk-lead">{page.suppliers.lead}</p>
              {shared.company.email && (
                <a href={`mailto:${shared.company.email}`} className="pk-hbtn">
                  {shared.company.email}
                </a>
              )}
            </div>
          </div>
          <ol className="pk-roll">
            {data.suppliers.map((item, index) => (
              <li key={item.title} className="pk-roll__step">
                <span className="pk-roll__n">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="pk-roll__title">{item.title}</h3>
                <p className="pk-roll__text">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="zasady" aria-labelledby="zasady-h" className={`pk-sect ${HUB_CONTAINER}`}>
          <div className="pk-sect__intro">
            <span className="pk-eb">{page.rules.eyebrow}</span>
            <h2 id="zasady-h" className="pk-h2 pk-h2--big">
              {page.rules.title}
            </h2>
          </div>
          <ol className="pk-roll">
            {data.rules.map((rule, index) => (
              <li key={rule.title} className="pk-roll__step">
                <span className="pk-roll__n">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="pk-roll__title">{rule.title}</h3>
                <p className="pk-roll__text">{rule.text}</p>
              </li>
            ))}
          </ol>
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
            <RoleFormSummary
              texts={page.form}
              roles={data.roles}
              phones={Object.fromEntries(
                data.roles.flatMap((role) => {
                  const contact = contacts.find((line) => line.key === role.line)
                  const roleTel = contact?.phone ? toTelHref(contact.phone) : null
                  return contact?.phone && roleTel
                    ? [[role.key, { phone: contact.phone, tel: roleTel }]]
                    : []
                }),
              )}
            />
            <div className="pk-contact__write">
              <HubForm
                shared={shared}
                placeholder={data.roles[0]?.form.descPlaceholder}
                prefill={<CooperationFormPart label={page.form.eyebrow} roles={data.roles} />}
              />
              <p className="pk-plan__note">{page.form.note}</p>
            </div>
          </div>
        </section>

        <NextSteps
          texts={{ eyebrow: page.next.eyebrow, title: page.next.title, items: data.next }}
          pages={settings.pages}
        />
      </div>
    </ChoiceState>
  )
}
