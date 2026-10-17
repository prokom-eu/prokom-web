import sharp from 'sharp'

/**
 * Neutral SAMPLE picture (grey shapes, no text, no third-party content) — the seed must not
 * ship photos or logos whose rights are not confirmed (`seed/prokombiznes/media.json`).
 * TODO(krystian): replace with files from the brand package once their rights are confirmed.
 */
export async function sampleImage(width: number, height: number): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#e5e7eb"/>
    <circle cx="${width * 0.3}" cy="${height * 0.45}" r="${height * 0.22}" fill="#cbd5e1"/>
    <rect x="${width * 0.5}" y="${height * 0.3}" width="${width * 0.3}" height="${height * 0.4}"
      rx="${height * 0.04}" fill="#94a3b8"/>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}
