import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import type { ServiceKey } from '../../sites/instalacje/dane/types'

import { SERVICE_SECTION_IDS } from './anchors'

/** The sections component of each service page (`blocks/InstService/Component.tsx`, `LAYOUTS`). */
const SECTIONS_FILE: Record<ServiceKey, string> = {
  kam: 'monitoring/MonitoringSections.tsx',
  alarm: 'alarmy/AlarmySections.tsx',
  kd: 'dostep/DostepSections.tsx',
  wifi: 'sieci/SieciSections.tsx',
  tel: 'teletechnika/TeletechnikaSections.tsx',
  smart: 'smart/SmartSections.tsx',
  snd: 'naglosnienie/NaglosnienieSections.tsx',
  scr: 'ekrany/EkranySections.tsx',
  ev: 'ladowarki/LadowarkiSections.tsx',
  ant: 'anteny/AntenySections.tsx',
}

const idsIn = (file: string) => {
  const url = new URL(`../../sites/instalacje/widzety/${file}`, import.meta.url)
  const source = readFileSync(fileURLToPath(url), 'utf8')
  return new Set([...source.matchAll(/\bid=["']([a-z0-9-]+)["']/g)].map((match) => match[1]))
}

/**
 * The panel checks the anchor bar against `SERVICE_SECTION_IDS` (`anchorsError`), so an id that
 * the page no longer renders would let an anchor through that jumps nowhere (I7–I9 „one registry”).
 */
describe('service section ids', () => {
  it('has a list for every service', () => {
    expect(Object.keys(SERVICE_SECTION_IDS).sort()).toEqual(Object.keys(SECTIONS_FILE).sort())
  })

  it.each(Object.entries(SECTIONS_FILE))(
    '%s: every listed id is a section of the page',
    (key, file) => {
      const rendered = idsIn(file)
      const missing = (SERVICE_SECTION_IDS[key as ServiceKey] ?? []).filter(
        (id) => !rendered.has(id),
      )
      expect(missing).toEqual([])
    },
  )
})
