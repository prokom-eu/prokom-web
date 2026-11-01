import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import { brandPageHref } from '@/lib/catalog/brand'
import { bundleCard, listBundles } from '@/lib/catalog/bundle'
import { cardIcon, productHref } from '@/lib/catalog/card'
import { categoryHref, VENDING_PATH } from '@/lib/catalog/category'
import { getBundles, getCatalogIndex, getFloorPlans, getWizardRules } from '@/lib/catalog/data'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { buildPlanScenes } from '@/lib/catalog/floorPlan'
import type { Wizard } from '@/lib/catalog/wizard'
import {
  CONFIGURATOR_PATH,
  emptyWizardState,
  parseKr,
  runWizard,
  type WizardState,
} from '@/lib/catalog/wizardEngine'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { Configurator } from '@/sites/biznes/components/configurator/Configurator'
import { linkKey, type ConfiguratorProduct } from '@/sites/biznes/components/configurator/types'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = {
  title: 'Konfigurator — dobierz rozwiązanie dla firmy',
  description:
    'Trzy krótkie pytania o Twoją firmę i wynik: kasa, terminal, program, komputery i sieć dobrane z uzasadnieniem. Bez rejestracji — do zapytania trafia tylko to, co wybierzesz.',
  alternates: { canonical: CONFIGURATOR_PATH },
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

/** Every product slug the rules can propose. */
function ruleSlugs(rules: Wizard): Set<string> {
  const slugs = new Set<string>()
  const addAll = (list: readonly string[] | undefined) => list?.forEach((slug) => slugs.add(slug))
  for (const rec of Object.values(rules.recommendations)) {
    addAll(rec.products)
    Object.values(rec.byFirm).forEach(addAll)
    Object.values(rec.byScale).forEach(addAll)
  }
  for (const questions of Object.values(rules.questions)) {
    for (const q of questions) Object.values(q.overrides).forEach(addAll)
  }
  return slugs
}

/**
 * Konfigurator 3.0 `/konfigurator` (K35 §1, ADR-017 D-K4-1, D-K4-4, boards `Web-Kreator*`): rules,
 * the products they can propose (listed on the site), bundles, plan scenes and the form token on
 * the server; the steps, the result and the form are one client island. `?kr=` opens the result,
 * `?firma=` (industry pages) picks the kind of firm; an unknown one is ignored.
 */
export default async function ConfiguratorPage({ params, searchParams }: Props) {
  const tenant = await requireLine(params, 'biznes')
  // The token carries the render time (minimum fill time): never from a cache.
  await connection()
  const [rules, index, settings, query, allBundles, plans] = await Promise.all([
    getWizardRules(tenant.id),
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
    getBundles(tenant.id),
    getFloorPlans(tenant.id),
  ])
  // No valid rules in the panel yet: there is no configurator to show.
  if (!rules) notFound()

  const fromLink = first(query.kr)
  const linked = fromLink ? parseKr(rules, fromLink) : null
  const firm = first(query.firma)
  const state: WizardState = linked ?? {
    ...emptyWizardState(),
    firm: firm && rules.firms.some((f) => f.id === firm) ? firm : null,
  }

  const wanted = ruleSlugs(rules)
  const brands = new Map(index.brands.map((brand) => [brand.slug, brand.name]))
  const products: Record<string, ConfiguratorProduct> = {}
  for (const product of index.products) {
    if (!wanted.has(product.slug)) continue
    products[product.slug] = {
      slug: product.slug,
      name: product.name,
      brand: product.brand ? (brands.get(product.brand) ?? null) : null,
      benefit: product.benefit ?? null,
      features: product.features.slice(0, 3),
      image: product.image ?? null,
      icon: cardIcon(product, index),
      href: productHref(product.slug),
    }
  }

  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  // A link whose result is empty here (its products unpublished meanwhile): the details, not an
  // empty „Twój zestaw jest gotowy”.
  const linkedNeeds = linked
    ? runWizard(rules, linked, (slug) => slug in products, []).needs.length
    : 0
  const step = linked ? (linkedNeeds > 0 ? 3 : 2) : state.firm ? 1 : 0
  const listed = listBundles(allBundles, new Set(bySlug.keys()))
  const bundleCards = Object.fromEntries(
    listed.map((bundle) => [bundle.slug, bundleCard(bundle, bySlug)]),
  )
  const sceneTitles = Object.fromEntries(
    buildPlanScenes(plans.records, new Set(bySlug.keys())).map((scene) => [
      scene.slug,
      scene.title,
    ]),
  )

  // Result links of the needs (board `l`): only those that lead somewhere on this site.
  const links: Record<string, string> = {}
  const categories = new Set(index.categories.map((category) => category.slug))
  const pages: Partial<Record<string, string>> = {
    gopos: '/gopos',
    insert: '/insert',
    opieka: '/opieka-it',
    vending: VENDING_PATH,
  }
  for (const rec of Object.values(rules.recommendations)) {
    for (const link of rec.links) {
      const key = linkKey(link.kind, link.target)
      const page = pages[link.kind]
      if (page) links[key] = page
      if (link.kind === 'oferta') {
        links[key] =
          link.target && categories.has(link.target) ? categoryHref(link.target) : CATALOG_PATH
      }
      if (link.kind === 'marka' && link.target) {
        const name = link.target.toLowerCase()
        const brand = index.brands.find((b) => b.name.toLowerCase() === name)
        const href = brand ? brandPageHref(index, brand.slug) : null
        if (href) links[key] = href
      }
    }
  }

  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null

  return (
    <Container wide className="pt-5 pb-28 sm:pt-6 sm:pb-24">
      <Breadcrumbs
        items={[
          { name: 'Strona główna', href: '/' },
          { name: 'Konfigurator', href: CONFIGURATOR_PATH },
        ]}
      />
      <Configurator
        data={{
          rules,
          products,
          bundles: listed.map(({ slug, area, level }) => ({ slug, area, level })),
          bundleCards,
          sceneTitles,
          links,
          initial: { state, step },
          formToken: issueFormToken(getEnv().PAYLOAD_SECRET),
          phone: phone && tel ? { label: phone, href: tel } : null,
          callbackTime: settings?.biznes?.promises.callbackTime?.trim() || null,
        }}
      />
    </Container>
  )
}
