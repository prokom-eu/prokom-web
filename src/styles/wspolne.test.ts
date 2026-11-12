import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// Spec WSPOLNE-ELEMENTY §3 „Pasek przewijania”: since Chrome 121 `scrollbar-color` on an element
// switches its `::-webkit-scrollbar` styles off (MAPA-DZIS §10.3), so the standard property may
// only stand inside `@supports not selector(::-webkit-scrollbar)` — in every stylesheet.
const SUPPORTS = '@supports not selector(::-webkit-scrollbar)'

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return cssFiles(full)
    return entry.name.endsWith('.css') ? [full] : []
  })
}

/** The CSS without the `@supports not selector(::-webkit-scrollbar)` blocks. */
function outsideFallback(css: string): string {
  let rest = css
  let start = rest.indexOf(SUPPORTS)
  while (start !== -1) {
    const open = rest.indexOf('{', start)
    let depth = 0
    let end = open
    for (let i = open; i < rest.length; i++) {
      if (rest[i] === '{') depth++
      if (rest[i] === '}' && --depth === 0) {
        end = i
        break
      }
    }
    rest = rest.slice(0, start) + rest.slice(end + 1)
    start = rest.indexOf(SUPPORTS)
  }
  return rest
}

describe('page scrollbar', () => {
  it.each(cssFiles('src'))('%s: scrollbar-color only in the Firefox fallback', (file) => {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(outsideFallback(css)).not.toMatch(/scrollbar-color\s*:/)
  })

  it('the shared rule styles the page bar and hides `[scrollbar-width:none]` in WebKit', () => {
    const css = readFileSync('src/styles/wspolne.css', 'utf8')
    expect(css).toContain('html[data-line]::-webkit-scrollbar {')
    expect(css).toMatch(/\.\\\[scrollbar-width\\:none\\\]::-webkit-scrollbar \{\s*display: none;/)
  })
})
