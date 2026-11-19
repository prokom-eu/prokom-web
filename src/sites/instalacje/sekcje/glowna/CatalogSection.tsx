import Image from 'next/image'
import Link from 'next/link'

import { brandHref } from '@/lib/catalog/brand'
import { getCatalogIndex } from '@/lib/catalog/data'
import { INSTALACJE_CATALOG_ENABLED } from '@/lib/catalog/lines'
import { featuredProducts, homeDepartments } from '@/lib/instalacje/homeCatalog'
import { getHomeFeaturedSlugs } from '@/lib/instalacje/homeCatalogData'
import { plural } from '@/lib/plural'
import { productHref } from '@/lib/catalog/card'
import { ProductCard } from '@/sites/biznes/components/catalog/ProductCard'

import { InstIcon } from '../../InstIcon'
import { InstSection } from '../InstSection'

const items = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`

/**
 * „Sprzęt i marki” on the home page (INST-K2, plan §3.4, D17): the catalog's departments with
 * three pictured cards each, the brand strip to the salons and „Najczęściej wybierane” (eight
 * cards from the panel), then the whole offer and the planner — equipment always next to the
 * service. The idea of the Biznes offer section, not its code or copy; no prices.
 */
export async function CatalogSection({ tenantId }: { tenantId: number }) {
  if (!INSTALACJE_CATALOG_ENABLED) return null
  const [index, slugs] = await Promise.all([
    getCatalogIndex(tenantId),
    getHomeFeaturedSlugs(tenantId),
  ])
  const departments = homeDepartments(index)
  if (departments.length === 0) return null
  const featured = featuredProducts(index, slugs)
  // One pill per salon (D17: the brand strip to the salons); a salon of several brands names them
  // all, with the first logo when the brand has one.
  const salons = new Map<
    string,
    { names: string[]; logo?: NonNullable<(typeof index.brands)[number]['logo']> }
  >()
  for (const brand of index.brands) {
    if (!brand.salon) continue
    const salon = salons.get(brand.salon) ?? { names: [] }
    salon.names.push(brand.name)
    salon.logo ??= brand.logo
    salons.set(brand.salon, salon)
  }

  return (
    <InstSection id="sprzet" className="isp xa-s" style={{ padding: '96px 0' }}>
      <div className="wrap">
        <div className="isp-head ri">
          <span className="eye">Sprzęt i marki</span>
          <h2 className="h2">Sprzęt, który montujemy — dobrany do budynku</h2>
          <p className="lead">
            Kamery, alarmy, domofony i uchwyty w katalogu bez cen: {items(index.products.length)} od
            marek, które znamy z montażu. Wybierz dział albo markę, a sprzęt z montażem dobierzemy
            do Twojego obiektu.
          </p>
        </div>

        <ul className="isp-deps" role="list">
          {departments.map((department) => (
            <li key={department.slug} className="isp-dep ri">
              <div className="isp-dep-pics" aria-hidden="true">
                {department.products.map((product) => (
                  <span key={product.slug} className="isp-dep-pic">
                    <Image
                      src={product.image!.url}
                      alt=""
                      width={120}
                      height={120}
                      unoptimized
                      loading="lazy"
                    />
                  </span>
                ))}
              </div>
              <h3 className="isp-dep-name">{department.name}</h3>
              <p className="isp-dep-count">{items(department.count)}</p>
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
            </li>
          ))}
        </ul>

        {salons.size > 0 && (
          <nav className="isp-brands ri" aria-label="Salony marek">
            <span className="isp-brands-label">Salony marek</span>
            <ul role="list">
              {[...salons].map(([slug, salon]) => (
                <li key={slug}>
                  <Link href={brandHref(slug)}>
                    {salon.logo && (
                      <Image
                        src={salon.logo.url}
                        alt=""
                        width={salon.logo.width}
                        height={salon.logo.height}
                        unoptimized
                        className="isp-brand-logo"
                      />
                    )}
                    {salon.names.join(' · ')}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/marki" className="isp-brands-all">
              Wszystkie marki
              <InstIcon name="arrow" size={16} strokeWidth={2.6} />
            </Link>
          </nav>
        )}

        {featured.length > 0 && (
          <div className="isp-feat">
            <h3 className="isp-feat-h">Najczęściej wybierane</h3>
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
          <Link href="/zaplanuj" className="isp-btn">
            Zaplanuj instalację
          </Link>
        </div>
      </div>
    </InstSection>
  )
}
