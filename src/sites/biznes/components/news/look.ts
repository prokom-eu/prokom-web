import type { IconName } from '@/lib/catalog/options'

type Tone = 'blue' | 'violet' | 'green' | 'red' | 'navy'

/**
 * The drawn mark of a post card without a picture (redesign 15.11): the category's line icon on
 * a soft tile of its tone. Tones as in `QuickStart`: the `--tone-*-tag` colours stay dark at
 * night, so there the label takes the ink colour (AA) and the icon the light `--tone-*-2`.
 */
const CATEGORY: Partial<Record<string, { icon: IconName; tone: Tone }>> = {
  ksef: { icon: 'receipt', tone: 'blue' },
  kasy: { icon: 'cash', tone: 'red' },
  terminale: { icon: 'card', tone: 'violet' },
  dofinansowania: { icon: 'wallet', tone: 'green' },
  programy: { icon: 'monitor', tone: 'navy' },
  'it-w-firmie': { icon: 'laptop', tone: 'blue' },
}

const TONE: Record<Tone, { tile: string; tag: string }> = {
  blue: {
    tile: 'bg-[color-mix(in_srgb,var(--tone-blue)_14%,transparent)] text-tone-blue-tag [[data-theme=dark]_&]:text-tone-blue-2',
    tag: 'text-tone-blue-tag',
  },
  violet: {
    tile: 'bg-[color-mix(in_srgb,var(--tone-violet)_14%,transparent)] text-tone-violet-tag [[data-theme=dark]_&]:text-tone-violet-2',
    tag: 'text-tone-violet-tag',
  },
  green: {
    tile: 'bg-[color-mix(in_srgb,var(--tone-green)_14%,transparent)] text-tone-green-tag [[data-theme=dark]_&]:text-tone-green-2',
    tag: 'text-tone-green-tag',
  },
  red: {
    tile: 'bg-[color-mix(in_srgb,var(--tone-red)_14%,transparent)] text-tone-red-tag [[data-theme=dark]_&]:text-tone-red-2',
    tag: 'text-tone-red-tag',
  },
  navy: { tile: 'bg-surface-2 text-ink', tag: 'text-ink' },
}

/** At night the tag colours fall under 4.5:1 on the card: the label goes ink, the tile keeps it. */
export const DARK_TAG = '[[data-theme=dark]_&]:text-ink-2'

export function categoryLook(value: string | null | undefined): {
  icon: IconName
  tile: string
  tag: string
} {
  const look = (value && CATEGORY[value]) || { icon: 'news' as const, tone: 'navy' as const }
  return { icon: look.icon, ...TONE[look.tone] }
}
