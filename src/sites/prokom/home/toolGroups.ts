import { z } from 'zod'

import type { HubToolView } from '@/lib/prokom/data'
import type { HubLine } from '@/lib/prokom/lines'

import type { HomeLine } from './model'

const label = z.string().trim().min(1).max(60)

/** The `preview` of a tool as the import stores it (`Narzedzia.json`); anything else = no picture. */
const previewSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('form'), fields: z.array(label).min(1).max(4) }),
  z.object({ kind: z.literal('grid'), tiles: z.array(label).min(1).max(4) }),
  z.object({
    kind: z.literal('rows'),
    rows: z
      .array(z.object({ a: label, b: label }))
      .min(1)
      .max(4),
  }),
  z.object({
    kind: z.literal('steps'),
    steps: z.array(label).min(2).max(5),
    done: z.number().int().min(0),
  }),
  z.object({ kind: z.literal('win'), winText: label }),
])

/** What the card draws: numbered fields, tiles, rows with a state, a step bar or an address bar. */
export type ToolPreview =
  | { kind: 'list'; items: string[] }
  | { kind: 'tiles'; items: string[] }
  | { kind: 'rows'; rows: { label: string; state: string }[] }
  | { kind: 'steps'; steps: string[]; done: number }
  | { kind: 'win'; text: string }

/** The tool's picture from its `preview`; without a valid one, its inputs as numbered fields. */
export function toolPreview(value: unknown, inputs: readonly string[]): ToolPreview | null {
  const parsed = previewSchema.safeParse(value)
  if (!parsed.success) return inputs.length ? { kind: 'list', items: inputs.slice(0, 3) } : null
  const preview = parsed.data
  switch (preview.kind) {
    case 'form':
      return { kind: 'list', items: preview.fields.slice(0, 3) }
    case 'grid':
      return { kind: 'tiles', items: preview.tiles }
    case 'rows':
      return { kind: 'rows', rows: preview.rows.map(({ a, b }) => ({ label: a, state: b })) }
    case 'steps':
      return {
        kind: 'steps',
        steps: preview.steps,
        done: Math.min(preview.done, preview.steps.length - 1),
      }
    case 'win':
      return { kind: 'win', text: preview.winText }
  }
}

export type HomeTool = {
  key: string
  title: string
  desc: string
  badge: string | null
  cta: string | null
  /** The tool's own address, else the line's site (ADR-H002 §3). */
  url: string | null
  preview: ToolPreview | null
}

export type ToolGroup = {
  line: Pick<HomeLine, 'key' | 'label' | 'domain' | 'url' | 'promise'>
  tools: HomeTool[]
}

export type ToolCount = { line: HubLine; name: string; count: number }

/**
 * Order of the line groups in the two-column grid (Krystian 15.11): Biznes | Software,
 * Instalacje | Tech, Gaming | the hub's own tile — the firm lines first, then the home ones.
 */
export const TOOL_GROUP_ORDER: readonly HubLine[] = [
  'biznes',
  'software',
  'instalacje',
  'tech',
  'gaming',
]

/**
 * „Załatw to od razu” (spec §6.1 pkt 4): per line on the page its two home tools
 * (`featuredOnHome`), plus the count of all tools per line for the „wszystkie sprawy” card.
 */
export function toolGroups(
  lines: readonly HomeLine[],
  tools: readonly HubToolView[],
): { groups: ToolGroup[]; counts: ToolCount[]; total: number } {
  // A line missing from the order (a future sixth one) goes last, not first.
  const rank = (key: HubLine) => {
    const index = TOOL_GROUP_ORDER.indexOf(key)
    return index === -1 ? TOOL_GROUP_ORDER.length : index
  }
  const ordered = [...lines].sort((a, b) => rank(a.key) - rank(b.key))
  const groups = ordered.flatMap((line) => {
    const own = tools
      .filter((tool) => tool.line === line.key && tool.featuredOnHome)
      .slice(0, 2)
      .map((tool) => ({
        key: tool.key,
        title: tool.title,
        desc: tool.desc,
        badge: tool.badge,
        cta: tool.ctaLabel,
        url: tool.url ?? line.url,
        preview: toolPreview(tool.preview, tool.inputs),
      }))
    const { key, label, domain, url, promise } = line
    return own.length ? [{ line: { key, label, domain, url, promise }, tools: own }] : []
  })
  const counts = lines
    .map((line) => ({
      line: line.key,
      name: line.name,
      count: tools.filter((tool) => tool.line === line.key).length,
    }))
    .filter((row) => row.count > 0)
  return { groups, counts, total: counts.reduce((sum, row) => sum + row.count, 0) }
}
