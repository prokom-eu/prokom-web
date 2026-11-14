import { getHubData, getHubSettings } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'
import { homeLines, teamExamples } from '../home/model'
import { offerData, parseOfferParams } from './model'
import { OfferCatalog } from './OfferCatalog'
import { LinesGrid, NextSteps } from './OfferSections'
import { TeamPicker } from './TeamPicker'

type Props = {
  tenant: SiteTenant
  params: Record<string, string | string[] | undefined>
}

/**
 * `/linie` — „Cała oferta” (spec §6.2, board 02 `Linie.dc.html`): hero with the search, the catalog
 * of `HubServices`, „Kto czym się zajmuje”, „Tak pracują razem” and „Co dalej”. Texts from
 * `HubSettings.offer`; the lines' audiences, steps and the team example from `home` (one source).
 * Without those texts in the panel only the H1 is shown — never texts from code.
 */
export async function OfferPage({ tenant, params }: Props) {
  const [shared, hub, settings, contacts] = await Promise.all([
    getSharedData(tenant.id),
    getHubData(tenant.id),
    getHubSettings(tenant.id),
    getHubLineContacts(tenant.id),
  ])
  const { home, offer, pages } = settings
  if (!home || !offer || !shared) {
    return (
      <h1 className={`py-10 font-display text-5xl font-extrabold ${HUB_CONTAINER}`}>PRO-KOM</h1>
    )
  }
  const lines = homeLines(contacts, home, hub.tools, settings.trust)
  const data = offerData(lines, hub.services, pages)
  const initial = parseOfferParams(
    params,
    data.lines.map((line) => line.key),
    data.services.map((service) => service.key),
  )
  const phone = shared.line.phone
  const tel = phone ? toTelHref(phone) : null

  return (
    <div className="pk-home pk-offer">
      <OfferCatalog
        texts={offer}
        lines={data.lines}
        services={data.services}
        initial={initial}
        phone={phone}
        tel={tel}
        hours={shared.line.hours}
        helpHref={isHubLinkLive('/pomoc', pages) ? '/pomoc' : null}
      />
      <LinesGrid texts={offer.lines} lines={data.lines} />
      <TeamPicker
        texts={home.team}
        examples={teamExamples(
          home.team.examples,
          hub.plans,
          lines.map((line) => line.key),
        )}
        lines={lines.map(({ key, label, url, phone: linePhone }) => ({
          key,
          label,
          url,
          phone: linePhone,
        }))}
        phone={phone}
        tel={tel}
      />
      <NextSteps texts={offer.next} pages={pages} />
    </div>
  )
}
