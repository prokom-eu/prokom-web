import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { OG_COLORS } from '@/lib/brand/ogColors'
import { titleSize } from './text'

export { firstSentence, ogDomain, ogNotFound } from './text'

/** The sharing image of Facebook, LinkedIn and X (`summary_large_image`). */
export const OG_SIZE = { width: 1200, height: 630 } as const

const FONT_DIR = join(process.cwd(), 'public/fonts/og')
const LOGO = join(process.cwd(), 'public/brand/prokom-biznes_poziome_negatyw.svg')

/**
 * The brand fonts as static TTF (`ImageResponse` reads no woff2): Archivo 800 at the brand's
 * 112 % width and Manrope 600, made once from the site's own files (`app/(sites)/fonts`, OFL),
 * each in a Latin and a Latin Extended-A file — the image takes Polish letters from the second.
 * Read once per server process. Not served to visitors (`public/fonts` is not a public folder of
 * `lib/tenant/routing`).
 */
let assets: Promise<{
  fonts: ConstructorParameters<typeof ImageResponse>[1]
  logo: string
}> | null = null

function loadAssets() {
  assets ??= (async () => {
    const font = (file: string) => readFile(join(FONT_DIR, file))
    const [archivo, archivoExt, manrope, manropeExt, logo] = await Promise.all([
      font('archivo-800-latin.ttf'),
      font('archivo-800-latin-ext.ttf'),
      font('manrope-600-latin.ttf'),
      font('manrope-600-latin-ext.ttf'),
      readFile(LOGO),
    ])
    return {
      fonts: {
        fonts: [
          { name: 'Archivo', data: archivo, weight: 800, style: 'normal' },
          { name: 'Archivo', data: archivoExt, weight: 800, style: 'normal' },
          { name: 'Manrope', data: manrope, weight: 600, style: 'normal' },
          { name: 'Manrope', data: manropeExt, weight: 600, style: 'normal' },
        ],
      },
      logo: `data:image/svg+xml;base64,${logo.toString('base64')}`,
    }
  })()
  return assets
}

type Card = {
  /** Small line over the title, e.g. „KSeF · Poradnik”. */
  eyebrow: string
  title: string
  /** The bottom line, e.g. the domain and the reading time. */
  footer: string
  /** Right of the footer: the line's phone from the panel (never written here), or nothing. */
  footerRight?: string | null
}

/**
 * A day in the browsers and sharing caches, then fetched again (a title can change in the panel
 * under the same address); without it `ImageResponse` sends `max-age=0, must-revalidate`.
 */
const CACHE = 'public, max-age=86400, stale-while-revalidate=604800'

/**
 * The Biznes sharing image (audyt 15.11 wieczorem §3.3): the navy of the dark blocks with a soft
 * blue light, the logo, the eyebrow, the title in Archivo and the footer — 1200 × 630.
 */
export async function biznesOgImage({
  eyebrow,
  title,
  footer,
  footerRight,
}: Card): Promise<ImageResponse> {
  const { fonts, logo } = await loadAssets()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        backgroundColor: OG_COLORS.navy,
        backgroundImage: `radial-gradient(ellipse 70% 80% at 88% 8%, ${OG_COLORS.accentOnDark}55, transparent 70%)`,
        color: OG_COLORS.white,
        fontFamily: 'Manrope',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
      <img src={logo} width={300} height={60} alt="" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: OG_COLORS.accentOnDark,
            letterSpacing: '0.02em',
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'block',
            fontFamily: 'Archivo',
            fontSize: titleSize(title),
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            lineClamp: 4,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 26,
          color: OG_COLORS.white75,
          borderTop: `1px solid ${OG_COLORS.white18}`,
          paddingTop: 24,
        }}
      >
        <span>{footer}</span>
        <span style={{ color: OG_COLORS.white }}>{footerRight}</span>
      </div>
    </div>,
    { ...OG_SIZE, ...fonts, headers: { 'Cache-Control': CACHE } },
  )
}
