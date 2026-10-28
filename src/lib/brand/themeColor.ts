import type { MetadataRoute, Viewport } from 'next'

import type { Line } from '@/lib/tenant/lines'

import { brandAsset } from './lines'

type ThemeColors = { light: string; dark: string }

/**
 * Browser bar colour (`theme-color`) of lines that look like an app on a phone (ADR-I004,
 * MOBILE-APLIKACJA §5): the page background (`--surface`) of each theme. A `<meta>` needs a
 * literal value, so these are copies of `tokens.css` (ADR-007) — `themeColor.test.ts` fails when
 * they drift apart. Lines without an entry keep the browser's defaults.
 */
export const LINE_THEME_COLORS: Partial<Record<Line, ThemeColors>> = {
  instalacje: { light: '#f4f5f1', dark: '#101412' },
}

/** Viewport of a line's pages: content under the notch (safe areas) and the bar colour. */
export function lineViewport(line: Line): Viewport {
  const colors = LINE_THEME_COLORS[line]
  if (!colors) return {}
  return {
    viewportFit: 'cover',
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: colors.light },
      { media: '(prefers-color-scheme: dark)', color: colors.dark },
    ],
  }
}

/**
 * Web app manifest of a line's site (MOBILE-APLIKACJA §5): installable, standalone, brand icons.
 * No service worker in stage 1. `null` for lines that do not offer one.
 */
export function lineManifest(line: Line, name: string): MetadataRoute.Manifest | null {
  const colors = LINE_THEME_COLORS[line]
  if (!colors) return null
  const icon512 = brandAsset(line, 'icon-512.png')
  return {
    name,
    short_name: name,
    lang: 'pl',
    start_url: '/',
    display: 'standalone',
    background_color: colors.light,
    theme_color: colors.light,
    icons: [
      { src: brandAsset(line, 'icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: icon512, sizes: '512x512', type: 'image/png' },
      // The mark sits well inside the safe zone of the full-bleed icon.
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
