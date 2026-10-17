import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Reads `tokens.css` for the token tests, so the checked values are the ones the browser gets.
 * Deliberately simple: one rule per selector, no nesting beyond one `@media` block.
 * The path is relative to this module, so the tests work from any working directory.
 */
export const tokensCss = readFileSync(
  fileURLToPath(new URL('./tokens.css', import.meta.url)),
  'utf8',
)

export type Declarations = Record<string, string>

/** Declarations of one rule, e.g. `rule(":root")`, or `null` when the selector has no rule. */
export function findRule(selector: string, css = tokensCss): Declarations | null {
  const escaped = selector.replace(/[[\]().*+?^$|\\:]/g, '\\$&')
  const match = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^{}]*)\\}`).exec(css)
  if (!match) return null
  const body = match[1].replace(/\/\*[\s\S]*?\*\//g, '')
  return Object.fromEntries(
    body
      .split(';')
      .map((declaration) => {
        const colon = declaration.indexOf(':')
        return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()]
      })
      .filter(([name, value]) => name.startsWith('--') && value),
  )
}

export function rule(selector: string, css = tokensCss): Declarations {
  const found = findRule(selector, css)
  if (!found) throw new Error(`No rule for ${selector} in tokens.css`)
  return found
}

/** Body of the `@media (prefers-color-scheme: dark)` block, to look up rules inside it. */
export function darkMediaBlock(css = tokensCss): string {
  const start = css.indexOf('@media (prefers-color-scheme: dark)')
  if (start === -1) return ''
  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i)
  }
  throw new Error('Unclosed @media block in tokens.css')
}

/** Resolves `var(--x)` chains against the given declarations, e.g. to a hex colour. */
export function resolve(value: string, scope: Declarations): string {
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim())
  if (!match) return value.trim()
  const next = scope[match[1]]
  if (next === undefined) throw new Error(`Undefined ${match[1]}`)
  return resolve(next, scope)
}
