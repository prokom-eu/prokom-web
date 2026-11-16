import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { OG_COLORS } from '@/lib/brand/ogColors'
import { loadOgFonts, OG_CACHE, OG_SIZE } from '@/lib/og/fonts'
import { titleSize } from './text'

export { firstSentence, ogDomain, ogNotFound } from './text'

const LOGO = join(process.cwd(), 'public/brand/prokom-biznes_poziome_negatyw.svg')

let logoData: Promise<string> | null = null

function loadLogo() {
  logoData ??= readFile(LOGO).then((logo) => `data:image/svg+xml;base64,${logo.toString('base64')}`)
  return logoData
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
 * The Biznes sharing image (audyt 15.11 wieczorem §3.3): the navy of the dark blocks with a soft
 * blue light, the logo, the eyebrow, the title in Archivo and the footer — 1200 × 630.
 */
export async function biznesOgImage({
  eyebrow,
  title,
  footer,
  footerRight,
}: Card): Promise<ImageResponse> {
  const [fonts, logo] = await Promise.all([loadOgFonts(), loadLogo()])
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
    { ...OG_SIZE, fonts, headers: { 'Cache-Control': OG_CACHE } },
  )
}
