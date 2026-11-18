import { describe, expect, it } from 'vitest'

import type { Line } from '@/lib/tenant/lines'

import {
  autoTheme,
  defaultTheme,
  followsSystemTheme,
  hasDarkTheme,
  parseThemeParam,
  resolveTheme,
  THEME_PARAM,
  themeParamValue,
  THEME_STORAGE_KEY,
  themeScript,
} from './theme'

const NIGHT = new Date('2026-11-18T21:00:00Z') // 22:00 in Warsaw
const DAY = new Date('2026-11-18T11:00:00Z') // 12:00 in Warsaw

type Run = {
  line: Line
  search?: string
  stored?: string | null | Error
  systemDark?: boolean
  now?: Date
}

/** Runs a line's `<head>` script against fakes; returns `data-theme` and what is left stored. */
function runScript({ line, search = '', stored = null, systemDark = false, now = DAY }: Run) {
  let theme: string | null = null
  let store: string | null = stored instanceof Error ? null : stored
  const document = {
    documentElement: { setAttribute: (_: string, value: string) => (theme = value) },
  }
  const guard = (key: string) => {
    expect(key).toBe(THEME_STORAGE_KEY)
    if (stored instanceof Error) throw stored
  }
  const localStorage = {
    getItem: (key: string) => (guard(key), store),
    setItem: (key: string, value: string) => (guard(key), (store = value)),
    removeItem: (key: string) => (guard(key), (store = null)),
  }
  const location = { search }
  const matchMedia = (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' && systemDark,
  })
  const time = now.getTime()
  class FakeDate extends Date {
    constructor(...args: [] | [number]) {
      if (args.length === 0) super(time)
      else super(args[0])
    }
    static now() {
      return time
    }
  }
  new Function('document', 'localStorage', 'location', 'matchMedia', 'Date', themeScript(line))(
    document,
    localStorage,
    location,
    matchMedia,
    FakeDate,
  )
  return { theme, store }
}

describe('parseThemeParam / themeParamValue (spec §3)', () => {
  it('reads the three Polish values and nothing else', () => {
    expect(parseThemeParam('jasny')).toBe('light')
    expect(parseThemeParam('ciemny')).toBe('dark')
    expect(parseThemeParam('auto')).toBe('auto')
    expect(parseThemeParam('dark')).toBeNull()
    expect(parseThemeParam('constructor')).toBeNull()
    expect(parseThemeParam(null)).toBeNull()
  })

  it('writes them back', () => {
    expect(themeParamValue('light')).toBe('jasny')
    expect(themeParamValue('dark')).toBe('ciemny')
    expect(themeParamValue('auto')).toBe('auto')
    expect(THEME_PARAM).toBe('motyw')
  })
})

describe('autoTheme (spec §2.1 pkt 3)', () => {
  it('is dark on lines dark by default (Software, pro-kom.eu), at any time', () => {
    expect(autoTheme('software', false, DAY)).toBe('dark')
    expect(autoTheme('prokom', false, DAY)).toBe('dark')
  })

  it('follows a dark system on the other lines', () => {
    expect(autoTheme('biznes', true, DAY)).toBe('dark')
    expect(autoTheme('instalacje', true, DAY)).toBe('dark')
  })

  it('is dark at night in Rabka and light by day (ADR-028: changes D-K4-5)', () => {
    expect(autoTheme('biznes', false, NIGHT)).toBe('dark')
    expect(autoTheme('biznes', false, DAY)).toBe('light')
    expect(autoTheme('instalacje', false, NIGHT)).toBe('dark')
    expect(autoTheme('instalacje', false, DAY)).toBe('light')
  })
})

// Spec §2.1: param → stored choice → Auto (line, system, night). Each case also runs the inline
// script, so the script and the TypeScript rule cannot drift apart.
const CASES: Array<Run & { expected: 'light' | 'dark'; left: string | null }> = [
  // 1. The parameter from another line wins and is stored (`auto` clears the choice).
  { line: 'biznes', search: '?motyw=ciemny', stored: 'light', expected: 'dark', left: 'dark' },
  { line: 'software', search: '?motyw=jasny', expected: 'light', left: 'light' },
  { line: 'biznes', search: '?motyw=auto', stored: 'dark', expected: 'light', left: null },
  { line: 'biznes', search: '?motyw=auto', now: NIGHT, expected: 'dark', left: null },
  { line: 'biznes', search: '?a=1&motyw=ciemny', expected: 'dark', left: 'dark' },
  // An unknown value is ignored.
  { line: 'biznes', search: '?motyw=zielony', stored: 'dark', expected: 'dark', left: 'dark' },
  { line: 'biznes', search: '?motyw=__proto__', expected: 'light', left: null },
  // 2. A stored choice always wins over Auto.
  {
    line: 'biznes',
    stored: 'light',
    now: NIGHT,
    systemDark: true,
    expected: 'light',
    left: 'light',
  },
  { line: 'software', stored: 'light', expected: 'light', left: 'light' },
  { line: 'instalacje', stored: 'dark', expected: 'dark', left: 'dark' },
  { line: 'biznes', stored: '"><script>', expected: 'light', left: '"><script>' },
  // 3. Auto.
  { line: 'software', expected: 'dark', left: null },
  { line: 'prokom', expected: 'dark', left: null },
  { line: 'biznes', systemDark: true, expected: 'dark', left: null },
  { line: 'biznes', now: NIGHT, expected: 'dark', left: null },
  { line: 'biznes', expected: 'light', left: null },
  { line: 'instalacje', now: NIGHT, expected: 'dark', left: null },
  { line: 'instalacje', expected: 'light', left: null },
]

describe.each(CASES)('rule §2.1: $line $search stored=$stored system=$systemDark', (c) => {
  it(`→ ${c.expected}`, () => {
    const result = runScript(c)
    expect(result.theme).toBe(c.expected)
    expect(result.store).toBe(c.left)
    const param = new URLSearchParams(c.search ?? '').get(THEME_PARAM)
    expect(
      resolveTheme({
        line: c.line,
        param,
        stored: typeof c.stored === 'string' ? c.stored : null,
        systemDark: c.systemDark ?? false,
        now: c.now ?? DAY,
      }),
    ).toBe(c.expected)
  })
})

describe('themeScript', () => {
  it('always sets data-theme, even when storage is blocked', () => {
    expect(runScript({ line: 'biznes', stored: new Error('SecurityError') }).theme).toBe('light')
    expect(
      runScript({ line: 'biznes', stored: new Error('SecurityError'), now: NIGHT }).theme,
    ).toBe('dark')
    expect(runScript({ line: 'software', stored: new Error('SecurityError') }).theme).toBe('dark')
  })

  it('stays small (ADR-028: under 1.5 kB per line)', () => {
    for (const line of ['biznes', 'instalacje', 'software', 'prokom'] as const) {
      expect(new TextEncoder().encode(themeScript(line)).length, line).toBeLessThan(1500)
    }
  })
})

describe('defaultTheme', () => {
  it('is dark on Software and the hub, none (Auto) elsewhere', () => {
    expect(defaultTheme('software')).toBe('dark')
    expect(defaultTheme('prokom')).toBe('dark')
    expect(defaultTheme('biznes')).toBeNull()
    expect(defaultTheme('instalacje')).toBeNull()
    expect(defaultTheme(null)).toBeNull()
    expect(defaultTheme('nieznana')).toBeNull()
  })
})

describe('followsSystemTheme (tokens without JavaScript)', () => {
  it('is only Instalacje, whose tokens have a prefers-color-scheme block', () => {
    expect(followsSystemTheme('instalacje')).toBe(true)
    expect(followsSystemTheme('biznes')).toBe(false)
    expect(followsSystemTheme('software')).toBe(false)
  })
})

describe('THEME_STORAGE_KEY', () => {
  it('is the key from the Biznes specification (§3.5)', () => {
    expect(THEME_STORAGE_KEY).toBe('pk-theme')
  })
})

describe('hasDarkTheme', () => {
  it('is true only for lines with a dark design (ADR-013, ADR-015, ADR-I003 §6, ADR-H001)', () => {
    expect(hasDarkTheme('biznes')).toBe(true)
    expect(hasDarkTheme('software')).toBe(true)
    expect(hasDarkTheme('instalacje')).toBe(true)
    expect(hasDarkTheme('prokom')).toBe(true)
  })
})
