import { headers } from 'next/headers'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { AboutPage } from '@/components/shared/AboutPage'
import { LineLogo } from '@/components/shared/LineLogo'
import { ContactPage } from '@/components/shared/ContactPage'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'
import { getSolutionsIndex } from '@/lib/software/data'
import type { ProjectSolution } from '@/lib/software/projectSummary'
import type { SwSharedPageBlock as SwSharedPageBlockData } from '@/payload-types'

import { CompareSection } from '../../components/home/HomeSections'
import { ProjectPrefill } from '../../components/ProjectPrefill'
import { TechBlockSection } from '../../components/v24home/HomeV24Blocks'

type Props = { block: SwSharedPageBlockData; tenantId: number }

/**
 * `/kontakt` and `/o-firmie` of Software (SWA5b = L2-S) on the shared templates (spec §6.1–6.2):
 * texts from the line's `shared.contact` / `shared.about`. Own sections in the slots — Kontakt:
 * „Twój projekt” above the form (`formPrefill`, sent as the inquiry's list); O firmie: „Freelancer,
 * agencja czy PRO-KOM?” and the technical section of the start page after the rules.
 */
export async function SwSharedPageBlock({ block, tenantId }: Props) {
  if (block.template === 'contact') return <SoftwareContact tenantId={tenantId} />
  return <SoftwareAbout tenantId={tenantId} />
}

async function SoftwareContact({ tenantId }: { tenantId: number }) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const env = getEnv()
  const [shared, host, index] = await Promise.all([
    getSharedData(tenantId),
    headers().then((h) => h.get('host')),
    getSolutionsIndex(tenantId),
  ])
  // Without the shared data (fresh database before `pnpm seed`) there is nothing to show.
  if (!shared) return null
  const solutions: ProjectSolution[] = index.solutions.map((solution) => ({
    slug: solution.slug,
    name: solution.name,
    category: solution.category,
    priceFrom: solution.priceFrom,
    priceMonthly: solution.priceMonthly,
    leadTime: solution.leadTime,
    thumbnail: solution.thumbnail,
    levels: solution.levels,
  }))
  return (
    <ContactPage
      shared={shared}
      line="software"
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      now={new Date().toISOString()}
      formToken={issueFormToken(env.PAYLOAD_SECRET)}
      slots={{
        formPrefill: (
          // `useSearchParams` (`?projekt=1`, `?poziom=`) needs a boundary of its own.
          <Suspense fallback={null}>
            <ProjectPrefill solutions={solutions} />
          </Suspense>
        ),
      }}
    />
  )
}

async function SoftwareAbout({ tenantId }: { tenantId: number }) {
  const env = getEnv()
  const [shared, host] = await Promise.all([
    getSharedData(tenantId),
    headers().then((h) => h.get('host')),
  ])
  if (!shared) return null
  return (
    <AboutPage
      shared={shared}
      line="software"
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      siteEnv={env.SITE_ENV}
      // „Wizytówka firmy” and the logo on top of the company card (board AU-firma, AUDYT-0811 #13).
      cardHeading={
        <div className="flex items-center justify-between gap-3" data-card-heading>
          <span className="sw-eyebrow">Wizytówka firmy</span>
          <LineLogo line="software" alt="" on="auto" height={22} />
        </div>
      }
      slots={{
        afterRules: (
          <>
            <CompareSection tenantId={tenantId} />
            <TechBlockSection tenantId={tenantId} />
          </>
        ),
      }}
    />
  )
}
