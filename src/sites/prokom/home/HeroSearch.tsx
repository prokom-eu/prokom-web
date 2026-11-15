'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { Icon } from '@/components/ui/Icon'
import type { HubLine } from '@/lib/prokom/lines'
import { HUB_GROUPS, suggestHub, type HubSearchEntry } from '@/lib/prokom/searchIndex'

import { lineStyle } from '../lineColors'
import { loadHubIndex } from '../powloka/hubIndex'

type Props = {
  /** Sample phrases of the board (`hero.hints`), typed in turn while the field is empty. */
  hints: { text: string; line: HubLine | 'prokom' }[]
  /** Groups of words from the panel (`shared.rail.synonyms`) — the same as `/szukaj`. */
  synonyms: readonly string[]
  /** „Szukaj” on the button. */
  submitLabel?: string
}

const SEARCH_PATH = '/szukaj'
const MIN_CHARS = 2
/** One letter of the sample phrase every 55 ms, a pause of 1.8 s on the whole phrase. */
const TYPE_MS = 55
const HOLD_MS = 1800

/**
 * The hero's search (Krystian 15.11): live suggestions from the hub's index as you type — the hits
 * of `/szukaj`, by line colour and kind, with arrows, Enter and Esc (ARIA combobox) — and a sample
 * phrase typed into the empty field. A plain GET form under it: without JavaScript, or with Enter
 * and nothing chosen, it opens `/szukaj?q=`. Reduced motion shows the first phrase still.
 */
export function HeroSearch({ hints, synonyms, submitLabel = 'Szukaj' }: Props) {
  const id = useId()
  const listId = `${id}-list`
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<HubSearchEntry[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const sample = useTypedSample(hints, query === '')

  const load = () => void loadHubIndex().then((index) => setEntries(index.entries))
  const ready = query.trim().length >= MIN_CHARS
  const { results, loose } = useMemo(
    () => (ready ? suggestHub(entries, query, synonyms) : { results: [], loose: false }),
    [entries, query, ready, synonyms],
  )
  const expanded = open && ready
  const allHref = `${SEARCH_PATH}?q=${encodeURIComponent(query.trim())}`

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      setActive(-1)
      return
    }
    if (!expanded || !results.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      // -1 = back in the field; the list wraps round.
      setActive((value) => {
        const next = value + step
        return next < -1 ? results.length - 1 : next >= results.length ? -1 : next
      })
    }
    if (event.key === 'Enter' && active >= 0 && active < results.length) {
      event.preventDefault()
      window.location.assign(results[active]!.href)
    }
  }

  return (
    <form
      action={SEARCH_PATH}
      method="get"
      role="search"
      className="pk-hq"
      data-open={expanded ? '' : undefined}
      data-sample={sample ? '' : undefined}
      onSubmit={() => setOpen(false)}
    >
      <Icon name="search" className="pk-hq__icon" />
      <label htmlFor={`${id}-q`} className="sr-only">
        Czego potrzebujesz?
      </label>
      <span className="pk-hq__field">
        <input
          ref={input}
          id={`${id}-q`}
          name="q"
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            expanded && active >= 0 && active < results.length ? `${id}-r${active}` : undefined
          }
          placeholder={hints[0] ? `np. ${hints[0].text}` : undefined}
          className="pk-hq__input"
          value={query}
          maxLength={120}
          onFocus={() => {
            load()
            setOpen(true)
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(-1)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
        {/* The sample phrase typed over the empty field (decoration; the placeholder says it). */}
        {sample && (
          <span aria-hidden="true" className="pk-hq__sample" style={lineStyle(sample.line)}>
            np. <b>{sample.text}</b>
            <i className="pk-hq__caret" />
          </span>
        )}
      </span>
      <kbd className="pk-hq__kbd" aria-hidden="true">
        Ctrl K
      </kbd>
      <button type="submit" className="pk-hq__go">
        {submitLabel}
      </button>

      {expanded && (
        <div className="pk-hq__pop">
          {results.length > 0 ? (
            <>
              {loose && <p className="pk-hq__note">Pasuje część słów — najbliższe wyniki:</p>}
              <ul id={listId} role="listbox" aria-label="Podpowiedzi" className="pk-hq__list">
                {results.map((hit, i) => (
                  <li
                    key={hit.id}
                    id={`${id}-r${i}`}
                    role="option"
                    aria-selected={i === active}
                    style={lineStyle(hit.line)}
                  >
                    <a
                      href={hit.href}
                      className="pk-hq__hit"
                      tabIndex={-1}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      <i className="pk-hq__dot" aria-hidden="true" />
                      <span className="pk-hq__hit-text">
                        <span className="pk-hq__hit-title">{hit.title}</span>
                        {hit.hint && <span className="pk-hq__hit-hint">{hit.hint}</span>}
                      </span>
                      <span className="pk-hq__kind">{HUB_GROUPS[hit.kind]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p id={listId} className="pk-hq__note" role="status">
              {entries.length
                ? 'Nic nie pasuje — zobacz wszystkie wyniki albo napisz do nas.'
                : 'Szukam…'}
            </p>
          )}
          <a
            href={allHref}
            className="pk-hq__all"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
          >
            Wszystkie wyniki dla „{query.trim()}” <span aria-hidden="true">→</span>
          </a>
        </div>
      )}
    </form>
  )
}

/**
 * The sample phrase typed letter by letter into the empty field, then the next one. Off while the
 * field has text or focus would make it noise; with reduced motion the first phrase stays still.
 */
function useTypedSample(hints: Props['hints'], empty: boolean) {
  const [state, setState] = useState({ hint: 0, length: 0 })
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Read once after mount (the server cannot know it); a still phrase for reduced motion.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time read of a media query
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!empty || hints.length === 0 || reduced) return
    const full = hints[state.hint]?.text.length ?? 0
    const done = state.length >= full
    const timer = window.setTimeout(
      () =>
        setState((value) =>
          done
            ? { hint: (value.hint + 1) % hints.length, length: 0 }
            : { ...value, length: value.length + 1 },
        ),
      done ? HOLD_MS : TYPE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [empty, hints, reduced, state])

  if (!empty || hints.length === 0) return null
  const hint = hints[state.hint] ?? hints[0]!
  return reduced
    ? { text: hint.text, line: hint.line }
    : { text: hint.text.slice(0, state.length), line: hint.line }
}
