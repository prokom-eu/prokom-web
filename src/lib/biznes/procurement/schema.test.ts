import { describe, expect, it } from 'vitest'

import file from '../../../../seed/prokombiznes/k4/strony-k4.json'
import { resolveProcurementImages } from '../../../seed/biznes/procurementPages'
import { NO_FLAGS } from './flags'
import { parseProcurementPage, procurementPageSchema, validateProcurementPage } from './schema'

const pages = (file as unknown as { zaopatrzenie: Record<'agd' | 'it', unknown> }).zaopatrzenie
const stored = (variant: 'agd' | 'it') => {
  let id = 0
  return resolveProcurementImages(pages[variant], () => ++id).data as Record<string, unknown>
}

describe('procurement page schema (panel check and render)', () => {
  it('renders the page only for the block variant it was written for', () => {
    expect(parseProcurementPage(stored('agd'), NO_FLAGS, 'agd')?.variant).toBe('agd')
    expect(parseProcurementPage(stored('agd'), NO_FLAGS, 'it')).toBeNull()
  })

  it('refuses a default class outside the classes and default stages outside the options', () => {
    const agd = stored('agd')
    const configurator = agd.configurator as Record<string, unknown>
    expect(
      validateProcurementPage({ ...agd, configurator: { ...configurator, defaultClass: 3 } }),
    ).toMatch(/defaultClass/)
    const delivery = configurator.delivery as Record<string, unknown>
    expect(
      validateProcurementPage({
        ...agd,
        configurator: { ...configurator, delivery: { ...delivery, defaultStages: 5 } },
      }),
    ).toMatch(/defaultStages/)
  })

  it('keeps every §0 marker of the package (a schema without `when` would show the text)', () => {
    const markers = (value: unknown) => JSON.stringify(value).match(/"when":/g)?.length ?? 0
    for (const variant of ['agd', 'it'] as const) {
      expect(markers(procurementPageSchema.parse(stored(variant)))).toBe(markers(pages[variant]))
    }
  })

  it('shows no „60 min” and no service promise without the panel entries', () => {
    for (const variant of ['agd', 'it'] as const) {
      const text = JSON.stringify(parseProcurementPage(stored(variant), NO_FLAGS, variant))
      expect(text).not.toMatch(/60 min|\{callback\}|przenosimy dane|Numery inwentarzowe|1 za 1/)
    }
  })
})
