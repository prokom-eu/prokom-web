import Link from 'next/link'

import { HUB_LINES } from '@/lib/prokom/lines'
import { hubPhone } from '@/lib/prokom/lineContacts'
import { getSharedData } from '@/lib/shared/getSharedData'
import { toTelHref } from '@/lib/site/link'

import { HUB_CONTAINER } from './container'
import { lineStyle } from './lineColors'

/** Hub search (`/szukaj?q=`, spec §5.6) — the 404 form sends its phrase there. */
const SEARCH_PATH = '/szukaj'

/**
 * 404 of pro-kom.eu (spec §6.15, board 15 `E404.dc.html`): the message, the hub search, the five
 * lines from `CompanyData.lines` (name, description, domain) and the company phone from the hub's
 * `SiteSettings` — no contact data in code. A plain GET form, so it works without JavaScript.
 */
export async function NotFoundProkom({ tenantId }: { tenantId: number }) {
  const shared = await getSharedData(tenantId)
  const lines = HUB_LINES.flatMap((key) => {
    const line = shared?.lines.find((entry) => entry.key === key)
    return line?.url ? [{ ...line, key, url: line.url }] : []
  })
  const phone = hubPhone(shared?.line.phone ?? null)
  const tel = phone ? toTelHref(phone) : null
  const phone2 = hubPhone(shared?.line.phone2 ?? null)
  const tel2 = phone2 ? toTelHref(phone2) : null

  return (
    <div className="pk-home">
      <section className={`${HUB_CONTAINER} pk-404`} aria-labelledby="pk-404-h1">
        <div className="pk-404__top">
          <p className="pk-404__code" aria-hidden="true">
            404
          </p>
          <div className="pk-404__body">
            <p className="pk-eb">Błąd 404</p>
            <h1 id="pk-404-h1" className="pk-h1">
              Ta strona się rozłączyła.
            </h1>
            <p className="pk-lead">
              Adres mógł się zmienić, bo oferta PRO-KOM mieszka teraz na stronach linii. Napisz,
              czego szukasz, albo wybierz linię poniżej.
            </p>
            <form action={SEARCH_PATH} method="get" role="search" className="pk-404__search">
              <label htmlFor="q404" className="pk-eb">
                Czego potrzebujesz?
              </label>
              <div className="pk-404__field">
                <input
                  id="q404"
                  name="q"
                  type="search"
                  placeholder="np. kasa fiskalna, kamery, strona, pęknięty ekran"
                  autoComplete="off"
                  maxLength={120}
                />
                <button type="submit" className="pk-hbtn pk-hbtn--accent">
                  Szukaj
                </button>
              </div>
            </form>
            <div className="pk-404__actions">
              <Link href="/" className="pk-hbtn">
                <span aria-hidden="true">←</span> Strona główna
              </Link>
              {phone && tel && (
                <a href={tel} className="pk-hbtn pk-hbtn--phone">
                  {phone}
                </a>
              )}
              {phone2 && tel2 && (
                <a href={tel2} className="pk-hbtn pk-hbtn--phone">
                  {phone2}
                </a>
              )}
            </div>
          </div>
        </div>
        {lines.length > 0 && (
          <ul className="pk-404__lines" aria-label="Linie PRO-KOM">
            {lines.map((line) => (
              <li key={line.key} style={lineStyle(line.key)}>
                <a href={line.url} className="pk-404__line">
                  <span className="pk-404__name">{line.name}</span>
                  {line.description && <span className="pk-404__desc">{line.description}</span>}
                  {line.domain && (
                    <span className="pk-404__domain">
                      {line.domain} <span aria-hidden="true">↗</span>
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
