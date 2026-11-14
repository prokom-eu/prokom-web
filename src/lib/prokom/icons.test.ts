import { describe, expect, it } from 'vitest'

import narzedzia from '../../../seed/prokomeu/strony/Narzedzia.json'
import linie from '../../../seed/prokomeu/strony/Linie.json'
import { isIconName } from '../shared/icons'
import { DEFAULT_SERVICE_ICON, iconForService } from './icons'

const services = (linie.services as unknown[][]).map((row) => String(row[2]))
const tools = (narzedzia.data as unknown[][]).map((row) => String(row[2]))

describe('iconForService (spec §5.2, board Naglowek `icOf`)', () => {
  it('gives every one of the 49 services an icon other than the default', () => {
    expect(services).toHaveLength(49)
    const missing = services.filter((title) => iconForService(title) === DEFAULT_SERVICE_ICON)
    expect(missing).toEqual([])
  })

  it('gives every one of the 20 tools an icon other than the default', () => {
    const missing = tools.filter((title) => iconForService(title) === DEFAULT_SERVICE_ICON)
    expect(missing).toEqual([])
  })

  it('returns only icons of the shared set', () => {
    for (const title of [...services, ...tools])
      expect(isIconName(iconForService(title))).toBe(true)
  })

  it('keeps the order of the rules where words overlap', () => {
    expect(iconForService('Automatyzacje i AI')).toBe('gear')
    expect(iconForService('Automaty sprzedające')).toBe('vending')
    expect(iconForService('Kasy fiskalne')).toBe('receipt')
    expect(iconForService('Monitoring i kamery')).toBe('camera')
    expect(iconForService('Komputery do gier')).toBe('gamepad')
  })
})
