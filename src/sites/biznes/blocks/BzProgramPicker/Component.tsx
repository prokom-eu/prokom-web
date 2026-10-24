import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getCatalogIndex } from '@/lib/catalog/data'
import { publicImage } from '@/lib/media/public'
import type { BzProgramPickerBlock as BzProgramPickerBlockData } from '@/payload-types'

import { AddToCartButton } from '../../components/AddToCartButton'
import { SectionHead } from '../../components/home/SectionHead'
import { hasLink, PageLink } from '../../components/PageLink'
import { ProgramPicker } from './ProgramPicker'

type Props = { block: BzProgramPickerBlockData; tenantId: number }

/** Slug of the related product (populated at page depth 1 with `slug` only). */
const slugOf = (value: unknown): string | null =>
  value && typeof value === 'object' && 'slug' in value && typeof value.slug === 'string'
    ? value.slug
    : null

/**
 * „Który Subiekt dla mnie?” (spec. §6.6 pkt 2, plansza Insert), `#dobor`: one tile = one program
 * (decyzja 24.10). The product on the switch comes from this site's catalog index — published,
 * of this tenant; without it the panel has no switch.
 */
export async function BzProgramPickerBlock({ block, tenantId }: Props) {
  const index = await getCatalogIndex(tenantId)
  const products = new Map(index.products.map((product) => [product.slug, product]))
  // A whole tile number (the panel field takes decimals), within the list.
  const initial = Math.min(
    Math.max(Math.trunc(block.initial ?? 1) - 1, 0),
    block.options.length - 1,
  )

  const results = block.options.map((option, i) => {
    const product = products.get(slugOf(option.product) ?? '')
    const screen = publicImage(option.screenImage, tenantId)
    const box = publicImage(option.boxImage, tenantId)
    return (
      <div
        key={option.id ?? i}
        data-surface="dark"
        className="grid items-center gap-8 overflow-hidden rounded-[32px] bg-surface-dark bg-[radial-gradient(ellipse_at_85%_0%,color-mix(in_srgb,var(--accent-on-dark)_22%,transparent),transparent_60%)] p-6 text-white sm:p-10 min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      >
        <div className="flex flex-col gap-4">
          {block.resultLabel && (
            <p className="self-start rounded-full bg-promo px-3 py-1.5 text-[12.5px] font-extrabold tracking-[0.08em] text-promo-ink uppercase">
              {block.resultLabel}
            </p>
          )}
          <h3 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-none font-extrabold">
            {option.program}
          </h3>
          <p className="max-w-[52ch] text-lg leading-relaxed text-white/80">{option.description}</p>
          {option.points && option.points.length > 0 && (
            <ul className="flex flex-col gap-2">
              {option.points.map((point, j) => (
                <li key={point.id ?? j} className="flex items-center gap-2.5">
                  <Icon name="check" strokeWidth={2.6} className="size-4 shrink-0 text-ok" />
                  {point.text}
                </li>
              ))}
            </ul>
          )}
          {(product || hasLink(block.talk)) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {product && (
                <AddToCartButton slug={product.slug} name={product.name} variant="onDark" />
              )}
              {hasLink(block.talk) && (
                <PageLink href={block.talk.href} kind="outlineDark">
                  {block.talk.label}
                </PageLink>
              )}
            </div>
          )}
        </div>
        {screen && (
          <div className="relative pb-6 pl-10">
            <MediaImage
              image={screen}
              sizes="(min-width: 1000px) 520px, 85vw"
              className="h-auto w-full rounded-xl shadow-[0_30px_60px_-30px_var(--surface-dark)]"
            />
            {box && (
              <MediaImage
                image={box}
                sizes="140px"
                className="absolute bottom-0 left-0 h-auto w-[24%] max-w-[140px] drop-shadow-xl"
              />
            )}
          </div>
        )}
      </div>
    )
  })

  return (
    <section id="dobor" aria-labelledby="dobor-h" className="scroll-mt-24 py-14 sm:py-20">
      <Container wide>
        <SectionHead
          id="dobor-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />
        <div className="mt-9">
          <ProgramPicker
            options={block.options.map(({ trait, traitText, icon, program, caption }) => ({
              trait,
              traitText,
              icon,
              program,
              caption,
            }))}
            results={results}
            initial={initial}
          />
        </div>
      </Container>
    </section>
  )
}
