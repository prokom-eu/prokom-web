import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { AUTHORIZED } from '@/lib/prokom/brands'

import brandsModel from '../../../../seed/prokomeu/model/Marki.json'
import { AUTHORIZATION_PRODUCTS, BRAND_LOGOS } from './brandArt'

const exists = (src: string) => existsSync(join(process.cwd(), 'public', src))

describe('brand pictures (H9)', () => {
  it('every logo and product photo is a file in public/', () => {
    const files = [...Object.values(BRAND_LOGOS), ...Object.values(AUTHORIZATION_PRODUCTS)]
    expect(files.filter((file) => !exists(file.src)).map((file) => file.src)).toEqual([])
  })

  it('the four authorizations have a logo and a product', () => {
    for (const name of AUTHORIZED) {
      expect(BRAND_LOGOS[name], name).toBeDefined()
      expect(AUTHORIZATION_PRODUCTS[name].alt.length, name).toBeGreaterThan(5)
    }
  })

  it('logos are named as in the package (a renamed brand would lose its logo)', () => {
    const named = new Set(brandsModel.groups.flatMap((group) => group.brands))
    const unused = Object.keys(BRAND_LOGOS).filter(
      (name) => !named.has(name) && !(AUTHORIZED as readonly string[]).includes(name),
    )
    expect(unused).toEqual([])
  })
})
