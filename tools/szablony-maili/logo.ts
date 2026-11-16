// Official horizontal mark (SVG) → PNG 3× (528 px, white background): Gmail and Outlook do not show SVG.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { REPO_DIR } from './load.ts'

/** Width of the logo in the signature (CSS px); the PNG is 3× for sharp rendering on retina screens. */
export const LOGO_WIDTH = 176
const PNG_WIDTH = LOGO_WIDTH * 3

export interface LogoPng {
  png: Buffer
  /** Display size in the signature. */
  width: number
  height: number
}

export async function renderLogo(svgPath: string): Promise<LogoPng> {
  const svg = await readFile(join(REPO_DIR, svgPath))
  const png = await sharp(svg, { density: 600 })
    .resize({ width: PNG_WIDTH })
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer()
  const meta = await sharp(png).metadata()
  const height = Math.round((LOGO_WIDTH * (meta.height ?? 0)) / (meta.width ?? PNG_WIDTH))
  return { png, width: LOGO_WIDTH, height }
}
