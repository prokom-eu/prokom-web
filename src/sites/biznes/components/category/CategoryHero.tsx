import Image from 'next/image'

import { cx } from '@/components/ui/cx'
import { MediaImage } from '@/components/MediaImage'
import type { IndexImage, IndexLogo } from '@/lib/catalog/catalogIndex'
import type { CategoryView } from '@/lib/catalog/category'

import type { Crumb } from '../Breadcrumbs'
import { CatalogHero } from '../catalog/CatalogHero'
import { STAGE_BG } from '../ProductStage'

type Props = {
  category: CategoryView
  crumbs: Crumb[]
  /** „Kasy i sprzedaż · 7 modeli · autoryzowany serwis Posnet i Elzab”. */
  pill: string
  /** Target of the main button: the register picker (`#dobor`) or the grid (`#produkty`). */
  primary: { label: string; href: string }
  phone: { label: string; href: string } | null
  /** Without a hero picture: up to 3 product photos on the stage, as on the board. */
  photos: IndexImage[]
  logos: { name: string; logo: IndexLogo }[]
}

/**
 * Hero of a category (board `Kategoria`): the catalog hero with the advantages as chips and, on
 * the right, the stage with the brands' logos and photos.
 */
export function CategoryHero({ category, crumbs, pill, primary, phone, photos, logos }: Props) {
  const stage = category.image !== null || photos.length > 0
  return (
    <CatalogHero
      crumbs={crumbs}
      pill={pill}
      title={category.title}
      lead={category.lead}
      primary={primary}
      phone={phone}
      chips={category.highlights}
      visual={
        stage && (
          <div
            className={cx(
              'relative overflow-hidden rounded-[32px] p-6 shadow-[inset_0_0_0_1px_var(--border)] sm:p-8',
              STAGE_BG,
            )}
          >
            {logos.length > 0 && (
              <ul className="relative z-10 flex flex-wrap justify-between gap-3">
                {logos.map(({ name, logo }) => (
                  <li
                    key={name}
                    className="flex h-11 items-center rounded-xl bg-white px-3.5 shadow-[0_8px_20px_-12px_var(--glow)]"
                  >
                    <Image
                      src={logo.url}
                      alt={name}
                      width={logo.width}
                      height={logo.height}
                      unoptimized
                      className="h-auto max-h-6 w-auto max-w-[110px] object-contain"
                    />
                  </li>
                ))}
              </ul>
            )}
            {category.image ? (
              <MediaImage
                image={category.image}
                sizes="(min-width: 1080px) 45vw, 100vw"
                eager
                className="mx-auto mt-6 h-auto max-h-[360px] w-auto object-contain"
              />
            ) : (
              // Catalog photos have a white background: white tiles in both themes, like the
              // brand tiles of the catalog filters.
              <ul className="mt-6 grid grid-cols-3 items-end gap-2.5 sm:gap-4">
                {photos.map((photo, position) => (
                  <li
                    key={photo.url}
                    className="flex aspect-square items-center justify-center rounded-2xl bg-white p-2 shadow-[0_24px_40px_-24px_var(--glow)] sm:rounded-3xl sm:p-3"
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      unoptimized
                      loading={position === 0 ? 'eager' : 'lazy'}
                      className="h-auto max-h-full w-auto max-w-full object-contain"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      }
    />
  )
}
