// Types of `porownaj-tresc.mjs` for its unit test (`src/lib/qa/contentParity.test.ts`).
export type Measure = { h2: number; sections: number; text: number }
export const PAGES: string[]
export const THRESHOLD: number
export function measure(html: string): Measure
export function shortfalls(a: Measure, b: Measure, threshold?: number): (keyof Measure)[]
