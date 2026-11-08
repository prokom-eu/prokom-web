'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { Icon } from '@/components/ui/Icon'
import { useTheme } from '@/components/useTheme'
import { clearRecent, readRecent, type RecentItem } from '@/lib/shared/recent'
import { railIcon } from '@/lib/shared/rail'
import { matchActions, type PaletteAction } from '@/lib/shared/search/palette'
import {
  contactWithPhrase,
  type SearchGroup,
  type SearchProvider,
  type SearchResult,
} from '@/lib/shared/search/provider'
import { plural } from '@/lib/plural'
import { toTelHref } from '@/lib/site/link'
import { onSearchRequest } from '@/lib/site/searchOpen'
import { isSearchShortcut } from '@/lib/site/searchShortcut'

export type SearchDialogProps = {
  provider: SearchProvider
  /** Command palette of the line (`paletteActions`), built from the panel data. */
  actions: readonly PaletteAction[]
  /** Key of the line for recently viewed (`pk-recent-<line>`). */
  line: string
  /** `CompanyData.recentlyViewed` — off until the lawyer says yes. */
  recentlyViewed: boolean
  /** „Zapytaj o …” leads here with the phrase (`?fraza=`, `contactWithPhrase`), next to the phone. */
  contactHref?: string
  phone: string | null
  /** Accessible name and the field's label, e.g. „Szukaj na stronie”. */
  label?: string
  placeholder?: string
  /**
   * The line's preview of a result (Biznes: photo, brand, status, „Do zapytania”). With it the
   * window is wider and, from 900 px, shows the preview of the hovered or focused result — the
   * first one by default — next to the list.
   */
  renderPreview?: (result: SearchResult) => ReactNode
}

/** The focus is in a field: „/” is typed there, not a shortcut. */
function inField(event: globalThis.KeyboardEvent) {
  const target = event.target as HTMLElement | null
  return Boolean(
    target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]'),
  )
}

/** Up/Down moves between results; above the first result focus goes back to the field. */
function moveFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-result]')]
  const current = items.indexOf(document.activeElement as HTMLElement)
  const next = current + (event.key === 'ArrowDown' ? 1 : -1)
  if (next < 0) event.currentTarget.querySelector<HTMLElement>('input')?.focus()
  else items[Math.min(next, items.length - 1)]?.focus()
  event.preventDefault()
}

/** „dziś 14:05”-like time of a recently viewed page, in Polish. */
const viewedAt = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' })

/** Same-site paths go through the router (no full reload); `tel:`, `mailto:`, maps stay plain. */
const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')

const resultsLabel = (count: number) => `${count} ${plural(count, ['wynik', 'wyniki', 'wyników'])}`

/**
 * The search window of Instalacje and Software (spec §5.1 „Wyszukiwarka”, board 07): Ctrl/⌘ K, „/”
 * or the rail's „Szukaj” (`requestSearch`) open a modal `<dialog>` — the browser keeps focus
 * inside and gives it back on close. Empty: the line's actions as buttons, popular phrases, the
 * provider's shortcuts and (behind the flag) recently viewed. Typing: matching actions on top, then
 * the provider's groups; nothing found → „Zapytaj o …” and the phone. Up/Down, Enter, Esc.
 */
export function SearchDialog({
  provider,
  actions,
  line,
  recentlyViewed,
  contactHref = '/kontakt',
  phone,
  label = 'Szukaj na stronie',
  placeholder = 'Czego szukasz?',
  renderPreview,
}: SearchDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [status, setStatus] = useState('')
  const [theme, setTheme] = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const headingId = useId()
  const [activeId, setActiveId] = useState<string | null>(null)

  const show = useCallback(() => {
    // Another modal (menu sheet, preview) owns the screen.
    if (!dialog.current || document.querySelector('dialog[open]')) return
    setRecent(recentlyViewed ? readRecent(line) : [])
    setStatus('')
    dialog.current.showModal()
    input.current?.focus()
  }, [line, recentlyViewed])

  const close = () => dialog.current?.close()

  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey } = event
      if (!isSearchShortcut({ key, ctrlKey, metaKey, altKey, typing: inField(event) })) return
      event.preventDefault()
      show()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [show])

  useEffect(
    () =>
      onSearchRequest((phrase) => {
        if (phrase) setQuery(phrase)
        show()
      }),
    [show],
  )

  const deferred = useDeferredValue(query)
  const trimmed = deferred.trim()
  const groups: SearchGroup[] = useMemo(
    () => (trimmed ? provider.query(trimmed) : []),
    [provider, trimmed],
  )
  const matched = useMemo(() => matchActions(actions, trimmed), [actions, trimmed])
  const count = groups.reduce((sum, group) => sum + group.results.length, 0)
  const results = useMemo(() => groups.flatMap((group) => group.results), [groups])
  const active = results.find((result) => result.id === activeId) ?? results[0] ?? null

  /** Enter in the field opens the first result, as the hint under the list says. */
  const openFirst = () => {
    const first = results[0]
    if (!first) return
    close()
    if (isInternal(first.href)) router.push(first.href)
    else window.location.assign(first.href)
  }

  const run = (action: PaletteAction) => {
    if (action.kind === 'copy' && action.value) {
      if (!navigator.clipboard) {
        setStatus('Nie udało się skopiować — zaznacz numer ręcznie.')
        return
      }
      void navigator.clipboard
        .writeText(action.value)
        .then(() => setStatus(`Skopiowano numer ${action.value}`))
        .catch(() => setStatus('Nie udało się skopiować — zaznacz numer ręcznie.'))
      return
    }
    if (action.kind === 'theme') {
      setTheme(theme === 'dark' ? 'light' : 'dark')
      setStatus(theme === 'dark' ? 'Motyw jasny' : 'Motyw ciemny')
    }
  }

  const actionItem = (action: PaletteAction, compact: boolean) => {
    const content = (
      <>
        <span className="sdlg__icon">
          <Icon name={railIcon(action.icon)} strokeWidth={2} className="size-4" />
        </span>
        <span>{compact ? action.short : action.label}</span>
        {/* The chip shows the short word; its name starts with it, so voice control finds it. */}
        {compact && <span className="sr-only"> — {action.label}</span>}
      </>
    )
    const className = compact ? 'sdlg__chip' : 'sdlg__result'
    if (action.href && isInternal(action.href)) {
      return (
        <Link key={action.kind} href={action.href} className={className} data-result>
          {content}
        </Link>
      )
    }
    return action.href ? (
      <a
        key={action.kind}
        href={action.href}
        className={className}
        data-result
        {...(action.kind === 'route' ? { target: '_blank', rel: 'noopener' } : {})}
      >
        {content}
      </a>
    ) : (
      <button
        key={action.kind}
        type="button"
        className={className}
        data-result
        onClick={() => run(action)}
      >
        {content}
      </button>
    )
  }

  const groupBlock = (group: SearchGroup) => (
    <section key={group.key} className="sdlg__group" aria-labelledby={`${headingId}-${group.key}`}>
      <h3 id={`${headingId}-${group.key}`} className="sdlg__title">
        {group.title}
      </h3>
      <ul>
        {group.results.map((result) => (
          <li key={result.id}>
            <Link
              href={result.href}
              className="sdlg__result"
              data-result
              data-active={renderPreview && active?.id === result.id ? '' : undefined}
              onFocus={() => setActiveId(result.id)}
              onMouseEnter={() => setActiveId(result.id)}
            >
              <span className="sdlg__icon">
                <Icon name={railIcon(result.icon)} strokeWidth={2} className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-bold">{result.title}</span>
                {result.hint && (
                  <span className="truncate text-[13px] text-ink-2">{result.hint}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )

  const tel = phone ? toTelHref(phone) : null
  const ask = contactWithPhrase(contactHref, trimmed)

  return (
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      className={renderPreview ? 'sdlg sdlg--preview' : 'sdlg'}
      data-search-dialog
      onClose={() => setStatus('')}
      onClick={(event) => {
        const box = dialog.current?.getBoundingClientRect()
        const outside =
          event.target === dialog.current &&
          box &&
          (event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom)
        const newTab = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0
        const link = !newTab && (event.target as Element).closest('a')
        if (outside || link) close()
      }}
    >
      <div className="flex max-h-[inherit] flex-col" onKeyDown={moveFocus}>
        <h2 id={headingId} className="sr-only">
          {label}
        </h2>
        <div className="sdlg__field">
          <Icon name="search" strokeWidth={2.2} className="size-[22px] text-accent-text" />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // In a search field Chrome's first Esc only clears the text: close at once.
              if (event.key === 'Escape') {
                event.preventDefault()
                close()
              }
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault()
                openFirst()
              }
            }}
            placeholder={placeholder}
            aria-label={label}
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="button" className="sdlg__close" onClick={close}>
            Esc<span className="sr-only"> — zamknij wyszukiwarkę</span>
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {trimmed ? resultsLabel(count) : ''}
        </p>
        <p className="sr-only" role="status">
          {status}
        </p>

        <div className="sdlg__split">
          <div className="sdlg__body" data-scroll-thin>
            {!trimmed && (
              <>
                {actions.length > 0 && (
                  <div className="sdlg__chips" role="group" aria-label="Akcje">
                    {actions.map((action) => actionItem(action, true))}
                  </div>
                )}
                {provider.popular && provider.popular.length > 0 && (
                  <section className="sdlg__group" aria-labelledby={`${headingId}-popular`}>
                    <h3 id={`${headingId}-popular`} className="sdlg__title">
                      Najczęściej szukane
                    </h3>
                    <div className="sdlg__chips">
                      {provider.popular.map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          className="sdlg__chip"
                          data-result
                          onClick={() => {
                            setQuery(phrase)
                            input.current?.focus()
                          }}
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {recent.length > 0 && (
                  <section className="sdlg__group" aria-labelledby={`${headingId}-recent`}>
                    <div className="flex items-center justify-between">
                      <h3 id={`${headingId}-recent`} className="sdlg__title">
                        Ostatnio oglądane
                      </h3>
                      <button
                        type="button"
                        className="sdlg__link"
                        onClick={() => {
                          clearRecent(line)
                          setRecent([])
                          input.current?.focus()
                        }}
                      >
                        Wyczyść
                      </button>
                    </div>
                    <ul>
                      {recent.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="sdlg__result" data-result>
                            <span className="sdlg__icon">
                              <Icon name="clock" strokeWidth={2} className="size-4" />
                            </span>
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate font-bold">{item.title}</span>
                              <span className="text-[13px] text-ink-2">
                                {item.kind} · {viewedAt.format(item.at)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {provider.empty().map(groupBlock)}
              </>
            )}

            {trimmed && matched.length > 0 && (
              <section className="sdlg__group" aria-labelledby={`${headingId}-actions`}>
                <h3 id={`${headingId}-actions`} className="sdlg__title">
                  Akcje
                </h3>
                <ul>
                  {matched.map((action) => (
                    <li key={action.kind}>{actionItem(action, false)}</li>
                  ))}
                </ul>
              </section>
            )}
            {trimmed && groups.map(groupBlock)}
            {trimmed && count === 0 && matched.length === 0 && (
              <div className="sdlg__none">
                <p className="font-display text-lg font-extrabold">Nie znaleźliśmy „{trimmed}”</p>
                <p className="text-ink-2">Napisz, czego szukasz — odpowiemy, czy to zrobimy.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={ask} className="sdlg__cta" data-result>
                    Zapytaj o „{trimmed}”
                  </Link>
                  {phone && tel && (
                    <a href={tel} className="sdlg__chip" data-result>
                      <Icon name="phone" strokeWidth={2} className="size-4" />
                      {phone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          {renderPreview && trimmed && active && (
            <aside className="sdlg__preview" aria-label={`Podgląd: ${active.title}`}>
              {renderPreview(active)}
            </aside>
          )}
        </div>
        {/* Enter opens the first result, or the focused one (Up/Down from the field). */}
        <p className="sdlg__keys" aria-hidden="true">
          <span>↑↓ wybór</span>
          <span>Enter otwórz</span>
          <span>Esc zamknij</span>
        </p>
      </div>
    </dialog>
  )
}
