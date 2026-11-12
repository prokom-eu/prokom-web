import { describe, expect, it } from 'vitest'

import type { CatalogIndex } from '@/lib/catalog/catalogIndex'

import { aboutBrands } from './aboutBrands'

type Brand = CatalogIndex['brands'][number]

const logo = { url: '/l.png', width: 200, height: 80 }
const brand = (slug: string, status: Brand['status'], extra: Partial<Brand> = {}): Brand => ({
  slug,
  name: slug[0]!.toUpperCase() + slug.slice(1),
  status,
  logo,
  ...extra,
})

const BRANDS: Brand[] = [
  brand('elzab', 'authorized-service', { salon: 'kasy' }),
  brand('comex', 'cooperation'),
  brand('posnet', 'authorized-service', { salon: 'kasy' }),
  brand('insert', 'authorized-partner', { page: true }),
  brand('gopos', 'authorized-partner', { page: true }),
  brand('optivendi', 'partner'),
  brand('lenovo', 'none', { page: true }),
  brand('dell', 'none'),
  { slug: 'storagecraft', name: 'StorageCraft', status: 'none' },
]

describe('aboutBrands („Marki, które sprzedajemy, wdrażamy i serwisujemy”)', () => {
  it('rows of statuses in the K4-FINAL §1 order, names in K4 order', () => {
    const { rows } = aboutBrands(BRANDS)
    expect(rows.map((row) => [row.label, row.brands.map((b) => b.name)])).toEqual([
      ['Autoryzowany serwis', ['Posnet', 'Elzab']],
      ['Autoryzowany partner', ['Gopos', 'Insert']],
      ['Partner', ['Optivendi']],
      ['We współpracy', ['Comex']],
    ])
  })

  it('the wall: other brands with a logo, by name, linked to their page when it exists', () => {
    const { others } = aboutBrands(BRANDS)
    expect(others.map((b) => [b.name, b.href])).toEqual([
      ['Dell', null],
      ['Lenovo', '/marki/lenovo'],
    ])
  })

  it('a status row without a brand with a logo is left out', () => {
    const { rows } = aboutBrands(BRANDS.filter((b) => b.slug !== 'optivendi'))
    expect(rows.map((row) => row.label)).not.toContain('Partner')
  })

  it('a salon brand leads to its salon', () => {
    expect(aboutBrands(BRANDS).rows[0]!.brands[0]!.href).toBe('/marki/kasy')
  })
})
