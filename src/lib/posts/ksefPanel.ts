import type { BiznesSetting } from '@/payload-types'

type Group = NonNullable<NonNullable<BiznesSetting['news']>['ksef']>
type Link = { label: string; href: string }

export type KsefPanel = {
  eyebrow: string | null
  date: string
  dateLabel: string
  text: string | null
  link: Link | null
  secondaryLink: Link | null
  steps: { title: string; text: string | null }[]
  note: string | null
}

const text = (value: string | null | undefined) => value?.trim() || null

const link = (value: { label?: string | null; href?: string | null } | null | undefined) => {
  const label = text(value?.label)
  const href = text(value?.href)
  return label && href ? { label, href } : null
}

/**
 * The KSeF panel above the news list (board `Aktualnosci`) from `BiznesSettings.news.ksef`, or
 * `null` while it has no date and caption. After the date the panel stays, without the counter
 * (the component decides, as `bzKsef` does).
 */
export function ksefPanel(group: Group | null | undefined): KsefPanel | null {
  const date = group?.date
  const dateLabel = text(group?.dateLabel)
  if (!date || !dateLabel) return null
  return {
    eyebrow: text(group.eyebrow),
    date,
    dateLabel,
    text: text(group.text),
    link: link(group.link),
    secondaryLink: link(group.secondaryLink),
    steps: (group.steps ?? []).map((step) => ({ title: step.title, text: text(step.text) })),
    note: text(group.note),
  }
}
