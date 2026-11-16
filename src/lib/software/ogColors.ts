/**
 * Colours of the Software post sharing image (`sites/software/og/card.tsx`). `ImageResponse` and
 * the SVG inside it read no CSS variables, so these are copies of the cover tokens of `tokens.css`
 * (`[data-line='software']`, the same in both themes) — `ogColors.test.ts` fails when they drift.
 */
export const SOFTWARE_OG_COVER = {
  'news-art-base': '#0f1110',
  'cover-glass': 'rgba(255, 255, 255, 0.06)',
  'cover-glass-2': 'rgba(255, 255, 255, 0.11)',
  'cover-line': 'rgba(255, 255, 255, 0.17)',
  'cover-ink': 'rgba(244, 245, 241, 0.92)',
  'cover-ink-2': 'rgba(244, 245, 241, 0.42)',
  'cover-ok': '#5fd08a',
  'cover-alert': '#f0786b',
  'news-art-orb': 'rgba(150, 112, 238, 0.55)',
} as const

/** Per category: `--news-art-<c>` (the glow), `-bg` (the panel) and `-ink` (the solid hue). */
export const SOFTWARE_OG_CATEGORIES = {
  poradnik: { glow: 'rgba(150, 112, 238, 0.55)', bg: '#1a1430', ink: '#b39bf5' },
  strony: { glow: 'rgba(63, 193, 173, 0.45)', bg: '#10201d', ink: '#5fd6c2' },
  systemy: { glow: 'rgba(74, 123, 224, 0.45)', bg: '#111827', ink: '#7fa8f7' },
  automatyzacje: { glow: 'rgba(242, 193, 78, 0.4)', bg: '#1c1a12', ink: '#f2c14e' },
  bezpieczenstwo: { glow: 'rgba(226, 72, 58, 0.38)', bg: '#1e1312', ink: '#f0786b' },
} as const

export type SoftwareOgCategory = keyof typeof SOFTWARE_OG_CATEGORIES

export function softwareOgCategory(value: string | null | undefined): SoftwareOgCategory {
  return value && value in SOFTWARE_OG_CATEGORIES ? (value as SoftwareOgCategory) : 'poradnik'
}
