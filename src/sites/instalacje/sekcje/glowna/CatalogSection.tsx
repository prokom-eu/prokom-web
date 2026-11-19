import Image from 'next/image'
import Link from 'next/link'

import { brandHref } from '@/lib/catalog/brand'
import { BUNDLES_PATH, bundleCard, listBundles } from '@/lib/catalog/bundle'
import { productHref } from '@/lib/catalog/card'
import { getBundles, getCatalogIndex } from '@/lib/catalog/data'
import { INSTALACJE_CATALOG_ENABLED } from '@/lib/catalog/lines'
import { featuredProducts, homeDepartments, homeSalons } from '@/lib/instalacje/homeCatalog'
import { getHomeFeaturedSlugs } from '@/lib/instalacje/homeCatalogData'
import { plural } from '@/lib/plural'
import { BundleTile } from '@/sites/biznes/components/bundle/BundleTile'
import { ProductCard } from '@/sites/biznes/components/catalog/ProductCard'

import { InstIcon } from '../../InstIcon'
import { InstSection } from '../InstSection'

const items = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`
/** Bundles on the home page: the first ready ones in the panel order. */
const HOME_BUNDLES = 3

/**
 * „Sprzęt i marki” on the home page (INST-K2, D17; premium INST-K3): the catalog's departments as
 * showcase cards, the salons as logo tiles, the first ready bundles with the way to all of them,
 * „Najczęściej wybierane” (eight cards from the panel), then the whole offer and the planner —
 * equipment always next to the service. No prices.
 */
export async function CatalogSection({ tenantId }: { tenantId: number }) {
  if (!INSTALACJE_CATALOG_ENABLED) return null
  const [index, slugs, allBundles] = await Promise.all([
    getCatalogIndex(tenantId),
    getHomeFeaturedSlugs(tenantId),
    getBundles(tenantId),
  ])
  const departments = homeDepartments(index)
  if (departments.length === 0) return null
  const featured = featuredProducts(index, slugs)
  const salons = homeSalons(index)
  const products = new Map(index.products.map((product) => [product.slug, product]))
  const bundles = listBundles(allBundles, new Set(products.keys())).filter(
    (bundle) => bundle.indexable,
  )
  const stats = [
    {
      value: index.products.length,
      label: plural(index.products.length, ['pozycja', 'pozycje', 'pozycji']),
    },
    { value: index.brands.length, label: plural(index.brands.length, ['marka', 'marki', 'marek']) },
    ...(bundles.length
      ? [
          {
            value: bundles.length,
            label: plural(bundles.length, ['zestaw', 'zestawy', 'zestawów']),
          },
        ]
      : []),
  ]

  return (
    <InstSection id="sprzet" className="isp xa-s" style={{ padding: '96px 0' }}>
      <div className="wrap">
        <div className="isp-head ri">
          <div className="isp-head-copy">
            <span className="eye">Sprzęt i marki</span>
            <h2 className="h2">Sprzęt, który montujemy — dobrany do budynku</h2>
            <p className="lead">
              Kamery, alarmy, domofony i uchwyty od marek, które znamy z montażu. Wybierz dział,
              salon marki albo gotowy zestaw — sprzęt z montażem dobierzemy do Twojego obiektu.
            </p>
          </div>
          <dl className="isp-stats" aria-label="Katalog w liczbach">
            {stats.map((stat) => (
              <div key={stat.label} className="isp-stat">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <b>{stat.value}</b>
                  <span aria-hidden="true">{stat.label}</span>
                </dd>
              </div>
            ))}
            <p className="isp-stats-note">bez cen · dobór i montaż u nas</p>
          </dl>
        </div>

        <ul className="isp-deps" role="list">
          {departments.map((department) => (
            <li key={department.slug} className="isp-dep ri">
              <div className="isp-dep-stage" aria-hidden="true">
                {department.products.map((product) => (
                  <span key={product.slug} className="isp-dep-pic">
                    <Image
                      src={product.image!.url}
                      alt=""
                      width={240}
                      height={240}
                      unoptimized
                      loading="lazy"
                    />
                  </span>
                ))}
              </div>
              <div className="isp-dep-body">
                <div className="isp-dep-top">
                  <h3 className="isp-dep-name">{department.name}</h3>
                  <span className="isp-dep-count">{items(department.count)}</span>
                </div>
                <ul className="isp-dep-list" role="list">
                  {department.products.map((product) => (
                    <li key={product.slug}>
                      <Link href={productHref(product.slug)}>{product.name}</Link>
                    </li>
                  ))}
                </ul>
                <Link href={department.href} className="isp-dep-link">
                  Zobacz dział
                  <span className="sr-only"> {department.name}</span>
                  <InstIcon name="arrow" size={16} strokeWidth={2.6} />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {salons.length > 0 && (
          <section className="isp-block ri" aria-labelledby="isp-salony-h">
            <div className="isp-block-head">
              <div>
                <h3 id="isp-salony-h" className="isp-block-h">
                  Salony marek
                </h3>
                <p className="isp-block-lead">
                  Serie, aplikacje i to, co do czego pasuje — u marek, które montujemy najczęściej.
                </p>
              </div>
              <Link href="/marki" className="isp-more">
                Wszystkie marki
                <InstIcon name="arrow" size={16} strokeWidth={2.6} />
              </Link>
            </div>
            <ul className="isp-salons" role="list">
              {salons.map((salon) => (
                <li key={salon.slug}>
                  <Link href={brandHref(salon.slug)} className="isp-salon">
                    <span className="isp-salon-logo">
                      {salon.logo ? (
                        <Image
                          src={salon.logo.src}
                          alt=""
                          width={salon.logo.width}
                          height={salon.logo.height}
                          unoptimized
                          loading="lazy"
                        />
                      ) : (
                        <span className="isp-salon-word" aria-hidden="true">
                          {salon.name}
                        </span>
                      )}
                    </span>
                    <span className="isp-salon-meta">
                      <span className="isp-salon-name">Salon {salon.name}</span>
                      <span className="isp-salon-count">{items(salon.count)}</span>
                    </span>
                    <InstIcon name="arrow" size={16} strokeWidth={2.6} className="isp-salon-go" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {bundles.length > 0 && (
          <section className="isp-block ri" aria-labelledby="isp-zestawy-h">
            <div className="isp-block-head">
              <div>
                <h3 id="isp-zestawy-h" className="isp-block-h">
                  Gotowe zestawy
                </h3>
                <p className="isp-block-lead">
                  Kamery, alarm i domofon dobrane do siebie — dla domu, pensjonatu, firmy i parafii.
                  Każdy zestaw dopasujemy do budynku.
                </p>
              </div>
              <Link href={BUNDLES_PATH} className="isp-more">
                Wszystkie zestawy ({bundles.length})
                <InstIcon name="arrow" size={16} strokeWidth={2.6} />
              </Link>
            </div>
            <ul className="isp-bundles" role="list">
              {bundles.slice(0, HOME_BUNDLES).map((bundle) => (
                <li key={bundle.slug}>
                  <BundleTile bundle={bundleCard(bundle, products)} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {featured.length > 0 && (
          <div className="isp-feat">
            <h3 className="isp-block-h">Najczęściej wybierane</h3>
            <ul className="isp-feat-list" role="list">
              {featured.map((product, position) => (
                <li key={product.slug}>
                  <ProductCard
                    product={product}
                    index={index}
                    position={position}
                    variant="home"
                    headingLevel={4}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="isp-cta ri">
          <Link href="/oferta" className="isp-btn isp-btn-main">
            Cały sprzęt
            <InstIcon name="arrow" size={16} strokeWidth={2.6} />
          </Link>
          {bundles.length > 0 && (
            <Link href={BUNDLES_PATH} className="isp-btn">
              Gotowe zestawy
            </Link>
          )}
          <Link href="/zaplanuj" className="isp-btn">
            Zaplanuj instalację
          </Link>
        </div>
      </div>
    </InstSection>
  )
}
