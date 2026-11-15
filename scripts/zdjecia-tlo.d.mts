// Types of `zdjecia-tlo.mjs` for its unit test (`src/lib/qa/photoBackground.test.ts`).
export const SOURCES: string[]
export function classify(bitmap: {
  data: Uint8Array
  width: number
  height: number
}): { problem: 'białe tło' | 'otoczka'; share: number } | null
