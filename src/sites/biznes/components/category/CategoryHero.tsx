import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import type { IndexImage, IndexLogo } from '@/lib/catalog/catalogIndex'
import type { CategoryView } from '@/lib/catalog/category'

import { Breadcrumbs, type Crumb } from '../Breadcrumbs'
import { PageLink } from '../PageLink'

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
 * Hero of a category (board `Kategoria`): breadcrumbs, the label with a dot, H1, lead, two
 * buttons and the advantages; on the right the stage with the brands' logos and photos.
 */
export function CategoryHero({ category, crumbs, pill, primary, phone, photos, logos }: Props) {
  const stage = category.image !== null || photos.length > 0
  return (
    <section className="relative overflow-hidden pt-6 pb-14 sm:pt-8 sm:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_90%_10%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <p className="inline-flex items-center gap-2.5 self-start text-[15px] font-bold text-ink">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full bg-ok shadow-[0_0_0_4px_color-mix(in_srgb,var(--ok)_25%,transparent)]"
              />
              {pill}
            </p>
            <h1 className="font-display text-[clamp(2.3rem,4.4vw,4rem)] leading-[1] font-extrabold tracking-[-0.025em] font-stretch-112%">
              {category.title}
            </h1>
            {category.lead && (
              <p className="max-w-[54ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-ink-2">
                {category.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <PageLink href={primary.href} arrow>
                {primary.label}
              </PageLink>
              {phone && (
                <PageLink href={phone.href} kind="outline">
                  Zadzwoń: {phone.label}
                </PageLink>
              )}
            </div>
            {category.highlights.length > 0 && (
              <ul className="flex flex-wrap gap-2.5">
                {category.highlights.map((item, position) => (
                  <li
                    key={position}
                    className="inline-flex items-center gap-2 rounded-xl bg-card px-3.5 py-2 text-sm font-bold text-ink shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    <span aria-hidden="true" className="size-2 rounded-full bg-accent-text" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {stage && (
            <div className="relative overflow-hidden rounded-[32px] bg-surface-2 bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-size-[28px_28px] p-6 shadow-[inset_0_0_0_1px_var(--border)] sm:p-8">
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
          )}
        </div>
      </Container>
    </section>
  )
}
