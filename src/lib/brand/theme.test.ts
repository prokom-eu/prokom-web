import { describe, expect, it } from 'vitest'

import { hasDarkTheme, THEME_SCRIPT, THEME_STORAGE_KEY } from './theme'

/** Runs the inline script against a fake `document` and `localStorage`. */
function runScript(stored: string | null | Error): string | null {
  let theme: string | null = null
  const document = {
    documentElement: { setAttribute: (_: string, value: string) => (theme = value) },
  }
  const localStorage = {
    getItem: (key: string) => {
      expect(key).toBe(THEME_STORAGE_KEY)
      if (stored instanceof Error) throw stored
      return stored
    },
  }
  new Function('document', 'localStorage', THEME_SCRIPT)(document, localStorage)
  return theme
}

describe('THEME_SCRIPT', () => {
  it('applies a stored choice', () => {
    expect(runScript('dark')).toBe('dark')
    expect(runScript('light')).toBe('light')
  })

  it('leaves the attribute alone without a choice (system preference decides)', () => {
    expect(runScript(null)).toBeNull()
  })

  it('ignores unexpected values', () => {
    expect(runScript('"><script>')).toBeNull()
  })

  it('does not throw when storage is blocked', () => {
    expect(runScript(new Error('SecurityError'))).toBeNull()
  })
})

describe('THEME_STORAGE_KEY', () => {
  it('is the key from the Biznes specification (§3.5)', () => {
    expect(THEME_STORAGE_KEY).toBe('pk-theme')
  })
})

describe('hasDarkTheme', () => {
  it('is true only for lines with a dark design (ADR-013, ADR-015)', () => {
    expect(hasDarkTheme('biznes')).toBe(true)
    expect(hasDarkTheme('software')).toBe(true)
    expect(hasDarkTheme('instalacje')).toBe(false)
    expect(hasDarkTheme('prokom')).toBe(false)
  })
})
