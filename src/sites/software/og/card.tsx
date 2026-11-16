import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { loadOgFonts, OG_CACHE, OG_SIZE } from '@/lib/og/fonts'
import { titleSize } from '@/lib/og/text'
import {
  SOFTWARE_OG_CATEGORIES,
  SOFTWARE_OG_COVER,
  type SoftwareOgCategory,
} from '@/lib/software/ogColors'
import type { CoverMotif } from '@/lib/software/postCovers'

import { coverDataUri } from './coverSvg'

const LOGO = join(process.cwd(), 'public/brand/prokom-software_poziome_negatyw.svg')

let logoData: Promise<string> | null = null

function loadLogo() {
  logoData ??= readFile(LOGO).then((logo) => `data:image/svg+xml;base64,${logo.toString('base64')}`)
  return logoData
}

/** The scene's box on the image: its 260 × 170 drawing, enlarged. */
const SCENE = { width: 520, height: 340 } as const

type Card = {
  motif: CoverMotif
  category: SoftwareOgCategory
  /** Small line over the title: the category label. */
  eyebrow: string
  title: string
  /** The bottom line: the domain and the reading time. */
  footer: string
}

/**
 * The sharing image of a Software post (decision of Krystian 15.11 — „każda okładka inna”): the
 * post's own cover scene on the dark panel of its category, beside the logo, the category, the
 * title and the footer — 1200 × 630, so a shared link shows the same picture as the news list.
 */
export async function softwareOgImage({
  motif,
  category,
  eyebrow,
  title,
  footer,
}: Card): Promise<ImageResponse> {
  const [fonts, logo] = await Promise.all([loadOgFonts(), loadLogo()])
  const { glow, bg, ink } = SOFTWARE_OG_CATEGORIES[category]
  const scene = coverDataUri(motif, category, SCENE.width, SCENE.height)
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: SOFTWARE_OG_COVER['news-art-base'],
        backgroundImage: `radial-gradient(ellipse 70% 90% at 82% 30%, ${glow}, transparent 62%), linear-gradient(160deg, ${bg}, ${SOFTWARE_OG_COVER['news-art-base']})`,
        color: SOFTWARE_OG_COVER['cover-ink'],
        fontFamily: 'Manrope',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 640,
          padding: '60px 0 56px 68px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
        <img src={logo} width={280} height={56} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 26, color: ink, letterSpacing: '0.02em' }}>
            {eyebrow}
          </div>
          <div
            style={{
              display: 'block',
              fontFamily: 'Archivo',
              fontSize: Math.round(titleSize(title) * 0.86),
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              lineClamp: 5,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: SOFTWARE_OG_COVER['cover-ink-2'],
            borderTop: `1px solid ${SOFTWARE_OG_COVER['cover-line']}`,
            paddingTop: 22,
          }}
        >
          {footer}
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
        <img src={scene} width={SCENE.width} height={SCENE.height} alt="" />
      </div>
    </div>,
    { ...OG_SIZE, fonts, headers: { 'Cache-Control': OG_CACHE } },
  )
}
