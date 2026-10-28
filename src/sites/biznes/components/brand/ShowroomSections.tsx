import Image from 'next/image'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { BrandView } from '@/lib/catalog/brand'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { ShowroomView } from '@/lib/catalog/showroom'
import { plural } from '@/lib/plural'

import { Breadcrumbs, type Crumb } from '../Breadcrumbs'
import { PageLink } from '../PageLink'
import { PathIcon } from '../product/PathIcon'
import { ProductStage, STAGE_SHADOW } from '../ProductStage'
import { ShowroomHeading } from './ShowroomHeading'

/**
 * Dark hero of the showroom (`k31/screens/Web-Marka-1440`): logo, H1 and lead from the
 * showroom, „Zobacz ofertę” / „Dobierz w 3 pytaniach”, the counters and a collage of up to 3
 * photos on the studio (one large, two small).
 */
export function ShowroomHero({
  brand,
  view,
  crumbs,
  stats,
  photos,
}: {
  brand: BrandView
  view: ShowroomView
  crumbs: Crumb[]
  stats: { products: number; series: number; segments: number }
  photos: IndexImage[]
}) {
  const counters = [
    { value: stats.products, label: plural(stats.products, ['pozycja', 'pozycje', 'pozycji']) },
    { value: stats.series, label: plural(stats.series, ['seria', 'serie', 'serii']) },
    { value: stats.segments, label: plural(stats.segments, ['dział', 'działy', 'działów']) },
  ]
  return (
    <Container wide className="pt-6 sm:pt-8">
      <Breadcrumbs items={crumbs} />
      <section
        aria-labelledby="salon-h1"
        data-surface="dark"
        className="relative mt-5 overflow-hidden rounded-[28px] bg-surface-dark px-5 py-7 text-white ring-1 ring-white/10 ring-inset sm:rounded-[36px] sm:px-12 sm:py-12 lg:px-14"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_85%_15%,color-mix(in_srgb,var(--accent)_40%,transparent),transparent_70%),radial-gradient(40%_60%_at_10%_100%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)]"
        />
        <div className="relative grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] min-[1080px]:gap-10">
          <div className="flex flex-col gap-5">
            <span className="inline-flex h-12 items-center self-start rounded-2xl bg-white px-4">
              {brand.logo ? (
                <MediaImage
                  image={brand.logo}
                  sizes="160px"
                  eager
                  className="h-6 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <span className="font-display text-lg font-extrabold text-surface-dark">
                  {brand.name}
                </span>
              )}
            </span>
            <h1
              id="salon-h1"
              className="font-display text-[clamp(2.1rem,3.6vw,3.5rem)] leading-[1.02] font-extrabold tracking-[-0.025em] font-stretch-112%"
            >
              {view.h1 ?? `${brand.name} dla firm`}
            </h1>
            {(view.lead ?? brand.shortDescription) && (
              <p className="max-w-[56ch] text-[clamp(1rem,1.3vw,1.2rem)] leading-relaxed text-white/80">
                {view.lead ?? brand.shortDescription}
              </p>
            )}
            <div className="flex flex-wrap gap-3 max-sm:hidden">
              <PageLink href="#salon" kind="light">
                Zobacz ofertę
              </PageLink>
              {view.rules.length > 0 && (
                <PageLink href="#dobor" kind="outlineDark">
                  Dobierz w 3 pytaniach
                </PageLink>
              )}
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {counters.map(({ value, label }) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className="text-sm text-white/70">{label}</dt>
                  <dd className="font-display text-[1.9rem] leading-none font-extrabold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {photos.length > 0 && <HeroCollage photos={photos} />}
        </div>
      </section>
    </Container>
  )
}

function HeroCollage({ photos }: { photos: IndexImage[] }) {
  const [first, ...rest] = photos
  return (
    <div
      aria-hidden="true"
      className={cx('grid gap-3 sm:gap-4', rest.length > 0 && 'grid-cols-[1.5fr_1fr] grid-rows-2')}
    >
      {[first!, ...rest.slice(0, 2)].map((photo, position) => (
        <ProductStage
          key={photo.url}
          className={cx(
            'rounded-[22px] p-4 sm:rounded-[26px]',
            position === 0 ? 'row-span-2 min-h-[220px] sm:min-h-[340px]' : 'min-h-[104px]',
          )}
        >
          <Image
            src={photo.url}
            alt=""
            width={photo.width}
            height={photo.height}
            unoptimized
            loading={position === 0 ? 'eager' : 'lazy'}
            className={cx(
              'relative h-auto w-auto max-w-[80%] object-contain',
              STAGE_SHADOW,
              position === 0 ? 'max-h-[78%]' : 'max-h-[74%]',
            )}
          />
        </ProductStage>
      ))}
    </div>
  )
}

/** „Kupujesz sprzęt — dostajesz gotowe stanowisko”: the showroom's services (6 tiles). */
export function ShowroomServices({ services }: { services: ShowroomView['services'] }) {
  if (services.length === 0) return null
  return (
    <section aria-labelledby="salon-uslugi">
      <ShowroomHeading id="salon-uslugi" eyebrow="Z PRO-KOM">
        Kupujesz sprzęt — dostajesz gotowe stanowisko
      </ShowroomHeading>
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {services.map((service) => (
          <li
            key={service.title}
            className="flex flex-col gap-2 rounded-3xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)] sm:p-6"
          >
            {service.icon && (
              <span className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
                <PathIcon d={service.icon} className="size-5" />
              </span>
            )}
            <h3 className="font-display text-lg font-extrabold">{service.title}</h3>
            <p className="text-sm leading-relaxed text-ink-2">{service.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** „Kilka stanowisk naraz?” — the closing band of the showroom. */
export function ShowroomCtaBand({ phone }: { phone: { label: string; href: string } | null }) {
  return (
    <section
      aria-labelledby="salon-cta"
      data-surface="dark"
      className="relative overflow-hidden rounded-[32px] bg-surface-dark px-6 py-10 text-white ring-1 ring-white/10 ring-inset sm:px-12 sm:py-14"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_85%_20%,color-mix(in_srgb,var(--accent)_45%,transparent),transparent_70%)]"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-8">
        <div className="max-w-[40rem]">
          <p className="mb-3 flex items-center gap-2.5 text-xs font-extrabold tracking-[0.12em] text-accent-on-dark uppercase">
            <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-current" />
            Flota dla firmy
          </p>
          <h2
            id="salon-cta"
            className="font-display text-[clamp(1.7rem,3.2vw,2.6rem)] leading-[1.05] font-extrabold tracking-[-0.02em] font-stretch-110%"
          >
            Kilka stanowisk naraz? Przygotujemy całość.
          </h2>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-white/80">
            Laptopy, monitory, stacje dokujące, programy i konfiguracja — w jednej ofercie na
            piśmie.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PageLink href="/zapytanie" kind="light">
            Przejdź do zapytania
          </PageLink>
          {phone && (
            <PageLink href={phone.href} kind="outlineDark">
              <span className="sr-only">Zadzwoń: </span>
              {phone.label}
            </PageLink>
          )}
        </div>
      </div>
    </section>
  )
}
