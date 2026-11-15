/**
 * Colours of the Biznes sharing image (`sites/biznes/og/card.tsx`). `ImageResponse` needs literal values, so
 * these are copies of `tokens.css` (ADR-007), the light theme of Biznes — `colors.test.ts` fails
 * when they drift apart (the same rule as `lib/brand/themeColor.ts`).
 */
export const OG_COLORS = {
  /** `--surface-dark`: the navy of the dark blocks (KSeF panel, featured post). */
  navy: '#0a1430',
  /** `--accent-on-dark`: the blue of eyebrows and accents on navy. */
  accentOnDark: '#4a7be0',
  /** `--c-white`: text on navy, and its softer steps (alpha of the same white). */
  white: '#ffffff',
  white75: 'rgba(255, 255, 255, 0.75)',
  white18: 'rgba(255, 255, 255, 0.18)',
} as const
