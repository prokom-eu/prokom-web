'use client'

import { useEffect, useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import type { PublicImage } from '@/lib/media/public'

import { ProductAddButton } from './ProductAddButton'
import { ProductStage } from '../ProductStage'

export type NavSection = { id: string; label: string }

/**
 * Sticky bar of the product page (K31-ZMIANY §4 pkt 2): only the sections that exist, the one
 * in view underlined, and a mini card with the CTA (its picture only when there is a photo).
 * Below the header on a desktop; on a phone `StickyAction` carries the CTA (M1′).
 */
export function ProductSectionNav({
  sections,
  name,
  image,
}: {
  sections: NavSection[]
  name: string
  image: PublicImage | null
}) {
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setCurrent(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [sections])

  if (sections.length === 0) return null
  return (
    <div className="sticky top-[72px] z-30 border-y border-border bg-header-bg/95 backdrop-blur-md max-lg:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-2 lg:px-8">
        <nav aria-label="Sekcje produktu" className="min-w-0 flex-1">
          <ul className="flex items-center gap-1 overflow-x-auto">
            {sections.map((section) => (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  aria-current={current === section.id ? 'true' : undefined}
                  className={cx(
                    'inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-bold transition-colors',
                    current === section.id ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:text-ink',
                  )}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          {image && (
            <ProductStage as="span" className="size-11 rounded-xl p-1">
              <MediaImage
                image={image}
                sizes="44px"
                className="relative h-full w-full object-contain"
              />
            </ProductStage>
          )}
          <span className="max-w-[16rem] truncate text-sm font-extrabold text-ink max-xl:hidden">
            {name}
          </span>
          <ProductAddButton variant="compact" />
        </div>
      </div>
    </div>
  )
}
