import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { HubHelp, HubPlan, HubService, HubTool } from '@/payload-types'

import { cacheQuery } from '../cache'
import { PAGE_CACHE_SECONDS } from '../pages/data'
import type { HubLine } from './lines'
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
  const serviceKeys = new Map(docs.services.map((doc) => [doc.id, doc.key]))
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
