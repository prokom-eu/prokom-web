import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import { getCatalogIndex, getWizardRules } from '@/lib/catalog/data'
import type { KitProduct } from '@/lib/catalog/wizardKit'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { WizardFlow } from '@/sites/biznes/components/wizard/WizardFlow'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// A tool, not content: like `/zapytanie`, nothing to index.
export const metadata: Metadata = {
  title: 'Dobierz zestaw w 60 sekund',
  description: 'Kreator zestawu dla firmy: 4 pytania i propozycja sprzętu, programów i usług.',
  robots: { index: false, follow: true },
}

/**
 * The offer wizard `/kreator` (spec. §6.8, board `Kreator`): rules, the proposed products and
 * the form token on the server; the steps and the live kit are one client island. `?firma=`
 * (industry pages, ADR-012 rozstrz. 8) chooses the business type; an unknown one is ignored.
 */
export default async function WizardPage({ params, searchParams }: Props) {
  const tenant = await requireLine(params, 'biznes')
  // The token carries the render time (minimum fill time): never from a cache.
  await connection()
  const [rules, index, settings, query] = await Promise.all([
    getWizardRules(tenant.id),
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
  ])
  // No valid rules in the panel yet: there is no wizard to show.
  if (!rules) notFound()

  const raw = query.firma
  const firma = Array.isArray(raw) ? raw[0] : raw
  const initialType = rules.businessTypes.find((type) => type.id === firma)?.id ?? null
  // Only the proposed products, published on this site (catalog index), go to the browser.
  const proposed = new Set(
    Object.values(rules.proposals).flatMap((byType) => Object.values(byType)),
  )
  const products: KitProduct[] = index.products
    .filter((product) => proposed.has(product.slug))
    .map(({ slug, name, benefit, image }) => ({
      slug,
      name,
      ...(benefit && { benefit }),
      ...(image && { image }),
    }))
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null

  return (
    <Container wide className="pt-5 pb-16 sm:pt-8 sm:pb-24">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { name: 'Strona główna', href: '/' },
            { name: 'Kreator zestawu', href: '/kreator' },
          ]}
        />
      </div>
      <WizardFlow
        rules={rules}
        products={products}
        initialType={initialType}
        formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
        phone={phone && tel ? { label: phone, href: tel } : null}
        callbackTime={settings?.biznes?.promises.callbackTime ?? null}
      />
    </Container>
  )
}
