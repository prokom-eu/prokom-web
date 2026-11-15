import Link from 'next/link'

import { AREA_PATH, AREA_TOWNS, areaHref } from '@/lib/instalacje/area'

import { InstIcon } from '../InstIcon'

/**
 * „Obszar działania” under a service page's content (ADR-I006 §6): links to every town page, so
 * „<usługa> <miasto>” leads from the service to the town and back.
 */
export function AreaStrip({ service }: { service: string }) {
  return (
    <section aria-labelledby="obszar-h" style={{ padding: '0 0 72px' }}>
      <div className="wrap">
        <h2 id="obszar-h" className="eye">
          Obszar działania
        </h2>
        <p className="mt-2 max-w-[720px] text-ink-2">
          {service} od Rabki-Zdroju po Kraków. Zobacz, co montujemy w Twojej okolicy:
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {AREA_TOWNS.map((town) => (
            <li key={town.slug}>
              <Link href={areaHref(town.slug)} className="tag a">
                <InstIcon name="pin" size={13} />
                {town.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href={AREA_PATH} className="tag">
              Wszystkie miejscowości
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
