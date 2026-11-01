import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IndexImage } from '@/lib/catalog/catalogIndex'

import { Breadcrumbs, type Crumb } from '../Breadcrumbs'
import { PageLink } from '../PageLink'
import { ProductStage, STAGE_SHADOW } from '../ProductStage'

const H2 =
  'font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.04] font-extrabold tracking-[-0.02em] text-ink font-stretch-110%'

/**
 * Dark hero of a bundle (`Web-Zestaw-1440`, `App-Zestaw-390`): „Obszar · Poziom”, the name as
 * H1, who it is for, „Zapytaj o ten zestaw” (to the „Twój zestaw” card) and the phone; photos of
 * the items on the studio (up to 6; a row on the phone).
 */
export function BundleHero({
  label,
  name,
  audience,
  crumbs,
  photos,
  phone,
}: {
  label: string
  name: string
  audience: string
  crumbs: Crumb[]
  photos: IndexImage[]
  phone: { label: string; href: string } | null
}) {
  return (
    <Container wide className="pt-6 sm:pt-8">
      <Breadcrumbs items={crumbs} />
      <section
        aria-labelledby="zestaw-h1"
        data-surface="dark"
        className="relative mt-5 overflow-hidden rounded-[28px] bg-surface-dark px-5 py-7 text-white ring-1 ring-white/10 ring-inset sm:rounded-[36px] sm:px-12 sm:py-12 lg:px-14"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_85%_15%,color-mix(in_srgb,var(--accent)_40%,transparent),transparent_70%),radial-gradient(40%_60%_at_10%_100%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)]"
        />
        <div className="relative grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[1080px]:gap-10">
          <div className="flex flex-col gap-5">
            <span className="self-start rounded-md bg-white/12 px-2.5 py-1 text-xs font-bold text-white/90">
              {label}
            </span>
            <h1
              id="zestaw-h1"
              className="font-display text-[clamp(2rem,3.4vw,3.25rem)] leading-[1.04] font-extrabold tracking-[-0.025em] font-stretch-112%"
            >
              {name}
            </h1>
            <p className="max-w-[56ch] text-[clamp(1rem,1.3vw,1.15rem)] leading-relaxed text-white/80">
              {audience}
            </p>
            <div className="flex flex-wrap gap-3">
              <PageLink href="#twoj-zestaw" kind="light">
                Zapytaj o ten zestaw
              </PageLink>
              {phone && (
                <a
                  href={phone.href}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-2xl px-6 font-extrabold text-white ring-[1.5px] ring-white/35 ring-inset hover:bg-white/10 max-sm:hidden"
                >
                  <span className="sr-only">Zadzwoń: </span>
                  {phone.label}
                </a>
              )}
            </div>
          </div>
          {photos.length > 0 && (
            <ul
              aria-hidden="true"
              className="grid grid-cols-5 gap-2 sm:grid-cols-3 sm:gap-4 min-[1080px]:max-w-[520px] min-[1080px]:justify-self-end"
            >
              {photos.map((photo, position) => (
                <li key={photo.url} className={position >= 5 ? 'max-sm:hidden' : undefined}>
                  <ProductStage className="aspect-square rounded-xl sm:rounded-[22px]">
                    <Image
                      src={photo.url}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      unoptimized
                      loading="eager"
                      className={`relative max-h-[74%] w-auto max-w-[78%] object-contain ${STAGE_SHADOW}`}
                    />
                  </ProductStage>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Container>
  )
}

/** „Możesz zamienić” (spec. §6.10): X → Y and when. */
export function BundleSwaps({
  swaps,
}: {
  swaps: {
    from: { name: string; href: string }
    to: { name: string; href: string }
    when: string
  }[]
}) {
  if (swaps.length === 0) return null
  return (
    <section aria-labelledby="zamienniki-h" className="flex flex-col gap-5">
      <h2 id="zamienniki-h" className={H2}>
        Możesz zamienić
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {swaps.map((swap) => (
          <li key={`${swap.from.href}-${swap.to.href}`} className="rounded-[20px] bg-surface-2 p-5">
            <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-ink">
              <Link href={swap.from.href} className="hover:underline">
                {swap.from.name}
              </Link>
              <Icon name="arrow" strokeWidth={2.4} className="size-4 text-accent-text" />
              <span className="sr-only">można zamienić na</span>
              <Link href={swap.to.href} className="hover:underline">
                {swap.to.name}
              </Link>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{swap.when}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** „Dlaczego taki zestaw” — numbered reasons. */
export function BundleReasons({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null
  return (
    <section aria-labelledby="dlaczego-h" className="flex flex-col gap-5">
      <h2 id="dlaczego-h" className={H2}>
        Dlaczego taki zestaw
      </h2>
      <ol className="flex flex-col gap-4">
        {reasons.map((reason, position) => (
          <li key={reason} className="flex gap-4 leading-relaxed text-ink-2">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent-text"
            >
              {position + 1}
            </span>
            {reason}
          </li>
        ))}
      </ol>
    </section>
  )
}

/** „Zobacz też”: catalog categories named by the bundle. */
export function BundleRelated({ links }: { links: { name: string; href: string }[] }) {
  if (links.length === 0) return null
  return (
    <section aria-labelledby="zobacz-tez-h" className="flex flex-col gap-4">
      <h2 id="zobacz-tez-h" className={H2}>
        Zobacz też
      </h2>
      <ul className="flex flex-wrap gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <PageLink href={link.href} kind="outline" arrow>
              {link.name}
            </PageLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Hero of `/zestawy` (`Web-Zestawy-1440`): „N zestawów · M obszarów”, H1, the promise and a
 * collage of up to 3 bundle photos (hidden on the phone, `App-Zestawy-390`).
 */
export function BundlesHero({
  crumbs,
  eyebrow,
  photos,
}: {
  crumbs: Crumb[]
  eyebrow: string
  photos: IndexImage[]
}) {
  return (
    <Container wide className="pt-6 sm:pt-8">
      <Breadcrumbs items={crumbs} />
      <section
        aria-labelledby="zestawy-h1"
        data-surface="dark"
        className="relative mt-5 overflow-hidden rounded-[28px] bg-surface-dark px-5 py-8 text-white ring-1 ring-white/10 ring-inset sm:rounded-[36px] sm:px-12 sm:py-12 lg:px-14"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_85%_15%,color-mix(in_srgb,var(--accent)_40%,transparent),transparent_70%),radial-gradient(40%_60%_at_10%_100%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)]"
        />
        <div className="relative grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <p className="flex items-center gap-2.5 text-xs font-extrabold tracking-[0.12em] text-white/75 uppercase">
              <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-current" />
              {eyebrow}
            </p>
            <h1
              id="zestawy-h1"
              className="font-display text-[clamp(2.1rem,4vw,3.75rem)] leading-[1.02] font-extrabold tracking-[-0.025em] font-stretch-112%"
            >
              Gotowe zestawy: sprzęt, program i usługi, które działają razem
            </h1>
            <p className="max-w-[52ch] leading-relaxed text-white/80">
              Sprawdzamy, czy elementy zestawu działają razem: złącza, sterowniki i zgodność z
              programem. Każdy możesz zmienić, a my doradzimy, co i kiedy.
            </p>
          </div>
          {photos.length > 0 && (
            <ul aria-hidden="true" className="grid grid-cols-2 gap-4 max-[1079px]:hidden">
              {photos.map((photo, position) => (
                <li key={photo.url} className={position === 0 ? 'col-span-2' : undefined}>
                  <ProductStage
                    className={
                      position === 0 ? 'h-[200px] rounded-[26px]' : 'h-[130px] rounded-[22px]'
                    }
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      unoptimized
                      loading="eager"
                      className={`relative max-h-[76%] w-auto max-w-[70%] object-contain ${STAGE_SHADOW}`}
                    />
                  </ProductStage>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Container>
  )
}
