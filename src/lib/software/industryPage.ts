import type { Industry } from '@/payload-types'

import type { IconName } from '../catalog/options'
import { INDUSTRY_GROUPS } from './options'
import type { IndexSolution } from './solutionsIndex'
import { WIZARD_PATH } from './wizardFlow'

/**
 * Software industry page `/dla-branz/[branza]` (spec. §6.2, board `Branza` v22). Pure: the loader
 * reads the industry and the solutions of one tenant, this puts the page together. Solutions are
 * only those published in the same tenant (the solutions index) — a problem or card pointing to
 * anything else loses that link, never shows it.
 */

export const INDUSTRY_PAGE_PATH = '/dla-branz'

export const industryPageHref = (slug: string) =>
  `${INDUSTRY_PAGE_PATH}/${encodeURIComponent(slug)}`

/** What the page reads of an industry (texts already filled with facts by the loader). */
export type IndustryDoc = Pick<Industry, 'name' | 'slug' | 'active' | 'hero' | 'faq' | 'software'>

export type IndustryProblem = {
  question: string
  note: string | null
  icon: IconName | null
  title: string | null
  text: string | null
  features: string[]
  /** The solution to add to „Twój projekt” — only when published in this tenant. */
  solution: { slug: string; name: string; thumbnail: string | null } | null
  cta: { label: string; href: string } | null
}

export type IndustryPageView = {
  name: string
  slug: string
  eyebrow: string
  title: { plain: string; accent: string | null }
  lead: string | null
  wizard: { label: string; href: string }
  hub: { title: string; caption: string | null } | null
  modules: { name: string; icon: IconName | null; x: number; y: number; delay: number }[]
  problems: { eyebrow: string; lead: string | null; items: IndustryProblem[] }
  offline: {
    eyebrow: string | null
    title: string
    accent: string | null
    lead: string | null
    note: { label: string | null; value: string; caption: string | null } | null
    steps: { title: string; text: string | null }[]
  } | null
  solutions: { eyebrow: string; items: IndexSolution[] }
  faq: { eyebrow: string; items: { question: string; answer: string }[] }
  contact: { eyebrow: string; title: string; lead: string | null; points: string[] }
}

type BuildInput = {
  industry: IndustryDoc
  /** Published solutions of the tenant (index), in any order. */
  solutions: readonly IndexSolution[]
  /** Slugs of solutions by id — only the published ones of the tenant. */
  slugById: ReadonlyMap<number, string>
  isIcon: (value: string) => value is IconName
}

const clean = (value: string | null | undefined): string | null => value?.trim() || null

const idOf = (value: number | { id: number } | null | undefined): number | null =>
  value === null || value === undefined ? null : typeof value === 'number' ? value : value.id

/** `/dobierz?firma=<kind>`; without a kind the wizard starts at step 1. */
export function industryWizardHref(firm: string | null | undefined): string {
  return firm ? `${WIZARD_PATH}?firma=${encodeURIComponent(firm)}` : WIZARD_PATH
}

/** The page of an active industry with its own texts; `null` = 404 (inactive or no problems). */
export function buildIndustryPage({
  industry,
  solutions,
  slugById,
  isIcon,
}: BuildInput): IndustryPageView | null {
  const software = industry.software
  if (!industry.active || !software) return null
  const bySlug = new Map(solutions.map((solution) => [solution.slug, solution]))
  const solutionOf = (value: Parameters<typeof idOf>[0]) => {
    const id = idOf(value)
    const slug = id === null ? undefined : slugById.get(id)
    return slug ? bySlug.get(slug) : undefined
  }
  const icon = (value: string | null | undefined) => (value && isIcon(value) ? value : null)
  const page = software.page
  const group = INDUSTRY_GROUPS.find((item) => item.value === software.group)?.label

  // A text emptied by a missing fact (production) drops its element, never an empty button.
  const problems: IndustryProblem[] = (software.problems ?? [])
    .filter((problem) => clean(problem.question))
    .map((problem) => {
      const solution = solutionOf(problem.solution)
      const label = clean(problem.cta?.label)
      const href = clean(problem.cta?.href)
      return {
        question: problem.question,
        note: clean(problem.note),
        icon: icon(problem.icon),
        title: clean(problem.title),
        text: clean(problem.text),
        features: (problem.features ?? []).filter(Boolean),
        solution: solution
          ? { slug: solution.slug, name: solution.name, thumbnail: solution.thumbnail ?? null }
          : null,
        cta: label && href ? { label, href } : null,
      }
    })
  // A page without its problems has no content yet (spec. §6.2: not published without text).
  if (problems.length === 0) return null

  const box = page?.offlineBox
  const boxTitle = clean(box?.title)
  const noteValue = clean(box?.noteValue)
  const hubTitle = clean(page?.hubTitle)
  const contact = page?.contact

  return {
    name: industry.name,
    slug: industry.slug,
    eyebrow: ['Branża', group ?? industry.name].join(' · '),
    title: {
      plain: clean(industry.hero?.title) ?? industry.name,
      accent: clean(page?.heroAccent),
    },
    lead: clean(industry.hero?.lead),
    wizard: {
      label: clean(industry.hero?.ctaLabel) ?? 'Złóż system dla swojej firmy',
      href: industryWizardHref(software.wizardFirm),
    },
    hub: hubTitle ? { title: hubTitle, caption: clean(page?.hubCaption) } : null,
    modules: (software.moduleMap ?? [])
      .filter((module) => clean(module.name))
      .map((module) => ({
        name: module.name,
        icon: icon(module.icon),
        x: module.x,
        y: module.y,
        delay: module.delay ?? 0,
      })),
    problems: {
      eyebrow: clean(page?.problemsEyebrow) ?? `Co boli w branży`,
      lead: clean(page?.problemsLead),
      items: problems,
    },
    offline: boxTitle
      ? {
          eyebrow: clean(box?.eyebrow),
          title: boxTitle,
          accent: clean(box?.accent),
          lead: clean(box?.lead),
          note: noteValue
            ? { label: clean(box?.noteLabel), value: noteValue, caption: clean(box?.noteCaption) }
            : null,
          steps: (software.offline ?? [])
            .filter((step) => clean(step.title))
            .map((step) => ({
              title: step.title,
              text: clean(step.text),
            })),
        }
      : null,
    solutions: {
      eyebrow: clean(page?.solutionsEyebrow) ?? 'Najczęściej w tej branży',
      items: (software.topSolutions ?? []).flatMap((item) => solutionOf(item) ?? []),
    },
    faq: {
      eyebrow: clean(page?.faqEyebrow) ?? 'Pytania z branży',
      items: (industry.faq ?? []).flatMap((item) => {
        const question = clean(item.question)
        const answer = clean(item.answer)
        return question && answer ? [{ question, answer }] : []
      }),
    },
    contact: {
      eyebrow: clean(contact?.eyebrow) ?? 'Porozmawiajmy o Twojej firmie',
      title: clean(contact?.title) ?? 'Pokaż, jak dziś pracuje Twoja firma.',
      lead: clean(contact?.lead),
      points: (contact?.points ?? []).map((point) => point.trim()).filter(Boolean),
    },
  }
}
