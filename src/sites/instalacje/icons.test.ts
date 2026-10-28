import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { navigation } from './dane/nawigacja'
import { INST_ICONS, isInstIconName } from './icons'

type SeedItem = { ic?: string }
const shared = JSON.parse(readFileSync('seed/prokominstalacje/wspolne.json', 'utf8')) as {
  SV: SeedItem[]
  SG: SeedItem[]
}

/** `ikona:<name>` in the seed → `<name>` (the value the import writes to the panel). */
const seedIcon = (item: SeedItem) => item.ic?.replace(/^ikona:/, '')

describe('INST_ICONS', () => {
  it('has every icon the menus use', () => {
    const used = [
      ...navigation.bottomBar.map((item) => item.icon),
      ...navigation.more.map((item) => item.icon),
    ].filter((name): name is string => Boolean(name))
    for (const name of used) expect(isInstIconName(name), name).toBe(true)
  })

  it('has every icon of the services and objects in the seed (panel values)', () => {
    for (const name of [...shared.SV, ...shared.SG].map(seedIcon)) {
      expect(name && isInstIconName(name), String(name)).toBe(true)
    }
  })

  it('holds stroke paths only', () => {
    for (const d of Object.values(INST_ICONS)) expect(d).toMatch(/^M[\d\s.,\-a-zA-Z]+$/)
  })
})
