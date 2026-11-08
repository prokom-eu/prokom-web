import { readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { LAW_WORDS } from '../../../lib/instalacje/lawWords'

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))

/** Every string of a module's exports (functions called with a sample number where they take one). */
function texts(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (typeof value === 'function' && value.length <= 2) {
    try {
      texts((value as (...a: number[]) => unknown)(1, 3), out)
    } catch {
      // not a text helper
    }
  } else if (Array.isArray(value)) value.forEach((v) => texts(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => texts(v, out))
  return out
}

describe('no law on the Instalacje pages (runda v6 §1.1)', () => {
  it.each(files)('dane/%s has no words of law', async (file) => {
    const exported: unknown = await import(`./${file}`)
    expect(texts(exported).filter((t) => LAW_WORDS.test(t))).toEqual([])
  })

  it('the list catches the forms of law and leaves everyday words', () => {
    for (const bad of [
      'Kodeks pracy',
      'art. 22²',
      'ustawa o dostępności',
      'z ustawy',
      'rozporządzenie',
      'wyrok TSUE',
      'NIS2',
      'To nie jest porada prawna.',
      'ZAiKS i STOART',
      'zgłoszenie do UKE',
      'badanie UDT',
      'zgodnie z RODO',
      'warunki techniczne',
      'koncesja',
      'uchwała krajobrazowa',
    ])
      expect(bad).toMatch(LAW_WORDS)
    for (const ok of [
      'Ustawimy kadr i maski',
      'ustawienia kamery',
      'Kamery w pensjonacie',
      '/monitoring#rodo',
      'monitoring-a-rodo',
      'uprawnienia według stref',
    ])
      expect(ok).not.toMatch(LAW_WORDS)
  })
})
