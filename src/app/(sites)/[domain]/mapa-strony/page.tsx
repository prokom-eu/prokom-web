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
