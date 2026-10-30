import { describe, expect, it } from 'vitest'

import { resolve, rule } from '@/styles/parse-tokens'
import type { Line } from '@/lib/tenant/lines'

import { LINE_THEME_COLORS, lineManifest, lineViewport } from './themeColor'

/** `--surface` of a line as the browser sees it on `<html>` (light or explicit dark theme). */
function surface(line: Line, mode: 'light' | 'dark'): string {
  const scope = {
    ...rule(':root'),
    ...rule(`[data-line='${line}']`),
    ...(mode === 'dark' ? rule(`[data-line='${line}'][data-theme='dark']`) : {}),
  }
  return resolve('var(--surface)', scope).toLowerCase()
}

describe('LINE_THEME_COLORS', () => {
  it.each(Object.entries(LINE_THEME_COLORS))(
    '%s: the copies equal --surface in tokens.css',
    (line, colors) => {
      expect(colors.light.toLowerCase()).toBe(surface(line as Line, 'light'))
      expect(colors.dark.toLowerCase()).toBe(surface(line as Line, 'dark'))
    },
  )
})

describe('lineViewport', () => {
  it('gives Instalacje the safe area and a theme colour per system theme', () => {
    expect(lineViewport('instalacje')).toEqual({
      viewportFit: 'cover',
      themeColor: [
        { media: '(prefers-color-scheme: light)', color: LINE_THEME_COLORS.instalacje?.light },
        { media: '(prefers-color-scheme: dark)', color: LINE_THEME_COLORS.instalacje?.dark },
      ],
    })
  })

  // Software MOBILE-APLIKACJA §4 pkt 8 (SWR2): the same mechanism as Instalacje.
  it('gives Software the safe area and a theme colour per system theme', () => {
    expect(lineViewport('software')).toEqual({
      viewportFit: 'cover',
      themeColor: [
        { media: '(prefers-color-scheme: light)', color: LINE_THEME_COLORS.software?.light },
        { media: '(prefers-color-scheme: dark)', color: LINE_THEME_COLORS.software?.dark },
      ],
    })
  })

  it('leaves lines without an entry as they are', () => {
    expect(lineViewport('biznes')).toEqual({})
  })
})

describe('lineManifest', () => {
  it('describes the Instalacje site as a standalone app with its brand icons', () => {
    const manifest = lineManifest('instalacje', 'PRO-KOM Instalacje')
    expect(manifest).toMatchObject({
      name: 'PRO-KOM Instalacje',
      short_name: 'Instalacje',
      lang: 'pl',
      start_url: '/',
      display: 'standalone',
      background_color: LINE_THEME_COLORS.instalacje?.light,
      theme_color: LINE_THEME_COLORS.instalacje?.light,
    })
    expect(manifest?.icons).toEqual([
      { src: '/brand/prokom-instalacje_icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/prokom-instalacje_icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/brand/prokom-instalacje_icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ])
  })

  it('describes the Software site with its own short name and icons', () => {
    const manifest = lineManifest('software', 'PRO-KOM Software')
    expect(manifest).toMatchObject({
      name: 'PRO-KOM Software',
      short_name: 'Software',
      display: 'standalone',
      theme_color: LINE_THEME_COLORS.software?.light,
    })
    expect(manifest?.icons?.[0]?.src).toBe('/brand/prokom-software_icon-192.png')
  })

  it('has no manifest for lines without an entry', () => {
    expect(lineManifest('biznes', 'PRO-KOM Biznes')).toBeNull()
  })
})
