import Image from 'next/image'
import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import type { PartnerSlug } from '@/lib/catalog/listing'

/** Texts of the board `Katalog` (partner cards), with the partners' own pages (B9). */
const PARTNER_TEXT: Record<
  PartnerSlug,
  { title: string; text: string; link: string; href: string }
> = {
  gopos: {
    title: 'GoPOS w Twoim lokalu — od prezentacji po serwis w sezonie',
    text: 'Sala, kuchnia, dowozy i KSeF. Sprzęt Sunmi i Posnet, fiskalizacja, szkolenie zespołu w lokalu.',
    link: 'Poznaj GoPOS z PRO-KOM',
    href: '/gopos',
  },
  insert: {
    title: 'Subiekt i programy InsERT — dobrane i podłączone do KSeF',
    text: 'Przeniesienie danych z innego programu, integracja z kasą, szkolenie na Twoich danych.',
    link: 'Który Subiekt dla mnie?',
    href: '/insert',
  },
}

const DARK_CARD =
  'relative isolate flex flex-col overflow-hidden rounded-[18px] bg-surface-dark text-white sm:rounded-3xl'

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** First picture of a product, decorative (the card's text says what it is about). */
function Picture({ product, className }: { product: IndexProduct; className?: string }) {
  if (!product.image) return null
  return (
    <Image
      src={product.image.url}
      alt=""
      width={product.image.width}
      height={product.image.height}
      unoptimized
      className={cx('h-auto w-auto object-contain', className)}
    />
  )
}

/** „Nie wiesz, co wybrać?” after the 5th position: the way to the wizard (spec. §5.3). */
export function WizardCard({ index }: { index: CatalogIndex }) {
  const pictures = index.products
    .filter((product) => product.featuredOrder !== undefined && product.image)
    .sort((a, b) => a.featuredOrder! - b.featuredOrder!)
    .slice(0, 3)
  return (
    <div
      data-surface="dark"
      className={cx(
        DARK_CARD,
        'w-full gap-4 bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_60%)] p-6',
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-accent-on-dark text-white"
      >
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path
            d="M12 21a8 8 0 100-16 8 8 0 000 16zM12 9v4l2.5 1.5M10 2h4M12 2v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h3 className="font-display text-[1.6rem] font-extrabold leading-tight text-white">
        Nie wiesz, co wybrać?
      </h3>
      <p className="leading-relaxed text-white/80">
        Odpowiedz na 4 pytania o firmę — dobierzemy zestaw pod Twoją branżę i dodamy go do
        zapytania. Bez rejestracji.
      </p>
      <Link
        href="/kreator"
        className="inline-flex min-h-12 items-center self-start rounded-xl bg-white px-5 font-extrabold text-surface-dark hover:underline"
      >
        Dobierz w 60 sekund
      </Link>
      {pictures.length > 0 && (
        // Hidden on a phone, as in `KatalogM`.
        <span
          aria-hidden="true"
          className="mt-auto flex items-end justify-center gap-3 pt-2 max-sm:hidden"
        >
          {pictures.map((product) => (
            <Picture key={product.slug} product={product} className="max-h-16 max-w-[30%]" />
          ))}
        </span>
      )}
    </div>
  )
}

/**
 * GoPOS / InsERT after the 11th position (spec. §5.3): one or both partners, each with its
 * logo, a picture of its product and the way to its page. „Autoryzowany partner” only with
 * the status confirmed in the panel ([SZEF], spec. §13 pkt 3).
 */
export function PartnersCard({
  partners,
  index,
}: {
  partners: PartnerSlug[]
  index: CatalogIndex
}) {
  return (
    <div
      data-surface="dark"
      className={cx(
        DARK_CARD,
        'w-full divide-y divide-white/10 sm:divide-x sm:divide-y-0',
        partners.length > 1 && 'sm:flex-row',
      )}
    >
      {partners.map((slug) => {
        const brand = index.brands.find((item) => item.slug === slug)
        const product = index.products.find((item) => item.brand === slug && item.image)
        const text = PARTNER_TEXT[slug]
        return (
          <div key={slug} className="relative isolate flex min-h-[320px] flex-1 flex-col p-6">
            {product && (
              // Only the top of the card, fading into it: the text below keeps its contrast.
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 -z-10 flex h-40 justify-end p-4 after:absolute after:inset-0 after:bg-linear-to-t after:from-surface-dark after:to-transparent"
              >
                <Picture product={product} className="max-h-32 opacity-40" />
              </span>
            )}
            <div className="mt-auto flex flex-col gap-3">
              {brand?.status === 'authorized-partner' && (
                <span className="self-start rounded-full bg-white/10 px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-footer-ok">
                  Autoryzowany partner
                </span>
              )}
              {brand?.logo && (
                <span className="self-start rounded-lg bg-white px-2.5 py-1.5">
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    unoptimized
                    className="h-auto max-h-6 w-auto max-w-[110px] object-contain"
                  />
                </span>
              )}
              <h3 className="font-display text-[1.45rem] font-extrabold leading-tight text-white">
                {text.title}
              </h3>
              <p className="leading-relaxed text-white/80">{text.text}</p>
              <Link
                href={text.href}
                className="inline-flex min-h-11 items-center gap-2 self-start text-[1.05rem] font-extrabold text-white hover:underline"
              >
                {text.link}
                <Arrow />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
