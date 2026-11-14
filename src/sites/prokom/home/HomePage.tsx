import type { Metadata } from 'next'

import { getHubData, getHubSettings } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { getHubNews } from '@/lib/prokom/news'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { getEnv } from '@/lib/env'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'
import { Brands } from './Brands'
import { Contact } from './Contact'
import { Cooperation } from './Cooperation'
import { Coverage } from './Coverage'
import { Faq } from './Faq'
import { Final } from './Final'
import { Hero } from './Hero'
import { Choose, HelpPicker, LineScene } from './HomeIslands'
import { choosePlans, faqTokens, helpCases, homeLines, teamExamples } from './model'
import { News } from './News'
import { Tools } from './Tools'
import { toolGroups } from './toolGroups'

/** Title of the start page (spec §4); SEO of every page is finished in H6-2. */
export const HOME_METADATA: Metadata = {
  title: { absolute: 'PRO-KOM Rabka-Zdrój — IT dla firm, instalacje, serwis' },
}

/** Three newest posts of the line sites (spec §6.1 pkt 9). */
const NEWS = 3
/** The message form lives on the contact page (one form, ADR-003); v1 page, always on. */
const CONTACT = '/kontakt'

/**
 * The hub's start page (spec §6.1, board 01 `Main.dc.html`): texts from `HubSettings.home`, line
 * contacts from the panels of the lines, services, tools and personas from the `hub-*`
 * collections. Without `home` in the panel (fresh database) the page shows only its sections'
 * anchors — never texts from code. A section without data (no posts, no tools) is left out, and
 * the rail shows only the sections on the page.
 */
export async function HomePage({ tenant }: { tenant: SiteTenant }) {
  // Absolute links to the line sites of this environment; locally every domain on this port.
  const { SITE_ENV } = getEnv()
  const [shared, hub, settings, contacts, news] = await Promise.all([
    getSharedData(tenant.id),
    getHubData(tenant.id),
    getHubSettings(tenant.id),
    getHubLineContacts(tenant.id),
    getHubNews(NEWS, {
      siteEnv: SITE_ENV,
      port: SITE_ENV === 'local' ? (process.env.PORT ?? '3000') : null,
    }),
  ])
  const home = settings.home
  const rail = shared?.line.rail?.sections ?? []
  const now = new Date().toISOString()
  const lines = home ? homeLines(contacts, home, hub.tools, settings.trust) : []
  const phone = shared?.line.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const pages = settings.pages
  const live = (href: string) => (isHubLinkLive(href, pages) ? href : null)

  return (
    <div className="pk-home">
      {home && shared ? (
        <>
          <Hero
            home={home}
            lines={lines}
            facts={settings.trust}
            company={shared.company}
            phone={phone}
            now={now}
          />
          <LineScene
            head={home.lines}
            allHref={live('/linie')}
            lines={lines}
            team={{
              ...home.team,
              examples: teamExamples(
                home.team.examples,
                hub.plans,
                lines.map((line) => line.key),
              ),
            }}
            techStages={home.lines.techStages}
            cameras={home.lines.cameras}
            cameraNotes={home.lines.cameraNotes}
            phone={phone}
            tel={tel}
          />
          <Choose
            texts={home.choose}
            plans={choosePlans(home.choose.personas, hub.plans, lines)}
            phone={phone}
            tel={tel}
            writeHref={CONTACT}
          />
          <Tools
            texts={home.tools}
            {...toolGroups(lines, hub.tools)}
            allHref={live('/zalatw-online')}
          />
          <HelpPicker
            texts={home.help}
            cases={helpCases(home.help.slugs, hub.help, lines)}
            allHref={live('/pomoc')}
          />
          <Cooperation texts={home.cooperation} pages={pages} />
          {settings.brands && (
            <Brands
              brands={settings.brands}
              facts={settings.trust}
              lines={lines}
              allHref={live('/partnerzy')}
            />
          )}
          <Coverage
            texts={home.coverage}
            company={shared.company}
            now={now}
            checkHref={live('/gdzie-dzialamy')}
          />
          <News texts={home.news} news={news} lines={lines} allHref={live('/aktualnosci')} />
          <Faq
            texts={home.faq}
            tokens={faqTokens(shared.company, phone)}
            helpHref={live('/pomoc')}
          />
          <Contact
            texts={home.contact}
            lines={lines}
            company={shared.company}
            now={now}
            contactHref={CONTACT}
          />
          <Final texts={home.final} phone={phone} tel={tel} contactHref={CONTACT} />
        </>
      ) : (
        <h1 className={`py-10 font-display text-5xl font-extrabold ${HUB_CONTAINER}`}>PRO-KOM</h1>
      )}
      {!(home && shared) && (
        <div className={HUB_CONTAINER}>
          {rail.map((section) => (
            <section
              key={section.anchorId}
              id={section.anchorId}
              aria-labelledby={`${section.anchorId}-h`}
              className="min-h-[40vh] border-t border-border py-12"
            >
              <h2 id={`${section.anchorId}-h`} className="font-display text-3xl font-extrabold">
                {section.label}
              </h2>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
