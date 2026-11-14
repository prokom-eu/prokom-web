// Types of `porownaj-tresc.mjs` for its unit test (`src/lib/qa/contentParity.test.ts`).
export type Measure = { h2: number; sections: number; text: number }
export const PAGES: string[]
export const THRESHOLD: number
export function measure(html: string): Measure
export function shortfalls(a: Measure, b: Measure, threshold?: number): (keyof Measure)[]
export function mapPaths(html: string): string[]
export function sitemapPaths(xml: string): string[]
export function afterImportProblems(input: {
  sitemap: string[]
  map: string[]
  pages: Map<string, { status: number; noindex: boolean }>
  staging?: boolean
}): string[]
export function closedToCrawlers(robots: string): boolean
