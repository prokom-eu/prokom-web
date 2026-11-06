import { describe, expect, it } from 'vitest'

import {
  defaultTheme,
  followsSystemTheme,
  hasDarkTheme,
  THEME_SCRIPT,
  THEME_STORAGE_KEY,
  themeScript,
} from './theme'

/** Runs the inline script against a fake `document` and `localStorage`. */
function runScript(stored: string | null | Error, script = THEME_SCRIPT): string | null {
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
  new Function('document', 'localStorage', script)(document, localStorage)
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

describe('themeScript (D-K4-5: Biznes light by default)', () => {
  const biznes = themeScript('biznes')

  it('starts Biznes light without a stored choice, never from the system', () => {
    expect(runScript(null, biznes)).toBe('light')
    expect(runScript('"><script>', biznes)).toBe('light')
    expect(runScript(new Error('SecurityError'), biznes)).toBe('light')
  })

  it('keeps the choice of the visitor on Biznes', () => {
    expect(runScript('dark', biznes)).toBe('dark')
  })

  it('leaves Instalacje on the system preference', () => {
    expect(themeScript('instalacje')).toBe(THEME_SCRIPT)
    expect(followsSystemTheme('instalacje')).toBe(true)
  })
})

describe('themeScript (ADR-015 v24: Software dark by default)', () => {
  const software = themeScript('software')

  it('starts Software dark without a stored choice, never from the system', () => {
    expect(runScript(null, software)).toBe('dark')
    expect(runScript('"><script>', software)).toBe('dark')
    expect(runScript(new Error('SecurityError'), software)).toBe('dark')
  })

  it('keeps the choice of the visitor on Software', () => {
    expect(runScript('light', software)).toBe('light')
  })

  it('does not follow the system on Software', () => {
    expect(followsSystemTheme('software')).toBe(false)
  })
})

describe('defaultTheme', () => {
  it('is light on Biznes, dark on Software, none elsewhere', () => {
    expect(defaultTheme('biznes')).toBe('light')
    expect(defaultTheme('software')).toBe('dark')
    expect(defaultTheme('instalacje')).toBeNull()
    expect(defaultTheme(null)).toBeNull()
    expect(defaultTheme('nieznana')).toBeNull()
  })
})

describe('THEME_STORAGE_KEY', () => {
  it('is the key from the Biznes specification (§3.5)', () => {
    expect(THEME_STORAGE_KEY).toBe('pk-theme')
  })
})

describe('hasDarkTheme', () => {
  it('is true only for lines with a dark design (ADR-013, ADR-015, ADR-I003 §6)', () => {
    expect(hasDarkTheme('biznes')).toBe(true)
    expect(hasDarkTheme('software')).toBe(true)
    expect(hasDarkTheme('instalacje')).toBe(true)
    expect(hasDarkTheme('prokom')).toBe(false)
  })
})
