import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareNotFound } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'

import { SearchTrigger } from './SearchTrigger'
import { softwareTextContext } from './textContext'
import { Glass } from './ui/Glass'

/**
 * 404 of the Software line — board `AU-404` (ZMIANY-v24 §9.7): the cosmic layer, „4 [planet] 4”,
 * eyebrow, H1, a field that opens the search window (`SearchDialog` of the frame), six tiles and
 * „Strona główna →” with the phone. Texts from `SoftwareSettings.notFound`; `null` without saved
 * texts — `not-found.tsx` then shows the generic page. The status stays 404: `notFound()` runs
 * before streaming starts.
 */
export async function NotFoundSoftware({ tenantId }: { tenantId: number }) {
  const [texts, context, settings] = await Promise.all([
    getSoftwareNotFound(tenantId),
    softwareTextContext(tenantId),
    getSiteSettings(tenantId),
  ])
  if (!texts) return null

  const fill = (value: string | undefined) => fillText(value, context)
  const title = fill(texts.title) ?? 'Tej strony tu nie ma.'
  const accent = fill(texts.titleAccent)
  const lead = fill(texts.lead)
  // A note with a missing fact or price goes; the tile stays.
  const tiles = texts.tiles.map((tile) => ({ ...tile, note: fill(tile.note) }))
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null

  return (
    // `data-final-cta`: no „Zacznij od podglądu” band on the 404 (ZMIANY-v24 §3.5).
    <section data-final-cta className="sw-sys sw-404">
      <div className="hx-cos" aria-hidden="true">
        <div className="s1" />
        <div className="s2" />
      </div>
      <div className="v-wrap sw-sys-in">
        <p className="sw-404-big" aria-hidden="true">
          <span>4</span>
          <span className="sw-404-orb">
            <i />
          </span>
          <span>4</span>
        </p>
        <p className="sw-eyebrow sw-sys-eb">{texts.eyebrow}</p>
        <h1 className="sw-h1-page">
          {title}
          {accent ? (
            <>
              {' '}
              <em className="sw-em-hero">{accent}</em>
            </>
          ) : null}
        </h1>
        {lead ? <p className="sw-sys-lead">{lead}</p> : null}
        <SearchTrigger className="sw-404-search">
          <Icon name="search" className="size-5" />
          <span>{texts.search}</span>
          <kbd aria-hidden="true">Ctrl K</kbd>
        </SearchTrigger>
        <ul className="sw-404-tiles">
          {tiles.map((tile) => (
            <li key={`${tile.href}-${tile.title}`}>
              <Glass as="div" className="sw-404-tile">
                <Link href={tile.href}>
                  {tile.icon ? (
                    <span className="sw-404-ii" aria-hidden="true">
                      <Icon name={tile.icon} className="size-5" />
                    </span>
                  ) : null}
                  <b>{tile.title}</b>
                  {tile.note ? <small>{tile.note}</small> : null}
                </Link>
              </Glass>
            </li>
          ))}
        </ul>
        <div className="sw-sys-actions">
          <Link href="/" className="sw-sys-btn sw-sys-btn-main">
            {texts.home}
          </Link>
          {tel ? (
            <a href={tel} className="sw-sys-btn">
              {texts.call} {phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
