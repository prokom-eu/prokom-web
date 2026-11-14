import type { Metadata } from 'next'

import { getHubData, getHubSettings } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'
import { Hero } from './Hero'
import { LineScene } from './HomeIslands'
import { homeLines, teamExamples } from './model'

/** Title of the start page (spec §4); SEO of every page is finished in H6-2. */
export const HOME_METADATA: Metadata = {
  title: { absolute: 'PRO-KOM Rabka-Zdrój — IT dla firm, instalacje, serwis' },
}

/** Sections of the rail already built on this page; the others keep a placeholder until H2-2/3. */
const BUILT = new Set(['start', 'linie'])

/**
 * The hub's start page (spec §6.1, board 01 `Main.dc.html`): texts from `HubSettings.home`, line
 * contacts from the panels of the lines, services, tools and personas from the `hub-*`
 * collections. Without `home` in the panel (fresh database) the page shows only its sections'
 * anchors — never texts from code.
 */
export async function HomePage({ tenant }: { tenant: SiteTenant }) {
  const [shared, hub, settings, contacts] = await Promise.all([
    getSharedData(tenant.id),
    getHubData(tenant.id),
    getHubSettings(tenant.id),
    getHubLineContacts(tenant.id),
  ])
  const home = settings.home
  const rail = shared?.line.rail?.sections ?? []
  const now = new Date().toISOString()
  const lines = home ? homeLines(contacts, home, hub.tools, settings.trust) : []
  const phone = shared?.line.phone ?? null
  const tel = phone ? toTelHref(phone) : null

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
            allHref={isHubLinkLive('/linie', settings.pages) ? '/linie' : null}
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
        </>
      ) : (
        <h1 className={`py-10 font-display text-5xl font-extrabold ${HUB_CONTAINER}`}>PRO-KOM</h1>
      )}
      <div className={HUB_CONTAINER}>
        {rail
          .filter((section) => !home || !BUILT.has(section.anchorId))
          .map((section) => (
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
    </div>
  )
}
