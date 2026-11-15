// Types of `widocznosc.mjs` for the e2e `biznes-widocznosc` and the scripts that import it.
import type { Page } from '@playwright/test'

export type HiddenProblem = { element: string; why: string; rule: string }
export const PAGES: string[]
export function hiddenAfterScroll(page: Page): Promise<HiddenProblem[]>
