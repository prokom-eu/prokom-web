import { getHubData, getHubSettings } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'
import { Brands } from '../home/Brands'
import { Faq } from '../home/Faq'
import { faqTokens, homeLines } from '../home/model'
import { NextSteps } from '../linie/OfferSections'
import {
  BusinessFinal,
  BusinessHero,
  Care,
  Compare,
  FormCta,
  Grants,
  Rollout,
} from './BusinessSections'
import { areas, industries, situations } from './model'
import { AreaTabs, IndustryPicker, SituationPicker } from './Pickers'

/** The contact page with the topic of this page, until H6-1 brings the form here. */
const FORM_HREF = '/kontakt?temat=dla-firm'

/**
 * `/dla-firm` (spec §6.3, board 03 `DlaFirm.dc.html`): hero, industries (`HubPlans`), areas in four
 * line tabs, situations, rollout, care, comparison, funded purchases (documents, no financing),
 * brands, FAQ, the way to the form, „Co dalej” and the closing band. Texts from
 * `HubSettings.forBusiness`; without them only the H1 — never texts from code.
 */
export async function BusinessPage({ tenant }: { tenant: SiteTenant }) {
  const [shared, hub, settings, contacts] = await Promise.all([
    getSharedData(tenant.id),
    getHubData(tenant.id),
    getHubSettings(tenant.id),
    getHubLineContacts(tenant.id),
  ])
  const { home, forBusiness: texts, pages } = settings
  if (!home || !texts || !shared) {
    return (
      <h1 className={`py-10 font-display text-5xl font-extrabold ${HUB_CONTAINER}`}>PRO-KOM</h1>
    )
  }
  const homeLineList = homeLines(contacts, home, hub.tools, settings.trust)
  const lines = homeLineList.map(({ key, name, label, domain, url, phone, tel, promise }) => ({
    key,
    name,
    label,
    domain,
    url,
    phone,
    tel,
    promise,
  }))
  const phone = shared.line.phone
  const tel = phone ? toTelHref(phone) : null
  const biznes = lines.find((line) => line.key === 'biznes') ?? null
  const areaLines = texts.areas.lines.flatMap((entry) => {
    const info = lines.find((line) => line.key === entry.line)
    return info ? [{ ...info, short: entry.short }] : []
  })

  return (
    <div className="pk-home pk-business">
      <BusinessHero
        texts={texts.hero}
        facts={settings.trust}
        phone={phone}
        tel={tel}
        hours={shared.line.hours}
      />
      <IndustryPicker
        texts={texts.industries}
        items={industries(hub.plans, texts.industries.subs, lines)}
        phone={phone}
        tel={tel}
      />
      <AreaTabs texts={texts.areas} lines={areaLines} items={areas(texts.areas.items, lines)} />
      <SituationPicker
        texts={texts.situations}
        items={situations(texts.situations.items, lines)}
        phone={phone}
        tel={tel}
      />
      <Rollout texts={texts.rollout} />
      <Care texts={texts.care} lines={lines} />
      <Compare texts={texts.compare} />
      <Grants texts={texts.grants} phone={biznes?.phone ?? phone} tel={biznes?.tel ?? tel} />
      {settings.brands && (
        <Brands
          brands={settings.brands}
          facts={settings.trust}
          lines={homeLineList}
          allHref={isHubLinkLive('/partnerzy', pages) ? '/partnerzy' : null}
        />
      )}
      <Faq
        texts={texts.faq}
        tokens={faqTokens(shared.company, phone)}
        helpHref={isHubLinkLive('/pomoc', pages) ? '/pomoc' : null}
      />
      <FormCta texts={texts.form} href={FORM_HREF} />
      <NextSteps texts={texts.next} pages={pages} />
      <BusinessFinal texts={texts.final} phone={phone} tel={tel} />
    </div>
  )
}
