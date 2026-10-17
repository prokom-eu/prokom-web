import { describe, expect, it } from 'vitest'

import { hasDarkTheme, THEME_SCRIPT } from './theme'

/** Runs the inline script against a fake `document` and `localStorage`. */
function runScript(stored: string | null | Error): string | null {
  let theme: string | null = null
  const document = {
    documentElement: { setAttribute: (_: string, value: string) => (theme = value) },
  }
  const localStorage = {
    getItem: () => {
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

describe('hasDarkTheme', () => {
  it('is true only for lines with a dark design (ADR-013)', () => {
    expect(hasDarkTheme('biznes')).toBe(true)
    expect(hasDarkTheme('instalacje')).toBe(false)
    expect(hasDarkTheme('software')).toBe(false)
    expect(hasDarkTheme('prokom')).toBe(false)
  })
})
