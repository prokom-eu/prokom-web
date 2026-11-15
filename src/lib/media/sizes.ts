type SizeLike = { url?: string | null; width?: number | null }

export type ImageDoc = SizeLike & { sizes?: Record<string, SizeLike | undefined> | null }

export type ImageSource = { url: string; width: number }

/** Files of an uploaded image (generated sizes + original), smallest first. */
export function imageSources(doc: ImageDoc): ImageSource[] {
  const candidates = [...Object.values(doc.sizes ?? {}), doc]
  const sources: ImageSource[] = []
  for (const candidate of candidates) {
    if (candidate?.url && candidate.width) {
      sources.push({ url: candidate.url, width: candidate.width })
    }
  }
  return sources.sort((a, b) => a.width - b.width)
}

/**
 * File for a `next/image` width: the smallest one at least that wide, else the widest.
 * Sizes are made by Payload on upload (WebP), so Next's optimizer is not used — its internal
 * fetch carries no `Host` header, which our routing and file access depend on.
 */
export function pickSource(sources: readonly ImageSource[], width: number): string {
  const match = sources.find((source) => source.width >= width) ?? sources.at(-1)
  return match?.url ?? ''
}
