import { isHttpsUrl } from '../../lib/site/link'
import { isSvgPath } from '../../lib/catalog/svg'
import type { Showroom } from '../../payload-types'
import { k4BrandSlug, type K4BrandsFile } from './k4Brands'
import type { ProductId } from './k31Plans'

/**
 * K4a-2: showrooms 2.0 of `salony-k4.json` (→ `Showrooms`, K4-FINAL §6, D-K4-3). Pure functions;
 * `run.ts` gives them the record ids. Products are named by `slug_seed` (K4 already uses the
 * split cards); a slug without a record is left out and reported, never stored as a gap.
 */

type K4Plans = {
  big?: boolean
  eb?: string
  h: string
  lead?: string
  altH?: string
  it: { t: string; k?: string; f: string[]; p?: string; tag?: string; alt?: boolean }[]
}

export type K4Showroom = {
  marka?: string
  brands?: string[]
  title?: string
  pill?: string
  pillM?: string
  h1a: string
  h1b?: string
  lead?: string
  hero: string[]
  heroLab?: string[]
  heroCard?: { t: string; it: string[][]; chips?: string[] }
  fk: string[][]
  plans?: K4Plans
  plans2?: K4Plans
  cmp?: { h: string; cols: string[]; rows: (string | (string | number)[])[][] }
  fam?: { t: string; ic?: string; p: string[] }[]
  dob?: { q: string; o: { t: string; p: string[]; w?: string }[] } | null
  serwis?: { t: string; d?: string; it: { t: string; d?: string }[]; p?: string[] }
  extra?: { t: string; d?: string; b?: string; act?: string; steps: string[][]; p?: string[] }
  fakty?: { k: string; v: string; src?: string }[]
  opis?: string[]
  faq?: { q: string; a: string }[]
  hFaq?: string
  hFakty?: string
  hOferta?: string
  hMore?: string
  hAsk?: string
}

export type ShowroomData = Omit<Showroom, 'id' | 'tenant' | 'updatedAt' | 'createdAt'>

/** Themed showrooms join several brands (D-K4-1): their own addresses under `/marki/`. */
export const THEMED_SHOWROOM_SLUGS: Record<string, string> = {
  Druk: 'druk',
  Sieć: 'siec',
  NAS: 'nas',
  Niszczarki: 'niszczarki',
}

/**
 * Buttons of the rollout block that lead to a page (the package has no address for them);
 * any other button opens the inquiry (`act: "kontakt"`).
 */
const ROLLOUT_LINKS: Record<string, string> = { 'Zobacz GoPOS': '/gopos' }

const fail = (message: string): never => {
  throw new Error(`Seed (K4 salony): ${message}`)
}

const text = (value: string | undefined | null) => value?.trim() || null

/** Address of a showroom: themed → its own; a brand's → the brand's address. */
export function showroomSlug(key: string, brands: K4BrandsFile): string {
  const themed = THEMED_SHOWROOM_SLUGS[key]
  if (themed) return themed
  if (!brands.marki[key]) fail(`showroom "${key}" is neither themed nor a brand.`)
  return k4BrandSlug(key, brands)
}

/** Brands of a showroom, in the package order. */
export function showroomBrands(key: string, showroom: K4Showroom): string[] {
  const names = showroom.brands ?? (showroom.marka ? [showroom.marka] : [])
  return names.length ? names : fail(`showroom "${key}" names no brand.`)
}

export function k4ShowroomData(
  key: string,
  showroom: K4Showroom,
  order: number,
  refs: { brands: K4BrandsFile; partner: (name: string) => number | undefined; product: ProductId },
): { data: ShowroomData; unknown: string[] } {
  const where = `showroom "${key}"`
  const unknown = new Set<string>()
  const product = (slug: string) => {
    const id = refs.product(slug)
    if (id === undefined) unknown.add(slug)
    return id
  }
  const products = (slugs: string[] | undefined) => [
    ...new Set((slugs ?? []).flatMap((slug) => product(slug) ?? [])),
  ]
  const icon = (path: string | undefined) => {
    if (!path) return null
    return isSvgPath(path) ? path : fail(`${where}: icon is not an SVG path.`)
  }
  const pair = ([title, line]: string[]) => ({
    title: title ?? fail(`${where}: empty item.`),
    text: text(line),
  })
  const plans = (plans: K4Plans | undefined) => ({
    eyebrow: text(plans?.eb),
    title: text(plans?.h),
    big: plans?.big ?? false,
    lead: text(plans?.lead),
    altTitle: text(plans?.altH),
    items: (plans?.it ?? []).map((item) => ({
      name: item.t,
      audience: text(item.k),
      product: item.p ? (product(item.p) ?? null) : null,
      features: item.f,
      tag: text(item.tag),
      alt: item.alt ?? false,
    })),
  })
  const button = showroom.extra?.b
  const buttonHref =
    !button || showroom.extra?.act === 'kontakt'
      ? null
      : (ROLLOUT_LINKS[button] ?? fail(`${where}: button "${button}" has no address.`))

  const data: ShowroomData = {
    name: text(showroom.title) ?? showroom.marka ?? key,
    slug: showroomSlug(key, refs.brands),
    order,
    brands: showroomBrands(key, showroom).map(
      (name) => refs.partner(name) ?? fail(`${where}: brand "${name}" has no record.`),
    ),
    pill: text(showroom.pill),
    pillMobile: text(showroom.pillM),
    h1a: showroom.h1a,
    h1b: text(showroom.h1b),
    lead: text(showroom.lead),
    hero: showroom.hero.flatMap((slug, index) => {
      const id = product(slug)
      return id === undefined ? [] : [{ product: id, label: text(showroom.heroLab?.[index]) }]
    }),
    heroCard: {
      title: text(showroom.heroCard?.t),
      items: (showroom.heroCard?.it ?? []).map(pair),
      chips: showroom.heroCard?.chips ?? [],
    },
    facts: showroom.fk.map(([value, label]) => ({
      value: value ?? fail(`${where}: empty fact.`),
      label: text(label),
    })),
    plans: plans(showroom.plans),
    morePlans: plans(showroom.plans2),
    compare: {
      title: text(showroom.cmp?.h),
      columns: showroom.cmp?.cols ?? [],
      rows: (showroom.cmp?.rows ?? []).map(([label, values]) => {
        if (typeof label !== 'string' || !Array.isArray(values)) {
          return fail(`${where}: comparison row is not [label, values].`)
        }
        if (values.length !== showroom.cmp!.cols.length) {
          fail(
            `${where}: row "${label}" has ${values.length} values for ${showroom.cmp!.cols.length} columns.`,
          )
        }
        return { label, values: values.map(String) }
      }),
    },
    family: (showroom.fam ?? []).map((tab) => ({
      title: tab.t,
      iconPath: icon(tab.ic),
      products: products(tab.p),
    })),
    chooser: {
      question: text(showroom.dob?.q),
      options: (showroom.dob?.o ?? []).map((option) => ({
        label: option.t,
        products: products(option.p),
        why: text(option.w),
      })),
    },
    service: {
      title: text(showroom.serwis?.t),
      description: text(showroom.serwis?.d),
      items: (showroom.serwis?.it ?? []).map((item) => pair([item.t, item.d ?? ''])),
      products: products(showroom.serwis?.p),
    },
    rollout: {
      title: text(showroom.extra?.t),
      description: text(showroom.extra?.d),
      steps: (showroom.extra?.steps ?? []).map(pair),
      button: text(button),
      buttonHref,
      products: products(showroom.extra?.p),
    },
    about: (showroom.opis ?? []).map((paragraph) => ({ text: paragraph })),
    brandFacts: (showroom.fakty ?? []).map((fact) => {
      if (fact.src && !isHttpsUrl(fact.src)) fail(`${where}: source "${fact.src}" is not https.`)
      return { label: fact.k, value: fact.v, sourceUrl: text(fact.src) }
    }),
    faq: (showroom.faq ?? []).map(({ q, a }) => ({ question: q, answer: a })),
    headings: {
      faq: text(showroom.hFaq),
      facts: text(showroom.hFakty),
      offer: text(showroom.hOferta),
      more: text(showroom.hMore),
      ask: text(showroom.hAsk),
    },
  }
  return { data, unknown: [...unknown] }
}
