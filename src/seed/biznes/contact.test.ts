import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { BIZNES_COMPANY, BIZNES_CONTACT } from './contact'

/** Contact data the Biznes site must not show any more (decision of 01.11.2026). */
const OLD_CONTACT = [
  /biznes@pro-kom\.eu/,
  /biuro@pro-kom\.eu/,
  /18 267 65 11|182676511/,
  /example\.test/,
  /\b000 000 \d/,
]

const ROOT = process.cwd()
const files = (dir: string, ext: string) =>
  readdirSync(join(ROOT, dir), { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith(ext) && !name.endsWith(`.test${ext}`))
    .map((name) => join(dir, name))

/**
 * Every source of the Biznes seed: its code (texts, layouts) and the design package's JSON.
 * `textFixes.ts` lists the old values on purpose — to replace them in existing pages.
 */
const SOURCES = [
  ...files('src/seed/biznes', '.ts').filter((file) => !file.endsWith('textFixes.ts')),
  ...files('seed/prokombiznes/k4', '.json'),
  ...files('seed/prokombiznes/k31', '.json'),
]

describe('Biznes contact data (01.11.2026)', () => {
  it.each(SOURCES)('%s has no old phone or e-mail', (file) => {
    const text = readFileSync(join(ROOT, file), 'utf8')
    for (const pattern of OLD_CONTACT) expect(text, String(pattern)).not.toMatch(pattern)
  })

  it('is the new contact', () => {
    expect(BIZNES_CONTACT).toMatchObject({
      phone: '889 003 889',
      phone2: '883 200 151',
      email: 'kontakt@prokombiznes.pl',
    })
    for (const pattern of OLD_CONTACT) {
      expect(JSON.stringify(BIZNES_CONTACT)).not.toMatch(pattern)
    }
  })

  it('opens the office mon–fri 9–17, closed on Saturday and Sunday', () => {
    const [office] = BIZNES_COMPANY.locations ?? []
    expect(office).toMatchObject({ street: 'ul. Orkana 16B', city: 'Rabka-Zdrój' })
    expect(office?.hours).toEqual([
      { days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' },
    ])
    expect(BIZNES_COMPANY).toMatchObject({ name: 'PRO-KOM Tadeusz Wójciak', nip: '7352511447' })
  })
})
