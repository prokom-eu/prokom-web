import type { Metadata } from 'next'

import { AboutPage } from '@/components/shared/AboutPage'
import { ContactPage } from '@/components/shared/ContactPage'
import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { HUB_ABOUT } from '@/lib/prokom/about'
import { visibleNetwork } from '@/lib/prokom/brands'
import { getHubSettings, hubOgImage } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { hubPageMetadata, type HubDescribedPath } from '@/lib/prokom/seo'
import { pageRobots } from '@/lib/seo/robots'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { AboutNetwork, AboutStory, AboutValues } from './AboutStory'
import { Certificates } from './Certificates'
import { EmailDirectory } from './EmailDirectory'
import {
  BranchNote,
  ExtraEmails,
  ExtraPhones,
  PartnerPointNote,
  TechPointsCard,
} from './ExtraContacts'
import { SaturdayNote } from './SaturdayNote'

/**
 * Hub pages whose address the line sites use as panel pages (`/kontakt`, `/o-firmie`): a static
 * route would hide those pages on every other domain, so the hub answers them inside `[slug]` —
 * on the shared templates (ADR-022) with the hub's data (spec §6.8, §6.9).
 */
type Address = { street: string; city: string } | null

const TITLES: Record<string, { path: HubDescribedPath; title: (address: Address) => string }> = {
  // Spec §4; the address comes from `CompanyData` (contact data never in code).
  kontakt: {
    path: '/kontakt',
    title: (address) =>
      address ? `Kontakt PRO-KOM — ${address.city}, ${address.street}` : 'Kontakt PRO-KOM',
  },
  'o-firmie': {
    path: '/o-firmie',
    title: (address) =>
      address ? `O firmie PRO-KOM — ${address.city}, od 2004 roku` : 'O firmie PRO-KOM',
  },
}

/** Legal pages stay out of search until a lawyer accepts them (spec §6.13). */
const LEGAL = new Set(['polityka-prywatnosci', 'cookies', 'dostepnosc'])

export async function hubSlugMetadata(tenant: SiteTenant, slug: string): Promise<Metadata | null> {
  const page = TITLES[slug]
  if (page) {
    const [shared, ogImage] = await Promise.all([getSharedData(tenant.id), hubOgImage(tenant.id)])
    return hubPageMetadata(page.path, page.title(shared?.company.address ?? null), ogImage)
  }
  if (LEGAL.has(slug)) return { robots: pageRobots(getEnv().SITE_ENV, false) }
  return null
}

export async function hubSlugPage(
  tenant: SiteTenant,
  slug: string,
  origin: () => Promise<string>,
): Promise<React.ReactNode | null> {
  if (!(slug in TITLES)) return null
  const shared = await getSharedData(tenant.id)
  if (!shared) return null
  const env = getEnv()
  const settings = await getHubSettings(tenant.id)
  const network = visibleNetwork(settings.brands, settings.trust)
  if (slug === 'kontakt') {
    const lineContacts = await getHubLineContacts(tenant.id)
    return (
      <ContactPage
        shared={shared}
        line={tenant.line}
        origin={await origin()}
        now={new Date().toISOString()}
        formToken={issueFormToken(env.PAYLOAD_SECRET)}
        heroLayout="calls"
        slots={{
          // Notes split between the hero columns so both are about as tall (16.11).
          // 22.11: the notes as a two-column grid under the call tiles — Tech's points on the
          // left, Saturday, the landline and the orders mailbox beside them.
          heroBelow: (
            <>
              <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2">
                <TechPointsCard lines={lineContacts} />
                <div className="flex flex-col gap-3">
                  <SaturdayNote lines={lineContacts} />
                  <ExtraPhones phones={settings.extraPhones} />
                  <ExtraEmails emails={settings.extraEmails} main={shared.line.email} />
                </div>
              </div>
              {network && (
                <PartnerPointNote text={network.salonNote} href={`/o-firmie#${network.slug}`} />
              )}
            </>
          ),
          heroAside: <BranchNote branch={settings.branch} />,
          afterRoutes: (
            <EmailDirectory
              main={shared.line.email}
              extras={settings.extraEmails}
              lines={lineContacts}
              company={shared.lines}
            />
          ),
        }}
      />
    )
  }
  return (
    <AboutPage
      shared={shared}
      line={tenant.line}
      origin={await origin()}
      siteEnv={env.SITE_ENV}
      bothPhones
      slots={{
        // „Nasza historia” and „Co nas wyróżnia” (16.11): code defaults, the panel adds the rest.
        afterStats: <AboutStory about={HUB_ABOUT} />,
        afterRules: (
          <>
            <AboutValues about={HUB_ABOUT} brands={settings.brands} network={network} />
            <AboutNetwork network={network} />
            <Certificates biznesUrl={shared.lines.find((l) => l.key === 'biznes')?.url ?? null} />
          </>
        ),
        ...(settings.branch && {
          beforeVisit: (
            <section aria-label={settings.branch.name} className={`${PAGE_CONTAINER} py-6`}>
              <BranchNote branch={settings.branch} />
            </section>
          ),
        }),
      }}
    />
  )
}
