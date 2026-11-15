import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/*
 * Content rules of pro-kom.eu (spec §3): phones, e-mails, hours and addresses only from
 * `CompanyData` / `SiteSettings`; no prices, financing or WhatsApp. Code of the hub must not carry
 * them as literals — the panel and the seed do (seed and test files are left out).
 */
const ROOTS = ['src/sites/prokom', 'src/lib/prokom']

const files = ROOTS.flatMap((root) =>
  readdirSync(root, { recursive: true, encoding: 'utf8' })
    .map((file) => join(root, file))
    .filter((file) => /\.(tsx?|css)$/.test(file) && !/\.test\.tsx?$/.test(file)),
)

const RULES: [string, RegExp][] = [
  ['phone number', /\b\d{3}[ -]?\d{3}[ -]?\d{3}\b/],
  ['e-mail address', /[\w.+-]+@[\w-]+\.[a-z]{2,}/i],
  ['price in złoty', /\d\s*zł|(?<!\p{L})zł(?!\p{L})/iu],
  ['WhatsApp', /whatsapp/i],
  ['leasing', /leasing/i],
  ['instalments', /(?<!\p{L})rat[yaęo]?(?!\p{L})/iu],
  ['„gratis”', /gratis/i],
  ['„w cenie”', /w cenie/i],
]

describe('hub code has no contact or price literals (spec §3)', () => {
  it('finds the hub sources', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  it.each(RULES)('no %s', (_name, pattern) => {
    const hits = files.filter((file) => pattern.test(readFileSync(file, 'utf8')))
    expect(hits).toEqual([])
  })
})

describe('hub shows one e-mail (audit H8 pkt 3)', () => {
  it('takes the hub line e-mail (like the footer), never `CompanyData.email`', () => {
    const hits = files.filter((file) => /company\??\.email/.test(readFileSync(file, 'utf8')))
    expect(hits).toEqual([])
  })
})
