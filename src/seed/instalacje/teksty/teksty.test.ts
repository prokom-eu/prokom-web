import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { COPY_WORDS } from '../../../lib/instalacje/copyWords'
import { LAW_WORDS } from '../../../lib/instalacje/lawWords'
import { withoutLaw } from '../bezPrzepisow'
import { rewritten, TEXT_REWRITES } from '.'

const root = fileURLToPath(new URL('../../../../seed/prokominstalacje/', import.meta.url))

function jsonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? jsonFiles(join(dir, e.name))
      : e.name.endsWith('.json')
        ? [join(dir, e.name)]
        : [],
  )
}

function strings(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === 'string') out.add(value)
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out))
  return out
}

const packageTexts = new Set<string>()
for (const file of jsonFiles(root))
  strings(withoutLaw(JSON.parse(readFileSync(file, 'utf8')) as unknown), packageTexts)

describe('INST-6 text rewrites (runda v6 §2)', () => {
  it('every rewritten text exists in the package (after the law clean-up)', () => {
    expect(Object.keys(TEXT_REWRITES).filter((text) => !packageTexts.has(text))).toEqual([])
  })

  it('the new wording has no forbidden phrasings, no law, no exclamation marks', () => {
    const bad = Object.values(TEXT_REWRITES).filter(
      (t) => COPY_WORDS.test(t) || LAW_WORDS.test(t) || t.includes('!'),
    )
    expect(bad).toEqual([])
  })

  it('replaces exact texts deep inside a file', () => {
    const [from, to] = Object.entries(TEXT_REWRITES)[0] ?? ['', '']
    if (!from) return
    expect(rewritten({ a: [{ b: from }], c: 'inny' })).toEqual({ a: [{ b: to }], c: 'inny' })
  })
})

describe('INST-6 dictionaries', () => {
  it('a text is rewritten in one module only', async () => {
    const { USLUGI_MODULES } = await import('./uslugi')
    const seen = new Map<string, string>()
    const twice: string[] = []
    for (const [name, texts] of Object.entries(USLUGI_MODULES))
      for (const text of Object.keys(texts)) {
        if (seen.has(text)) twice.push(`${seen.get(text)} + ${name}: ${text.slice(0, 60)}`)
        seen.set(text, name)
      }
    expect(twice).toEqual([])
  })
})
