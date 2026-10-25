import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import icons from '../../../seed/prokombiznes/ikony.json'
import softwareIcons from '../../../seed/prokomsoftware/ikony.json'
import { ICON_NAMES, isIconName } from '../../lib/catalog/options'
import { Icon } from './Icon'
import { ICON_PATHS } from './icons'

describe('icon set', () => {
  it('has exactly the paths of the seed packages, Biznes drawings winning on shared names', () => {
    // 14 names are in both packages; 11 of them are drawn differently — Biznes stays (ADR-014 rozstrz. 8).
    expect(ICON_PATHS).toEqual({ ...softwareIcons.icons, ...icons.ikony })
  })

  it('has a path for every icon name', () => {
    for (const name of ICON_NAMES) expect(ICON_PATHS[name]).toMatch(/^M/)
  })

  it('recognises icon names', () => {
    expect(isIconName('store')).toBe(true)
    expect(isIconName('unknown')).toBe(false)
    expect(isIconName(null)).toBe(false)
  })
})

describe('Icon', () => {
  it('is decorative without a title', () => {
    const html = renderToStaticMarkup(createElement(Icon, { name: 'store' }))
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('role="img"')
    expect(html).toContain(`d="${icons.ikony.store}"`)
  })

  it('has an accessible name with a title', () => {
    const html = renderToStaticMarkup(createElement(Icon, { name: 'phone', title: 'Telefon' }))
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Telefon"')
    expect(html).not.toContain('aria-hidden')
  })
})
