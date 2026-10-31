import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { TextLink } from '@/components/ui/TextLink'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { SITE_MAP_PATH, type SiteMapLink } from '@/lib/seo/siteLinks'
import { loadSiteMap } from '@/lib/seo/siteLinksData'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { Breadcrumbs as SoftwareBreadcrumbs } from '@/sites/software/components/Breadcrumbs'

import { requireTenant } from '../tenant'

type Props = { params: Promise<{ domain: string }> }

const TITLE = 'Mapa strony'
const DESCRIPTION =
  'Wszystkie strony serwisu w jednym miejscu: oferta, produkty, aktualności i informacje.'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireTenant(params)
  const settings = await getSiteSettings(tenant.id)
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: SITE_MAP_PATH },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: SITE_MAP_PATH,
      title: TITLE,
      description: DESCRIPTION,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

function Links({ links }: { links: readonly SiteMapLink[] }) {
  return (
    <ul className="columns-1 gap-8 sm:columns-2 lg:columns-3">
      {links.map((link) => (
        <li key={link.href} className="break-inside-avoid py-1">
          {/* Plain links: hundreds of `next/link`s would all prefetch on scroll. */}
          <TextLink href={link.href} className="font-medium no-underline hover:underline">
            {link.label}
          </TextLink>
        </li>
      ))}
    </ul>
  )
}

/**
 * HTML site map `/mapa-strony` (spec. §2) — a route of every line, built from the same list as
 * its `sitemap.xml` (`lib/seo/siteLinks`), so only the site's own public addresses appear.
 */
export default async function SiteMapPage({ params }: Props) {
  const tenant = await requireTenant(params)
  const sections = await loadSiteMap(tenant)
  if (tenant.line === 'software') return <SoftwareSiteMap sections={sections} />
  return (
    <Container className="py-12 sm:py-16">
      {/* Breadcrumbs like every Biznes subpage; other lines have none yet. */}
      {tenant.line === 'biznes' && (
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { name: 'Strona główna', href: '/' },
              { name: TITLE, href: SITE_MAP_PATH },
            ]}
          />
        </div>
      )}
      <Heading level={1} size="xl">
        {TITLE}
      </Heading>
      <p className="mt-4 max-w-[60ch] text-lg text-ink-2">{DESCRIPTION}</p>
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`mapa-${section.id}`} className="mt-12">
          <Heading level={2} size="lg" id={`mapa-${section.id}`}>
            {section.title}
          </Heading>
          {section.links.length > 0 && (
            <div className="mt-4">
              <Links links={section.links} />
            </div>
          )}
          {section.groups?.map((group) => (
            <div key={group.title} className="mt-6">
              <Heading level={3} size="md">
                {group.title}
              </Heading>
              <div className="mt-2">
                <Links links={group.links} />
              </div>
            </div>
          ))}
        </section>
      ))}
    </Container>
  )
}

/**
 * Software look (spec. §6.11: „jak Biznes”, the same list): breadcrumbs and H1 of the line's
 * subpages, every section a card. No board — the frame and cards follow `Polityka`.
 */
function SoftwareSiteMap({ sections }: { sections: Awaited<ReturnType<typeof loadSiteMap>> }) {
  return (
    <section className="pt-6 pb-14 min-[641px]:pt-10 min-[641px]:pb-20">
      <Container wide>
        <SoftwareBreadcrumbs current={TITLE} />
        <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,64px)]">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-ink-2 min-[641px]:text-xl">
          Wszystkie strony PRO-KOM Software w jednym miejscu: rozwiązania, branże, cennik,
          aktualności i informacje.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`mapa-${section.id}`}
              className="rounded-[24px] border border-border bg-card p-[18px] min-[641px]:p-7"
            >
              <h2
                id={`mapa-${section.id}`}
                className="font-display text-2xl font-extrabold tracking-tight min-[641px]:text-[28px]"
              >
                {section.title}
              </h2>
              {section.links.length > 0 && (
                <div className="mt-3">
                  <Links links={section.links} />
                </div>
              )}
              {section.groups?.map((group) => (
                <div key={group.title} className="mt-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2">
                    {group.title}
                  </h3>
                  <div className="mt-2">
                    <Links links={group.links} />
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </section>
  )
}
