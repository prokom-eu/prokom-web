import { describe, expect, it } from 'vitest'

import { panelResetEmailHtml, panelResetUrl } from './resetEmail'

describe('panel reset e-mail (audit AB4)', () => {
  it('production and staging: an absolute https link to the panel', () => {
    expect(
      panelResetUrl('abc', { PANEL_HOST: 'panel.prokombiznes.pl', SITE_ENV: 'production' }),
    ).toBe('https://panel.prokombiznes.pl/admin/reset/abc')
    expect(
      panelResetUrl('abc', { PANEL_HOST: 'panel.staging.prokombiznes.pl', SITE_ENV: 'staging' }),
    ).toBe('https://panel.staging.prokombiznes.pl/admin/reset/abc')
  })

  it('locally: http with the dev port', () => {
    expect(panelResetUrl('abc', { PANEL_HOST: 'panel.localhost', PORT: '3001' })).toBe(
      'http://panel.localhost:3001/admin/reset/abc',
    )
  })

  it('the e-mail carries the link', () => {
    const html = panelResetEmailHtml('t0k', {
      PANEL_HOST: 'panel.prokombiznes.pl',
      SITE_ENV: 'production',
    })
    expect(html).toContain('href="https://panel.prokombiznes.pl/admin/reset/t0k"')
  })
})
