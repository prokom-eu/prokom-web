import Image from 'next/image'
import Link from 'next/link'

import { productHref } from '@/lib/catalog/card'
import { getCatalogIndex } from '@/lib/catalog/data'
import { INSTALACJE_CATALOG_ENABLED } from '@/lib/catalog/lines'
import { serviceEquipment } from '@/lib/instalacje/serviceEquipment'

import { InstIcon } from '../InstIcon'
import { InstSection } from './InstSection'
import { SectionHead } from './SectionHead'

type Props = { tenantId: number; service: string; serviceName: string }

/**
 * „Sprzęt do tej usługi” on a service page (INST-K2, plan §3.4: links of the services → „Zobacz
 * sprzęt” in the catalog): three cards of the matching categories and the button to the catalog.
 * Nothing for a service without equipment in the catalog (network gear stays in Biznes).
 */
export async function ServiceEquipment({ tenantId, service, serviceName }: Props) {
  if (!INSTALACJE_CATALOG_ENABLED) return null
  const equipment = serviceEquipment(service, await getCatalogIndex(tenantId))
  if (!equipment) return null
  return (
    <InstSection id="sprzet-uslugi" style={{ padding: '72px 0' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="Sprzęt do tej usługi"
          heading={`${serviceName}: sprzęt, który montujemy`}
        />
        <p className="mt-2 max-w-[60ch] text-ink-2">
          W katalogu bez cen: {equipment.label}. Dobierzemy model do Twojego obiektu i zamontujemy
          go razem z całą instalacją.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3" role="list">
          {equipment.products.map((product) => (
            <li key={product.slug}>
              <Link
                href={productHref(product.slug)}
                className="flex h-full flex-col gap-3 rounded-[20px] bg-card p-4 text-ink no-underline shadow-[inset_0_0_0_1px_var(--border)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
              >
                <span className="block aspect-square overflow-hidden rounded-[14px] bg-plate">
                  <Image
                    src={product.image!.url}
                    alt=""
                    width={320}
                    height={320}
                    unoptimized
                    loading="lazy"
                    className="size-full object-contain"
                  />
                </span>
                <span className="font-bold leading-snug">{product.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={equipment.href}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
        >
          Zobacz sprzęt
          <InstIcon name="arrow" size={16} strokeWidth={2.6} />
        </Link>
      </div>
    </InstSection>
  )
}
