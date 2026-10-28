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
    const { megaServices, megaObjects, footer } = navigation
    const hrefs = [
      ...navigation.bottomBar.flatMap((item) => ('href' in item ? [item.href] : [])),
      ...navigation.more.map((item) => item.href),
      navigation.cta.href,
      navigation.topBar.fault.href,
      ...navigation.header.map((item) => item.href),
      ...[megaServices, megaObjects].flatMap((m) => [m.button.href, m.link.href]),
      navigation.ctaBand.button.href,
      footer.plan.href,
      ...footer.company.map((item) => item.href),
    ]
    for (const href of hrefs) expect(href).toMatch(/^\/[a-z0-9/#=&-]*$/)
    const sheets = navigation.bottomBar.flatMap((item) => ('sheet' in item ? [item.sheet] : []))
    expect(sheets.sort()).toEqual(['more', 'objects', 'services'])
  })

  it('links to other PRO-KOM sites over https only', () => {
    for (const { href } of [...navigation.topBar.links, ...navigation.footer.sites]) {
      expect(href).toMatch(/^https:\/\/[a-z0-9.-]+\.(pl|eu)$/)
    }
  })

  it('has „Dla architektów” where ADR-I005 §4 puts it', () => {
    const architects = '/dla-architektow'
    expect(navigation.header[0]).toMatchObject({ href: architects, accent: true })
    expect(navigation.megaObjects.link.href).toBe(architects)
    expect(navigation.more[0]).toMatchObject({ href: architects, icon: 'ruler' })
    expect(navigation.footer.company[0]?.href).toBe(architects)
  })

  it('carries no prototype leftovers', () => {
    const text = JSON.stringify(navigation)
    expect(text).not.toContain('[svg-path]')
    expect(text).not.toMatch(/\.html|ikona:/)
  })
})
