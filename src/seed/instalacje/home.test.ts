import { describe, expect, it } from 'vitest'

import type { Page } from '../../payload-types'
import { HOME_SEO, instalacjeHomeBlock, mergeInstalacjeHome } from './home'

type Block = NonNullable<Page['layout']>[number]

const seed = [instalacjeHomeBlock()]
const sample = [{ blockType: 'hero' }, { blockType: 'partners' }] as Block[]

describe('Instalacje home seed', () => {
  it('replaces the sample page of `pnpm seed`', () => {
    expect(mergeInstalacjeHome(sample, seed)).toEqual(seed)
    expect(mergeInstalacjeHome(null, seed)).toEqual(seed)
  })

  it('keeps a page that already has the block (edited in the panel)', () => {
    const edited = [{ ...instalacjeHomeBlock(), hero: { ...seed[0].hero, h1a: 'Inny tytuł' } }]
    expect(mergeInstalacjeHome(edited, seed)).toBeNull()
  })

  it('inserts the block into a page laid out with other line blocks', () => {
    const other = [{ blockType: 'instService', service: 1 }] as Block[]
    expect(mergeInstalacjeHome(other, seed)?.map((b) => b.blockType)).toEqual([
      'instHome',
      'instService',
    ])
  })

  it('has the hero texts of the prototype, without placeholders', () => {
    const { hero } = seed[0]
    expect(`${hero.h1a} ${hero.h1b}`).toBe('Twój obiekt na żywo.')
    expect(hero.trust).toHaveLength(3)
    expect(JSON.stringify(hero)).not.toMatch(/\[[A-ZĄĆĘŁŃÓŚŹŻ ]+\]/)
  })

  it('takes the full home title from the package (no template on the start page)', () => {
    expect(HOME_SEO.title).toBe(
      'Monitoring, alarmy, Wi-Fi, smart home Podhale | PRO-KOM Instalacje',
    )
    expect(HOME_SEO.description.length).toBeLessThanOrEqual(155)
  })
})
