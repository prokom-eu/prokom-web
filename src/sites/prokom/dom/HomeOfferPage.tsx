import { getHubData, getHubSettings } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'
import { FormCta } from '../firmy/BusinessSections'
import { AreaTabs, IndustryPicker } from '../firmy/Pickers'
import { Faq } from '../home/Faq'
import { faqTokens, homeLines } from '../home/model'
import { NextSteps } from '../linie/OfferSections'
import { TeamPicker } from '../linie/TeamPicker'
import { HomeCare, HomeFinal, HomeHero, HouseSection } from './HomeSections'
import { HubForm } from '../form/HubForm'
import { PageFormPart } from '../form/FormParts'
import { homeExamples, homeSituations, sceneAreas } from './model'
import { TopicTabs } from './TopicTabs'

/**
 * `/dla-domu` (spec §6.4, board 04 `DlaDomu.dc.html`), a v1.1 page — the route answers 404 until
 * `HubSettings.pages.forHome` is on. Hero, situations (`HubPlans`), the three lines, the house in
 * eleven points, installation topics, „Jeden dom. Kilka linii.”, guarantees and the salon, FAQ,
 * the way to the form, „Co dalej” and the line numbers. Texts from `HubSettings.forHome`.
 */
export async function HomeOfferPage({ tenant }: { tenant: SiteTenant }) {
  const [shared, hub, settings, contacts] = await Promise.all([
    getSharedData(tenant.id),
    getHubData(tenant.id),
    getHubSettings(tenant.id),
    getHubLineContacts(tenant.id),
  ])
  const { home, forHome: texts, pages } = settings
  if (!home || !texts || !shared) {
    return (
      <h1 className={`py-10 font-display text-5xl font-extrabold ${HUB_CONTAINER}`}>PRO-KOM</h1>
    )
  }
  const lines = homeLines(contacts, home, hub.tools, settings.trust).map(
    ({ key, name, label, domain, url, phone, tel, promise }) => ({
      key,
      name,
      label,
      domain,
      url,
      phone,
      tel,
      promise,
    }),
  )
  const phone = shared.line.phone
  const tel = phone ? toTelHref(phone) : null
  const installations = lines.find((line) => line.key === 'instalacje')?.url ?? null
  const now = new Date().toISOString()

  return (
    <div className="pk-home pk-business">
      <HomeHero
        texts={texts.hero}
        facts={settings.trust}
        lines={lines}
        phone={phone}
        tel={tel}
        hours={shared.line.hours}
      />
      <IndustryPicker
        id="sytuacja"
        texts={texts.situations}
        items={homeSituations(hub.plans, lines)}
        phone={phone}
        tel={tel}
      />
      <AreaTabs
        id="linie-dom"
        texts={{ ...texts.scene, inLine: texts.scene.title }}
        lines={lines.map((line) => ({
          ...line,
          short: texts.scene.items.find((item) => item.line === line.key)?.short ?? '',
        }))}
        items={sceneAreas(texts.scene.items, lines)}
      />
      <HouseSection texts={texts.section} href={installations} />
      <TopicTabs texts={texts.topics} href={installations} />
      <TeamPicker
        id="u-ciebie"
        ctaHref="#formularz"
        texts={texts.together}
        examples={homeExamples(texts.together.examples, lines)}
        lines={lines.map(({ key, label, url, phone: linePhone }) => ({
          key,
          label,
          url,
          phone: linePhone,
        }))}
        phone={phone}
        tel={tel}
      />
      <HomeCare
        texts={texts.care}
        lines={lines}
        company={shared.company}
        now={now}
        phone={phone}
        tel={tel}
      />
      <Faq
        texts={texts.faq}
        tokens={faqTokens(shared.company, phone)}
        helpHref={isHubLinkLive('/pomoc', pages) ? '/pomoc' : null}
      />
      <FormCta texts={texts.form}>
        <HubForm shared={shared} prefill={<PageFormPart label={texts.hero.eyebrow} />} />
      </FormCta>
      <NextSteps texts={texts.next} pages={pages} />
      <HomeFinal texts={texts.final} lines={lines} company={shared.company} />
    </div>
  )
}
