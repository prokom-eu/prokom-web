import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { PLAN_PATH } from '@/lib/catalog/floorPlan'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { Breadcrumbs, type Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { FloorPlan } from '@/sites/biznes/components/plan/FloorPlan'
import { loadFloorPlan } from '@/sites/biznes/components/plan/planData'
import { PlanStats } from '@/sites/biznes/components/plan/PlanStats'
import { DEFAULT_PLAN_LABELS } from '@/sites/biznes/components/plan/types'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

const TITLE = 'Plan Twojej firmy — co ustawimy w Twoim lokalu'
const DESCRIPTION =
  'Wybierz rodzaj firmy i zobacz na planie lokalu, gdzie stanie kasa, terminal, komputer czy router. Całość dodasz do zapytania jednym kliknięciem.'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'biznes')
  const settings = await getSiteSettings(tenant.id)
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PLAN_PATH },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: PLAN_PATH,
      title: TITLE,
      description: DESCRIPTION,
      images: ogImages(settings?.seo.ogImage ?? null, 'biznes'),
    },
  }
}

/**
 * „Plan Twojej firmy” `/plan-firmy` (K31d′, spec. §6.12, `k4/boards/Web-Plan`): the heading with
 * the counts from the database and the plan component — the same one as on the home page. The
 * scene is picked in the browser (`?scena=`), so the page stays static. No scene → 404.
 */
export default async function PlanPage({ params }: Props) {
  const tenant = await requireLine(params, 'biznes')
  const [data, origin] = await Promise.all([loadFloorPlan(tenant.id), requestOrigin()])
  if (!data) notFound()
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Plan Twojej firmy', href: PLAN_PATH },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
          ]),
        }}
      />
      <Container wide className="pt-5 pb-14 sm:pt-6 sm:pb-20">
        <Breadcrumbs items={crumbs} />
        <header className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
              <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
              Plan Twojej firmy
            </p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-extrabold tracking-tight text-balance text-ink">
              Zobacz, co ustawimy w Twoim lokalu.
            </h1>
          </div>
          <div>
            <p className="text-[16px] leading-relaxed text-ink-2">
              Wybierz rodzaj firmy i kliknij urządzenie. Obok zobaczysz film i szczegóły — a całość
              dodasz do zapytania jednym kliknięciem.
            </p>
            <div className="mt-4">
              <PlanStats scenes={data.scenes} />
            </div>
          </div>
        </header>
        <div className="mt-8">
          <FloorPlan data={data} labels={DEFAULT_PLAN_LABELS} />
        </div>
      </Container>
    </>
  )
}
