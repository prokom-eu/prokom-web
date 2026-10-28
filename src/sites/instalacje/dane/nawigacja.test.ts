import { describe, expect, it } from 'vitest'

import { OBJECT_KEYS, SERVICE_KEYS } from '../../../lib/instalacje/options'
import { navigation } from './nawigacja'

// The file is edited by hand: these rules keep the menus complete after every edit.
describe('navigation', () => {
  it('shows every service and object exactly once', () => {
    expect(navigation.serviceColumns.flatMap((c) => c.keys).sort()).toEqual(
      SERVICE_KEYS.map((k) => k.value).sort(),
    )
    expect(navigation.objectColumns.flatMap((c) => c.keys).sort()).toEqual(
      OBJECT_KEYS.map((k) => k.value).sort(),
    )
  })

  it('links only to addresses of the site and opens every sheet tab', () => {
    const hrefs = [
      ...navigation.bottomBar.flatMap((item) => ('href' in item ? [item.href] : [])),
      ...navigation.more.map((item) => item.href),
      navigation.cta.href,
    ]
    for (const href of hrefs) expect(href).toMatch(/^\/[a-z0-9/#=&-]*$/)
    const sheets = navigation.bottomBar.flatMap((item) => ('sheet' in item ? [item.sheet] : []))
    expect(sheets.sort()).toEqual(['more', 'objects', 'services'])
  })

  it('carries no prototype leftovers', () => {
    const text = JSON.stringify(navigation)
    expect(text).not.toContain('[svg-path]')
    expect(text).not.toMatch(/\.html|ikona:/)
  })
})
