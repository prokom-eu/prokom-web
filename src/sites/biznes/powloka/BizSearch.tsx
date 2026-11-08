'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { SearchDialog } from '@/components/shared/SearchDialog'
import { Icon } from '@/components/ui/Icon'
import { brandTarget } from '@/lib/catalog/brand'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { biznesSearchProvider, productOfResult } from '@/lib/catalog/searchProvider'
import { useCatalogIndex } from '@/lib/catalog/useCatalogIndex'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { railIcon } from '@/lib/shared/rail'
import type { PaletteAction } from '@/lib/shared/search/palette'
import type { SearchProvider, SearchResult } from '@/lib/shared/search/provider'

import { AddToCartButton } from '../components/AddToCartButton'
import { ProductThumb } from '../components/ProductThumb'

type Props = {
  actions: readonly PaletteAction[]
  recentlyViewed: boolean
  phone: string | null
}

/** Until the catalog index arrives the dialog shows its actions only. */
const LOADING: SearchProvider = { empty: () => [], query: () => [] }

/**
 * Ctrl K / „/” of Biznes (plan 0611 §8.1 pkt 5): the shared search dialog over the catalog index
 * (`/api/catalog-index`, fetched the first time the dialog takes the focus — not on every page
 * view), the line's contact actions, „Zapytaj o …” → `/zapytanie?fraza=` and the preview of a
 * product (photo, brand, status, benefit, „Do zapytania”, „Karta”).
 */
export function BizSearch({ actions, recentlyViewed, phone }: Props) {
  const [wanted, setWanted] = useState(false)
  const catalog = useCatalogIndex(wanted)

  useEffect(() => {
    if (wanted) return
    const onFocus = (event: FocusEvent) => {
      if ((event.target as Element | null)?.closest?.('[data-search-dialog]')) setWanted(true)
    }
    document.addEventListener('focusin', onFocus)
    return () => document.removeEventListener('focusin', onFocus)
  }, [wanted])

  const index = catalog.index
  const provider = useMemo(() => (index ? biznesSearchProvider(index) : LOADING), [index])

  return (
    <SearchDialog
      provider={provider}
      actions={actions}
      line="biznes"
      recentlyViewed={recentlyViewed}
      contactHref="/zapytanie"
      phone={phone}
      label="Szukaj w ofercie"
      placeholder="Szukaj: kasa fiskalna, laptop, Wi-Fi w hotelu…"
      renderPreview={index ? (result) => <Preview result={result} index={index} /> : undefined}
    />
  )
}

function Preview({ result, index }: { result: SearchResult; index: CatalogIndex }) {
  const product = productOfResult(index, result)
  if (!product) {
    return (
      <div className="flex flex-col items-start gap-3">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-card text-accent-text">
          <Icon name={railIcon(result.icon)} className="size-6" strokeWidth={2} />
        </span>
        <p className="font-display text-lg leading-tight font-extrabold text-ink">{result.title}</p>
        {result.hint && <p className="text-sm text-ink-2">{result.hint}</p>}
        <Link href={result.href} className="font-extrabold text-accent-text hover:underline">
          Otwórz →
        </Link>
      </div>
    )
  }
  const brand = index.brands.find((item) => item.slug === product.brand)
  const status = partnerStatusLabel(brand?.status)
  const brandLink = brand && brandTarget(brand)
  return (
    <div className="flex flex-col gap-3">
      <ProductThumb product={product} index={index} large />
      <div className="flex flex-wrap items-center gap-2">
        {brand?.logo ? (
          // Brand logos stay on light tiles in both themes (K35 §6).
          <span className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-2">
            <Image
              src={brand.logo.url}
              alt={brand.name}
              width={brand.logo.width}
              height={brand.logo.height}
              unoptimized
              className="max-h-5 w-auto object-contain"
            />
          </span>
        ) : (
          brand && <span className="text-sm font-bold text-ink-2">{brand.name}</span>
        )}
        {status && (
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-ok-text">
            {status}
          </span>
        )}
      </div>
      <p className="font-display text-lg leading-tight font-extrabold text-ink">{product.name}</p>
      {product.benefit && <p className="text-sm text-ink-2">{product.benefit}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <AddToCartButton slug={product.slug} name={product.name} variant="label" />
        <Link href={result.href} className="font-extrabold text-accent-text hover:underline">
          Karta →
        </Link>
      </div>
      {brandLink && brand && (
        <Link href={brandLink} className="text-sm font-bold text-ink-2 hover:underline">
          Więcej {brand.name} →
        </Link>
      )}
    </div>
  )
}
