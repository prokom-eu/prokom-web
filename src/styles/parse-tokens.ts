import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Reads the token files for the token tests, so the checked values are the ones the browser gets:
 * `tokens.css` and the Instalacje rules split from it (`tokens-instalacje.css`, ADR-023).
 * Deliberately simple: one rule per selector, no nesting beyond `@media` blocks.
 * The paths are relative to this module, so the tests work from any working directory.
 */
export const TOKEN_FILES = ['tokens.css', 'tokens-instalacje.css'] as const

export const tokensCss = TOKEN_FILES.map((file) =>
  readFileSync(fileURLToPath(new URL(`./${file}`, import.meta.url)), 'utf8'),
).join('\n')

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

/** Bodies of the `@media (prefers-color-scheme: dark)` blocks (one per token file), joined. */
export function darkMediaBlock(css = tokensCss): string {
  const bodies: string[] = []
  let start = css.indexOf('@media (prefers-color-scheme: dark)')
  while (start !== -1) {
    const open = css.indexOf('{', start)
    let depth = 0
    let end = -1
    for (let i = open; i < css.length; i++) {
      if (css[i] === '{') depth++
      if (css[i] === '}' && --depth === 0) {
        end = i
        break
      }
    }
    if (end === -1) throw new Error('Unclosed @media block in the token files')
    bodies.push(css.slice(open + 1, end))
    start = css.indexOf('@media (prefers-color-scheme: dark)', end)
  }
  return bodies.join('\n')
}

/** Resolves `var(--x)` chains against the given declarations, e.g. to a hex colour. */
export function resolve(value: string, scope: Declarations): string {
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim())
  if (!match) return value.trim()
  const next = scope[match[1]]
  if (next === undefined) throw new Error(`Undefined ${match[1]}`)
  return resolve(next, scope)
}
