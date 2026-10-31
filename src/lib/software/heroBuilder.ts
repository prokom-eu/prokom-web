import { plural } from '../plural'

/**
 * Rules of the „Twój system” mock-up in the start page hero (spec. §4 pkt 1, board `Main`): the
 * modules switched on, the scope, the hint and the one item „Chcę taki system” adds to
 * „Twój projekt”. Labels of the modules come from `SoftwareSettings.home.heroModules`.
 */

/** Switched on before anyone touches the mock-up (board: `www`, `zlec`, `app`). */
export const DEFAULT_MODULES = ['www', 'zlec', 'app'] as const

/** Every step of the self-assembling mock-up (board: 2,3 s), until the visitor takes over. */
export const AUTO_STEP_MS = 2300

/** Keys in the order of the module list, whatever order they were clicked in. */
export function orderModules(on: readonly string[], all: readonly string[]): string[] {
  return all.filter((key) => on.includes(key))
}

export function toggleModule(on: readonly string[], key: string, all: readonly string[]) {
  return orderModules(on.includes(key) ? on.filter((k) => k !== key) : [...on, key], all)
}

/**
 * Next state of the self-assembling mock-up: one module more each step, then two steps of rest,
 * then it starts again from the first module.
 */
export function autoStep(
  state: { count: number; hold: number },
  total: number,
): { count: number; hold: number } {
  if (state.count < total) return { count: state.count + 1, hold: 0 }
  if (state.hold < 2) return { count: state.count, hold: state.hold + 1 }
  return { count: Math.min(1, total), hold: 0 }
}

export const moduleCountLabel = (n: number) => plural(n, ['moduł', 'moduły', 'modułów'])

/** „Zakres” of the set (v21, ZMIANY-v21 §10.4 — instead of „złożoność”) and its bar width. */
export function scope(n: number): { level: string; width: number } {
  return {
    level: n <= 2 ? 'na start' : n <= 4 ? 'średni' : 'etapami',
    width: Math.min(100, 10 + n * 13),
  }
}

export function builderHint(n: number): string {
  if (n === 0) return 'dodaj pierwszy moduł'
  if (n === 1) return 'może wystarczyć gotowe rozwiązanie'
  if (n <= 3) return 'mały system szyty na miarę'
  if (n <= 5) return 'własny system firmy'
  return 'duży system, budowany w etapach'
}

/** The one „Twój projekt” item of the mock-up: the same modules give the same id. */
export function buildItem(modules: readonly string[]): { id: string; name: string } {
  const n = modules.length
  return {
    id: `build-${modules.join('-')}`,
    name: `system z ${n} ${n === 1 ? 'modułu' : 'modułów'}`,
  }
}
