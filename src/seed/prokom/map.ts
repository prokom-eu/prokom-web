/*
 * The hub's design package (`seed/prokomeu/strony/*.json`, snapshots of the boards) → records of
 * `hub-services`, `hub-tools`, `hub-help` and `hub-plans` (ADR-H002 §3). Pure functions, so the
 * counts and the exceptions are tested without a database; `run.ts` writes the result.
 */
import type { HubHelp, HubPlan, HubService, HubSetting, HubTool } from '../../payload-types'
import { isHubLine, type HubLine } from '../../lib/prokom/lines'
import { normalizeText } from '../../lib/shared/search/normalize'
import dlaDomu from '../../../seed/prokomeu/strony/DlaDomu.json'
import dlaFirm from '../../../seed/prokomeu/strony/DlaFirm.json'
import linie from '../../../seed/prokomeu/strony/Linie.json'
import main from '../../../seed/prokomeu/strony/Main.json'
import narzedzia from '../../../seed/prokomeu/strony/Narzedzia.json'
import pomoc from '../../../seed/prokomeu/strony/Pomoc.json'

type Seeded<T> = Omit<T, 'id' | 'tenant' | 'updatedAt' | 'createdAt' | 'related' | 'relatedTool'>
export type ServiceSeed = Seeded<HubService> & { relatedKeys: string[] }
export type ToolSeed = Seeded<HubTool>
export type HelpSeed = Seeded<HubHelp>
export type PlanSeed = Seeded<HubPlan>

/** `Kasa fiskalna nie drukuje` → `kasa-fiskalna-nie-drukuje`. */
export function slugOf(text: string): string {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function line(value: string): HubLine {
  if (!isHubLine(value)) throw new Error(`Nieznana linia w paczce huba: ${value}`)
  return value
}

const DOMAINS: Record<HubLine, string> = Object.fromEntries(
  linie.lines.map((entry) => [line(entry.key), entry.domain]),
) as Record<HubLine, string>

const AUDIENCE: Record<string, HubService['audience']> = { f: 'firma', d: 'dom', fd: 'oba' }

/**
 * Services that lead to a hub page instead of the line's home (ADR-H002 §3). Other addresses of
 * the lines' subpages are filled in the panel after the lines start.
 */
export const SERVICE_EXCEPTIONS: Record<string, { url: string; ctaLabel: string }> = {
  b11: { url: '/inwestycje-i-dostawy', ctaLabel: 'Złóż listę zapytania' },
  b12: { url: '/inwestycje-i-dostawy', ctaLabel: 'Złóż listę zapytania' },
  i10: { url: '/wspolpraca', ctaLabel: 'Współpraca z pracownią' },
}

type ServiceTuple = [string, string, string, string, string, string, string[], string[], string]

export function hubServices(): ServiceSeed[] {
  return (linie.services as ServiceTuple[]).map(
    ([key, lineKey, title, short, long, aud, includes, related, keywords], index) => {
      const own = line(lineKey)
      const audience = AUDIENCE[aud]
      if (!audience) throw new Error(`Nieznane „dla kogo” usługi ${key}: ${aud}`)
      const exception = SERVICE_EXCEPTIONS[key]
      return {
        key,
        line: own,
        title,
        short,
        long,
        audience,
        includes,
        relatedKeys: related,
        keywords,
        url: exception?.url ?? `https://${DOMAINS[own]}`,
        ctaLabel: exception?.ctaLabel ?? `Zobacz na ${DOMAINS[own]}`,
        order: (index + 1) * 10,
        visible: true,
        _status: 'published',
      }
    },
  )
}

/** Two tools per line on the home page and in the mega menu (board Naglowek, „Online:”). */
export const FEATURED_TOOLS: Record<HubLine, readonly string[]> = {
  biznes: ['Plan Twojej firmy', 'Konfigurator'],
  instalacje: ['Zaplanuj instalację', 'Zgłoś awarię instalacji'],
  software: ['Policz swój projekt', 'Darmowy audyt strony'],
  tech: ['Zgłoś naprawę', 'Status naprawy'],
  gaming: ['Konfigurator', 'Dobór pod grę'],
}

type ToolTuple = [string, string, string, string, string[], string, string, unknown, string]

export function hubTools(): ToolSeed[] {
  return (narzedzia.data as ToolTuple[]).map(
    ([lineKey, action, title, desc, inputs, result, ctaLabel, preview, badge], index) => {
      const own = line(lineKey)
      return {
        key: `${own}-${slugOf(title)}`,
        line: own,
        action: action as ToolSeed['action'],
        title,
        desc,
        inputs,
        result,
        ctaLabel,
        // TODO(krystian): głębokie linki do narzędzi linii — do uzupełnienia w panelu po starcie
        // linii; puste = formularz kontaktu z tematem (ADR-H002 §3).
        url: null,
        badge: badge || null,
        preview: preview as ToolSeed['preview'],
        featuredOnHome: FEATURED_TOOLS[own].includes(title),
        order: (index + 1) * 10,
        _status: 'published',
      }
    },
  )
}

export function hubHelp(): HelpSeed[] {
  return pomoc.cases.map((entry, index) => ({
    slug: slugOf(entry.title),
    group: entry.g,
    line: line(entry.l),
    title: entry.title,
    steps: entry.steps,
    prep: entry.prep,
    ctaLabel: entry.cta,
    order: (index + 1) * 10,
    _status: 'published',
  }))
}

const SHORT_LINES: Record<string, HubLine> = {
  b: 'biznes',
  i: 'instalacje',
  s: 'software',
  t: 'tech',
}

type Groups = Record<string, string[] | undefined>
const groupsOf = (groups: Groups, keys: Record<string, HubLine> | null) =>
  Object.entries(groups)
    .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
    .map(([key, points]) => ({ line: keys ? line(keys[key] ?? key) : line(key), points }))

/**
 * Personas of the home page (`Main.json`), industries of `/dla-firm` (`DlaFirm.json`) and home
 * situations (`DlaDomu.json`) as separate records (decision 14.11): the boards give the personas and
 * industries different sets of keys and different points.
 */
export function hubPlans(): PlanSeed[] {
  const personas: PlanSeed[] = main.personas.map((entry, index) => ({
    key: entry.key,
    type: 'persona',
    name: entry.name,
    title: entry.title,
    groups: groupsOf(entry.g as Groups, null),
    order: (index + 1) * 10,
    _status: 'published',
  }))
  const industries: PlanSeed[] = dlaFirm.branches.map((entry, index) => ({
    key: entry.key,
    type: 'branza',
    name: entry.name,
    title: entry.title,
    groups: groupsOf(entry.g as Groups, SHORT_LINES),
    start: entry.start,
    questions: entry.ask,
    order: (index + 1) * 10,
    _status: 'published',
  }))
  const home: PlanSeed[] = dlaDomu.sits.map((entry, index) => ({
    key: slugOf(entry.name),
    type: 'sytuacja-dom',
    name: entry.name,
    title: entry.title,
    lead: entry.lead,
    groups: groupsOf(entry.g as Groups, null),
    steps: entry.steps,
    call: line(entry.call),
    order: (index + 1) * 10,
    _status: 'published',
  }))
  return [...personas, ...industries, ...home]
}

type TrustRow = NonNullable<HubSetting['trust']>[number]

/**
 * Company facts allowed by spec §3 (since 2004, 100+ business clients, authorizations and statuses
 * as in K4-FINAL §1) — approved, because the spec lists them.
 */
export function hubTrust(): TrustRow[] {
  const spec = 'spec prokomeu §3'
  const k4 = 'K4-FINAL §1'
  return [
    { value: 'Od 2004', label: 'firma z Rabki-Zdroju', source: spec, approved: true },
    { value: '100+', label: 'klientów firmowych', source: spec, approved: true },
    { value: 'Posnet', label: 'Autoryzowany serwis', source: k4, approved: true },
    { value: 'Elzab', label: 'Autoryzowany serwis', source: k4, approved: true },
    { value: 'GoPOS', label: 'Autoryzowany partner', source: k4, approved: true },
    { value: 'InsERT', label: 'Autoryzowany partner', source: k4, approved: true },
    { value: 'Optivendi', label: 'Partner', source: k4, approved: true },
    { value: 'COMEX', label: 'We współpracy', source: k4, approved: true },
  ]
}

/**
 * Facts after a seed run: a fact of the package replaces the stored one with the same value (its
 * row id kept), facts added in the panel stay after them — the boss's additions never disappear.
 */
export function mergeTrust(
  stored: readonly TrustRow[] | null | undefined,
  pkg: TrustRow[],
): TrustRow[] {
  const own = new Map((stored ?? []).map((row) => [row.value, row]))
  const values = new Set(pkg.map((row) => row.value))
  return [
    ...pkg.map((row) => ({ ...row, id: own.get(row.value)?.id })),
    ...(stored ?? []).filter((row) => !values.has(row.value)),
  ]
}
