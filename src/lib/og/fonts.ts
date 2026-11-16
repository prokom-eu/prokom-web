import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { ImageResponse } from 'next/og'

type OgFonts = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts']>

const FONT_DIR = join(process.cwd(), 'public/fonts/og')

let fonts: Promise<OgFonts> | null = null

/**
 * The brand fonts of the sharing images as static TTF (`ImageResponse` reads no woff2): Archivo
 * 800 at the brand's 112 % width and Manrope 600, made once from the site's own files
 * (`app/(sites)/fonts`, OFL), each in a Latin and a Latin Extended-A file — the image takes Polish
 * letters from the second. Read once per server process. Not served to visitors (`public/fonts`
 * is not a public folder of `lib/tenant/routing`).
 */
export function loadOgFonts(): Promise<OgFonts> {
  fonts ??= (async () => {
    const font = (file: string) => readFile(join(FONT_DIR, file))
    const [archivo, archivoExt, manrope, manropeExt] = await Promise.all([
      font('archivo-800-latin.ttf'),
      font('archivo-800-latin-ext.ttf'),
      font('manrope-600-latin.ttf'),
      font('manrope-600-latin-ext.ttf'),
    ])
    return [
      { name: 'Archivo', data: archivo, weight: 800, style: 'normal' },
      { name: 'Archivo', data: archivoExt, weight: 800, style: 'normal' },
      { name: 'Manrope', data: manrope, weight: 600, style: 'normal' },
      { name: 'Manrope', data: manropeExt, weight: 600, style: 'normal' },
    ]
  })()
  return fonts
}

/**
 * A day in the browsers and sharing caches, then fetched again (a title can change in the panel
 * under the same address); without it `ImageResponse` sends `max-age=0, must-revalidate`.
 */
export const OG_CACHE = 'public, max-age=86400, stale-while-revalidate=604800'

/** The sharing image of Facebook, LinkedIn and X (`summary_large_image`). */
export const OG_SIZE = { width: 1200, height: 630 } as const
