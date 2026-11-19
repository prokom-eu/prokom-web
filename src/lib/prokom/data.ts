import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import type { z } from 'zod'
import { cache } from 'react'

import type { HubHelp, HubPlan, HubService, HubSetting, HubTool } from '@/payload-types'

import { cacheQuery } from '../cache'
import { getEnv } from '../env'
import { log } from '../log'
import type { PublicImage } from '../media/public'
import { PAGE_CACHE_SECONDS } from '../pages/data'
import { getSiteSettings } from '../site/data'
import type { HubLine } from './lines'
import { brandsSchema, type HubBrands } from './brands'
import { cooperationSchema, type HubCooperation } from './cooperation'
import { deliveriesSchema, type HubDeliveries } from './deliveries'
import { homeSchema, type HubHome } from './home'
import { forBusinessSchema, type HubForBusiness } from './forBusiness'
import { forHomeSchema, type HubForHome } from './forHome'
import { offerSchema, type HubOffer } from './offer'
import { NO_OPTIONAL_PAGES, type HubPageFlags } from './pages'
import { hubTag } from './tags'

/** Far above the package (49 services, 33 plans); every list is one page without paging. */
const MAX_ROWS = 300

export type HubServiceView = {
  key: string
  line: HubLine
  title: string
  short: string
  long: string | null
  audience: HubService['audience']
  includes: string[]
  related: string[]
  keywords: string | null
  url: string | null
  ctaLabel: string | null
}

export type HubToolView = {
  key: string
  line: HubLine
  action: HubTool['action']
  title: string
  desc: string
  inputs: string[]
  result: string | null
  ctaLabel: string | null
  url: string | null
  badge: string | null
  preview: unknown
  featuredOnHome: boolean
}

export type HubHelpView = {
  slug: string
  group: string
  line: HubLine
  title: string
  steps: string[]
  prep: string[]
  ctaLabel: string | null
  relatedTool: string | null
  seoTitle: string | null
  seoDescription: string | null
}

export type HubPlanView = {
  key: string
  type: HubPlan['type']
  name: string
  title: string | null
  lead: string | null
  groups: { line: HubLine; points: string[] }[]
  start: string[]
  questions: string[]
  steps: string[]
  call: HubLine | null
}

export type HubData = {
  services: HubServiceView[]
  tools: HubToolView[]
  help: HubHelpView[]
  plans: HubPlanView[]
}

/**
 * The only filter of every hub query: this tenant and the published version (ADR-H001 pkt 5,
 * CLAUDE.md „zawsze z filtrem tenanta”). A draft, or a record of another tenant, never leaves.
 */
export function hubWhere(tenantId: number, extra?: Where): Where {
  const base: Where[] = [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }]
  return { and: extra ? [...base, extra] : base }
}

const list = (value: readonly string[] | null | undefined): string[] => [...(value ?? [])]
const keyOf = (value: unknown, keys: Map<number, string>): string | null =>
  typeof value === 'number' ? (keys.get(value) ?? null) : null

/** Projection of the stored records (depth 0) to what the hub pages read. */
export function toHubData(docs: {
  services: HubService[]
  tools: HubTool[]
  help: HubHelp[]
  plans: HubPlan[]
}): HubData {
  // Only visible services: a hidden one must not show up among the related ones of another.
  const serviceKeys = new Map(
    docs.services.filter((doc) => doc.visible !== false).map((doc) => [doc.id, doc.key]),
  )
  const toolKeys = new Map(docs.tools.map((doc) => [doc.id, doc.key]))
  return {
    services: docs.services
      .filter((doc) => doc.visible !== false)
      .map((doc) => ({
        key: doc.key,
        line: doc.line,
        title: doc.title,
        short: doc.short,
        long: doc.long ?? null,
        audience: doc.audience,
        includes: list(doc.includes),
        related: (doc.related ?? []).flatMap((id) => keyOf(id, serviceKeys) ?? []),
        keywords: doc.keywords ?? null,
        url: doc.url ?? null,
        ctaLabel: doc.ctaLabel ?? null,
      })),
    tools: docs.tools.map((doc) => ({
      key: doc.key,
      line: doc.line,
      action: doc.action,
      title: doc.title,
      desc: doc.desc,
      inputs: list(doc.inputs),
      result: doc.result ?? null,
      ctaLabel: doc.ctaLabel ?? null,
      url: doc.url ?? null,
      badge: doc.badge ?? null,
      preview: doc.preview ?? null,
      featuredOnHome: Boolean(doc.featuredOnHome),
    })),
    help: docs.help.map((doc) => ({
      slug: doc.slug,
      group: doc.group,
      line: doc.line,
      title: doc.title,
      steps: list(doc.steps),
      prep: list(doc.prep),
      ctaLabel: doc.ctaLabel ?? null,
      relatedTool: keyOf(doc.relatedTool, toolKeys),
      seoTitle: doc.seoTitle ?? null,
      seoDescription: doc.seoDescription ?? null,
    })),
    plans: docs.plans.map((doc) => ({
      key: doc.key,
      type: doc.type,
      name: doc.name,
      title: doc.title ?? null,
      lead: doc.lead ?? null,
      groups: (doc.groups ?? []).map((group) => ({ line: group.line, points: list(group.points) })),
      start: list(doc.start),
      questions: list(doc.questions),
      steps: list(doc.steps),
      call: doc.call ?? null,
    })),
  }
}

/**
 * Hub content of one tenant (ADR-H002 §3), cached per tenant (`hubTag`, refreshed by the panel
 * hooks, otherwise after `PAGE_CACHE_SECONDS`). Collections are read in their panel order.
 */
export const getHubData = cache((tenantId: number): Promise<HubData> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const query = { where: hubWhere(tenantId), limit: MAX_ROWS, depth: 0, overrideAccess: true }
      const [services, tools, help, plans] = await Promise.all([
        payload.find({ collection: 'hub-services', sort: 'order', ...query }),
        payload.find({ collection: 'hub-tools', sort: 'order', ...query }),
        payload.find({ collection: 'hub-help', sort: 'order', ...query }),
        payload.find({ collection: 'hub-plans', sort: 'order', ...query }),
      ])
      return toHubData({
        services: services.docs,
        tools: tools.docs,
        help: help.docs,
        plans: plans.docs,
      })
    },
    ['hub-data', String(tenantId)],
    { tags: [hubTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )(),
)

export type HubSettingsView = {
  pages: HubPageFlags
  /** Company facts; on production only the approved ones (spec §3). */
  trust: { value: string; label: string }[]
  /** `null` until filled in the panel (or when the stored value no longer fits the schema). */
  home: HubHome | null
  brands: HubBrands | null
  deliveries: HubDeliveries | null
  cooperation: HubCooperation | null
  offer: HubOffer | null
  forBusiness: HubForBusiness | null
  forHome: HubForHome | null
  /** Landline numbers shown modestly on `/kontakt` (decision 15.11: the same as Google). */
  extraPhones: { label: string; number: string; techPoint: string | null }[]
  /** Zakopane: only the Tech service there — not a company salon (decision 15.11). */
  branch: HubBranch | null
}

export type HubBranch = {
  name: string
  street: string
  postalCode: string
  city: string
  phone: string | null
  note: string | null
}

type SiteEnv = 'production' | 'staging' | 'local'

/** Projection of `HubSettings`: missing document or field = v1.1 pages off, no facts. */
export function toHubSettings(
  doc:
    | Pick<
        HubSetting,
        | 'pages'
        | 'trust'
        | 'home'
        | 'brands'
        | 'deliveries'
        | 'cooperation'
        | 'offer'
        | 'forBusiness'
        | 'forHome'
        | 'extraPhones'
        | 'branch'
      >
    | null
    | undefined,
  siteEnv: SiteEnv,
  tenantId: number | null = null,
): HubSettingsView {
  const pages = { ...NO_OPTIONAL_PAGES }
  for (const key of Object.keys(pages) as (keyof HubPageFlags)[]) {
    pages[key] = doc?.pages?.[key] === true
  }
  const trust = (doc?.trust ?? [])
    .filter((row) => siteEnv !== 'production' || row.approved === true)
    .map((row) => ({ value: row.value, label: row.label }))
  return {
    pages,
    trust,
    home: pageTexts(homeSchema, doc?.home, 'home', tenantId),
    brands: pageTexts(brandsSchema, doc?.brands, 'brands', tenantId),
    deliveries: pageTexts(deliveriesSchema, doc?.deliveries, 'deliveries', tenantId),
    cooperation: pageTexts(cooperationSchema, doc?.cooperation, 'cooperation', tenantId),
    offer: pageTexts(offerSchema, doc?.offer, 'offer', tenantId),
    forBusiness: pageTexts(forBusinessSchema, doc?.forBusiness, 'forBusiness', tenantId),
    forHome: pageTexts(forHomeSchema, doc?.forHome, 'forHome', tenantId),
    extraPhones: (doc?.extraPhones ?? []).map(({ label, number, techPoint }) => ({
      label,
      number,
      techPoint: techPoint?.trim() || null,
    })),
    branch: toBranch(doc?.branch),
  }
}

const filled = (value: string | null | undefined) => (value?.trim() ? value.trim() : null)

/** A branch only when switched on and with an address to show. */
function toBranch(branch: HubSetting['branch']): HubBranch | null {
  const street = filled(branch?.street)
  const city = filled(branch?.city)
  if (branch?.published !== true || !street || !city) return null
  return {
    name: filled(branch.name) ?? city,
    street,
    postalCode: filled(branch.postalCode) ?? '',
    city,
    phone: filled(branch.phone),
    note: filled(branch.note),
  }
}

/**
 * A page's JSON read through its schema. The panel checks it on save, but a later schema change
 * can leave stored texts behind — then the page shows its empty state and the log says why (no
 * personal data here: marketing texts only). A schema change must move the data in the same PR.
 */
function pageTexts<T>(
  schema: z.ZodType<T>,
  value: unknown,
  field: 'home' | 'brands' | 'deliveries' | 'cooperation' | 'offer' | 'forBusiness' | 'forHome',
  tenantId: number | null,
): T | null {
  if (value === null || value === undefined) return null
  const result = schema.safeParse(value)
  if (result.success) return result.data
  log.warn(
    { tenant: tenantId, field, path: result.error.issues[0]?.path.join('.') ?? '' },
    'HubSettings page texts do not match the schema',
  )
  return null
}

/** `HubSettings` of one tenant, cached with the hub content (`hubTag`). */
export const getHubSettings = cache((tenantId: number): Promise<HubSettingsView> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'hub-settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      return toHubSettings(docs[0], getEnv().SITE_ENV, tenantId)
    },
    ['hub-settings', String(tenantId)],
    { tags: [hubTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )(),
)

/** Link preview picture of the hub: the panel's „Obraz OG”, else the hub's file (`defaultOgImage`). */
export async function hubOgImage(tenantId: number): Promise<PublicImage | null> {
  return (await getSiteSettings(tenantId))?.seo.ogImage ?? null
}
