import Link from 'next/link'
import type { ReactNode } from 'react'

import { Icon } from '@/components/ui/Icon'
import { isIconName } from '@/lib/shared/icons'
import type { HubLine } from '@/lib/prokom/lines'
import { isHubLinkLive, type HubPageFlags } from '@/lib/prokom/pages'
import type { HubSearchEntry, HubSearchFilter, HubSearchPage } from '@/lib/prokom/searchIndex'
import { contactWithPhrase } from '@/lib/shared/search/provider'
import type { SharedLine } from '@/lib/shared/project'
import { toTelHref } from '@/lib/site/link'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { NoResultsEvent } from './NoResultsEvent'

const PATH = '/szukaj'

type Props = {
  result: HubSearchPage | null
  filter: HubSearchFilter
  lines: readonly (SharedLine & { key: HubLine })[]
  popular: readonly string[]
  shortcuts: readonly { label: string; href: string }[]
  phone: string | null
  hours: string | null
  flags: HubPageFlags
}

const href = (query: string, filter: HubSearchFilter) => {
  const params = new URLSearchParams({ q: query })
  if (filter !== 'wszystko') params.set('linia', filter)
  return `${PATH}?${params}`
}

/** „Przejdź na prokominstalacje.pl ↗”; an address that does not parse never breaks the page. */
function goLabel(href: string): string {
  try {
    return `Przejdź na ${new URL(href).hostname} ↗`
  } catch {
    return 'Przejdź ↗'
  }
}

/** An external link (a line's site) opens as such; a hub path stays in the app. */
function ResultLink({
  entry,
  className,
  children,
}: {
  entry: HubSearchEntry
  className: string
  children: ReactNode
}) {
  return entry.href.startsWith('/') ? (
    <Link href={entry.href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={entry.href} className={className}>
      {children}
    </a>
  )
}

function ResultIcon({ entry }: { entry: HubSearchEntry }) {
  const name = entry.icon && isIconName(entry.icon) ? entry.icon : 'doc'
  return (
    <span className="pk-hit__icon" aria-hidden="true">
      <Icon name={name} className="size-5" />
    </span>
  )
}

/**
 * Results page of pro-kom.eu (spec §5.6, board 12 Szukaj): the form, frequent phrases, filters by
 * line with counts, the best hit, groups (services, tools, help, pages, lines), the empty state
 * with the company phone, and the side panel. Rendered on the server — it works without JS. A new
 * phrase from the form searches all lines (the filter is a link per phrase).
 */
export function SearchPage({
  result,
  filter,
  lines,
  popular,
  shortcuts,
  phone,
  hours,
  flags,
}: Props) {
  const query = result?.query ?? ''
  const tel = phone ? toTelHref(phone) : null
  const tabs: { key: HubSearchFilter; label: string; line?: HubLine }[] = [
    { key: 'wszystko', label: 'Wszystko' },
    ...lines.map((line) => ({ key: line.key, label: line.name, line: line.key })),
    { key: 'strony', label: 'Strony' },
  ]
  const nothing = result !== null && result.counts.wszystko === 0

  return (
    <div className={`pk-search py-10 ${HUB_CONTAINER}`}>
      <p className="pk-search__eyebrow">Szukaj we wszystkich liniach</p>
      <h1 className="font-display text-[clamp(32px,4.4vw,56px)] leading-tight font-extrabold">
        {query ? (
          <>
            Szukasz: <span className="text-accent-text">„{query}”</span>
          </>
        ) : (
          'Czego szukasz?'
        )}
      </h1>
      <form role="search" action={PATH} className="pk-search__form">
        <label htmlFor="pk-q" className="sr-only">
          Szukaj w PRO-KOM
        </label>
        <Icon name="search" className="size-5 text-ink-3" />
        <input
          id="pk-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Kasa fiskalna, kamery, pęknięty ekran…"
          className="pk-search__input"
          autoComplete="off"
        />
        <button type="submit" className="pk-search__submit">
          Szukaj
        </button>
      </form>
      {popular.length > 0 && (
        <div className="pk-search__popular">
          <span>Często szukane:</span>
          {popular.map((phrase) => (
            <Link key={phrase} href={href(phrase, 'wszystko')} className="pk-chip">
              {phrase}
            </Link>
          ))}
        </div>
      )}

      <div className="pk-search__layout">
        <div className="min-w-0">
          {result && !nothing && (
            <nav aria-label="Filtruj według linii" className="pk-search__tabs">
              {tabs.map((tab) => {
                const count = result.counts[tab.key] ?? 0
                if (tab.key !== 'wszystko' && count === 0) return null
                const current = tab.key === filter
                return (
                  <Link
                    key={tab.key}
                    href={href(query, tab.key)}
                    aria-current={current ? 'page' : undefined}
                    className="pk-tab"
                    style={tab.line ? lineStyle(tab.line) : lineStyle('prokom')}
                  >
                    {tab.line && <span className="pk-tab__dot" aria-hidden="true" />}
                    {tab.label}
                    <span className="pk-tab__count">{count}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {result?.best && (
            <section
              aria-labelledby="pk-best"
              className="pk-best"
              style={lineStyle(result.best.line)}
            >
              <p id="pk-best" className="pk-search__eyebrow">
                Najlepsze dopasowanie
              </p>
              <ResultLink entry={result.best} className="pk-best__link">
                <ResultIcon entry={result.best} />
                <span>
                  <b className="font-display text-2xl">{result.best.title}</b>
                  {result.best.hint && <span className="pk-hit__hint">{result.best.hint}</span>}
                  <span className="pk-best__go">
                    {result.best.href.startsWith('/') ? 'Przejdź →' : goLabel(result.best.href)}
                  </span>
                </span>
              </ResultLink>
            </section>
          )}

          {result?.groups.map((group) => (
            <section key={group.kind} aria-labelledby={`pk-g-${group.kind}`} className="pk-group">
              <h2 id={`pk-g-${group.kind}`} className="font-display text-xl font-extrabold">
                {group.title}
              </h2>
              <ul>
                {group.results.map((entry) => (
                  <li key={entry.id}>
                    <ResultLink entry={entry} className="pk-hit">
                      <ResultIcon entry={entry} />
                      <span className="min-w-0">
                        <b>{entry.title}</b>
                        {entry.hint && <span className="pk-hit__hint">{entry.hint}</span>}
                      </span>
                    </ResultLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {result && result.counts.wszystko > 0 && result.total === 0 && (
            <p className="mt-6 text-ink-2">
              W tej linii nic nie znaleźliśmy — zobacz wszystkie wyniki.
            </p>
          )}

          {nothing && (
            <section aria-labelledby="pk-none" className="pk-none">
              <NoResultsEvent key={query} />
              <h2
                id="pk-none"
                className="font-display text-[clamp(24px,2.4vw,32px)] font-extrabold"
              >
                Nie mamy „{query}” na liście.
              </h2>
              <p>
                To nie znaczy, że tego nie robimy. Zadzwoń albo napisz — pokierujemy do właściwej
                linii. Możesz też spróbować innego słowa.
              </p>
              <div className="pk-none__actions">
                {phone && tel && (
                  <a href={tel} className="pk-btn pk-btn--primary">
                    <Icon name="phone" className="size-5" />
                    {phone}
                  </a>
                )}
                <Link href={contactWithPhrase('/kontakt', query)} className="pk-btn">
                  Napisz, o co chodzi →
                </Link>
              </div>
            </section>
          )}
        </div>

        <aside aria-label="Pomoc w wyborze linii" className="pk-side">
          <p className="pk-search__eyebrow">Nie wiesz, która linia?</p>
          <p className="font-display text-xl font-extrabold">Zadzwoń raz — pokierujemy.</p>
          {phone && tel && (
            <a href={tel} className="pk-side__phone">
              {phone}
            </a>
          )}
          {hours && <p className="text-sm text-ink-2">{hours}</p>}
          <p className="pk-search__eyebrow mt-6">Linie PRO-KOM</p>
          <ul className="pk-side__lines">
            {lines.map((line) => (
              <li key={line.key}>
                <a
                  href={line.url ?? undefined}
                  style={lineStyle(line.key)}
                  className="pk-side__line"
                >
                  <span className="pk-tab__dot" aria-hidden="true" />
                  <span>
                    <b>{line.name}</b>
                    {line.domain && <span>{line.domain}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {shortcuts.some((link) => isHubLinkLive(link.href, flags)) && (
            <>
              <p className="pk-search__eyebrow mt-6">Na skróty</p>
              <div className="flex flex-wrap gap-2">
                {shortcuts
                  .filter((link) => isHubLinkLive(link.href, flags))
                  .map((link) => (
                    <Link key={link.href} href={link.href} className="pk-chip">
                      {link.label}
                    </Link>
                  ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
