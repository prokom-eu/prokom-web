'use client'

import { type KeyboardEvent, useEffect, useId, useState } from 'react'

import type { HubDeliveries } from '@/lib/prokom/deliveries'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { plural } from '../home/model'
import { useChoice } from './ChoiceState'
import { useDeliveries } from './DeliveriesState'
import { listText, listTotals } from './list'

type Page = HubDeliveries['page']

const positions = (count: number) => plural(count, ['pozycja', 'pozycje', 'pozycji'])

/** What the picker needs of a segment (`/inwestycje-i-dostawy`) or a role (`/wspolpraca`). */
type Choice = Pick<
  HubDeliveries['segments'][number],
  'key' | 'name' | 'sub' | 'line' | 'eyebrow' | 'heading' | 'start' | 'points'
> & { cta?: { label: string; href: string } }

/** „Dla kogo zamawiasz?” (spec §6.5 pkt 1) / „Kim jesteś?” (§6.6): the choice changes the panel and the form. */
export function SegmentPicker({
  texts,
  segments,
}: {
  texts: { segmentsLabel: string; segmentsHint: string; start: string }
  segments: Choice[]
}) {
  const { segment, setSegment } = useChoice()
  const panelId = useId()
  const current = segments.find((entry) => entry.key === segment) ?? segments[0]
  if (!current) return null
  return (
    <div className="pk-dseg">
      <div className="pk-dseg__label">
        <span className="pk-eb" id={`${panelId}-label`}>
          {texts.segmentsLabel}
        </span>
        <span className="pk-plan__note">{texts.segmentsHint}</span>
      </div>
      <div role="group" aria-labelledby={`${panelId}-label`} className="pk-dseg__list">
        {segments.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className="pk-ind__item"
            aria-pressed={entry.key === current.key}
            aria-controls={panelId}
            onClick={() => setSegment(entry.key)}
          >
            <span className="pk-pt__body">
              <span className="pk-ind__name">{entry.name}</span>
              <span className="pk-pt__sub">{entry.sub}</span>
            </span>
          </button>
        ))}
      </div>
      <div id={panelId} className="pk-area" style={lineStyle(current.line)}>
        <span className="pk-eb pk-eb--line">{current.eyebrow}</span>
        <h2 className="pk-h3" aria-live="polite">
          {current.heading}
        </h2>
        <ul className="pk-area__list" role="list">
          {current.points.map((point) => (
            <li key={point.title}>
              <span className="pk-osv__text">
                <span className="pk-osv__title">{point.title}</span>
                <span className="pk-area__text">{point.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="pk-area__cta">
          <span className="pk-area__lead">
            {texts.start} {current.start}
          </span>
          {current.cta && (
            <a href={current.cta.href} className="pk-hbtn pk-hbtn--line">
              {current.cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * „Lista zapytania” (spec §6.5 pkt 3): three groups of items with − / + / +10 (max 999), the
 * summary beside (sticky from 1240 px), optional services, term, the RTV/AGD note, copy and
 * „Dołącz listę do zapytania”. No prices. The list lives in the page and in `sessionStorage`.
 */
export function RequestListSection({
  texts,
  groups,
  services,
  terms,
  details,
}: {
  texts: Page['list']
  groups: HubDeliveries['listGroups']
  services: HubDeliveries['services']
  terms: string[]
  /** „Szczegóły na prokombiznes.pl” by group line (spec §6.5 „Związek z Biznesem”). */
  details: { line: string; href: string; label: string }[]
}) {
  const state = useDeliveries()
  const [copy, setCopy] = useState<'idle' | 'ok' | 'fail'>('idle')
  const totals = listTotals(state.list, groups)
  const hasTv = totals.groups.some((group) => group.key === 'agd')
  const termName = useId()
  // A changed list makes an old „copied” message wrong.
  useEffect(() => {
    const timer = window.setTimeout(() => setCopy('idle'), 0)
    return () => window.clearTimeout(timer)
  }, [state.list, state.services, state.term])

  const copyList = async () => {
    const text = listText(state.list, groups, {
      services: services.filter((s) => state.services.includes(s.key)).map((s) => s.title),
      term: state.term,
      pcs: texts.pcs,
    })
    try {
      await navigator.clipboard.writeText(text)
      setCopy('ok')
    } catch {
      setCopy('fail')
    }
  }

  return (
    <section id="lista" aria-labelledby="lista-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="lista-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <div className="pk-dlist">
        <div className="pk-dlist__groups">
          {groups.map((group) => (
            <div key={group.key} className="pk-ogr" style={lineStyle(group.line)}>
              <div className="pk-ogr__head">
                <span className="pk-ogr__who">
                  <span className="pk-osv__title">{group.title}</span>
                  <span className="pk-ogr__short">{group.lines}</span>
                </span>
                {details
                  .filter((entry) => entry.line === group.line)
                  .map((entry) => (
                    <a key={entry.href} href={entry.href} className="pk-chip-out">
                      {entry.label} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
              </div>
              <ul className="pk-dlist__items" role="list">
                {group.items.map((item) => {
                  const qty = state.list[item.key] ?? 0
                  return (
                    <li key={item.key} className="pk-qty" data-on={qty > 0 ? '' : undefined}>
                      <span className="pk-osv__text">
                        <span className="pk-osv__title" id={`q-${item.key}`}>
                          {item.title}
                        </span>
                        <span className="pk-osv__short">{item.hint}</span>
                      </span>
                      <span className="pk-qty__ctl" role="group" aria-labelledby={`q-${item.key}`}>
                        <button
                          type="button"
                          aria-label={`Odejmij 1 — ${item.title}`}
                          disabled={qty === 0}
                          onClick={() => state.change(item.key, -1)}
                        >
                          −
                        </button>
                        <span className="pk-qty__n" aria-label={`${item.title}: ${qty}`}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Dodaj 1 — ${item.title}`}
                          onClick={() => state.change(item.key, 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          aria-label={`Dodaj 10 — ${item.title}`}
                          onClick={() => state.change(item.key, 10)}
                        >
                          +10
                        </button>
                      </span>
                    </li>
                  )
                })}
              </ul>
              <p className="pk-note pk-dlist__note">{group.note}</p>
            </div>
          ))}
        </div>
        <aside className="pk-dsum" aria-labelledby="lista-sum">
          <div className="pk-dsum__head">
            <h3 id="lista-sum" className="pk-h3">
              {texts.yours}
            </h3>
            {totals.positions > 0 && (
              <button type="button" className="pk-ochip" onClick={state.clear}>
                {texts.clear}
              </button>
            )}
          </div>
          <p className="pk-dsum__totals" aria-live="polite">
            {totals.pieces} {texts.pcs} · {positions(totals.positions)}
            {totals.groups.length > 0 && (
              <span className="pk-dsum__lines">
                {totals.groups.map((group) => group.title).join(' · ')}
              </span>
            )}
          </p>
          {totals.positions === 0 ? (
            <p className="pk-plan__note">{texts.empty}</p>
          ) : (
            <ul className="pk-dsum__rows" role="list">
              {totals.rows.map((row) => (
                <li key={row.key}>
                  <span>{row.title}</span>
                  <b>
                    {row.qty} {texts.pcs}
                  </b>
                </li>
              ))}
            </ul>
          )}
          <fieldset className="pk-dsum__set">
            <legend className="pk-eb">{texts.services}</legend>
            {services.map((service) => (
              <label key={service.key} className="pk-check">
                <input
                  type="checkbox"
                  checked={state.services.includes(service.key)}
                  onChange={() => state.toggleService(service.key)}
                />
                <span>
                  <b>{service.title}</b> {service.hint}
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset className="pk-dsum__set">
            <legend className="pk-eb">{texts.term}</legend>
            {terms.map((term) => (
              <label key={term} className="pk-check">
                <input
                  type="radio"
                  name={termName}
                  checked={state.term === term}
                  onChange={() => state.setTerm(term)}
                />
                <span>{term}</span>
              </label>
            ))}
          </fieldset>
          {hasTv && <p className="pk-note">{texts.tvNote}</p>}
          <div className="pk-dsum__cta">
            <a href="#formularz" className="pk-hbtn pk-hbtn--accent">
              {texts.attach} <span aria-hidden="true">↓</span>
            </a>
            {totals.positions > 0 && (
              <button type="button" className="pk-hbtn" onClick={copyList}>
                {texts.copy}
              </button>
            )}
            <span role="status" className="pk-plan__note">
              {copy === 'ok' ? texts.copied : copy === 'fail' ? texts.copyFailed : ''}
            </span>
          </div>
        </aside>
      </div>
    </section>
  )
}

/** „Wyposażenie obiektu” (spec §6.5 pkt 4): nine objects; „Wczytaj przykład” replaces the list. */
export function ObjectsSection({
  texts,
  objects,
  groups,
}: {
  texts: Page['objects']
  objects: HubDeliveries['objects']
  groups: HubDeliveries['listGroups']
}) {
  const { loadPreset } = useDeliveries()
  const panelId = useId()
  const [picked, setPicked] = useState(objects[0]?.key ?? '')
  const current = objects.find((entry) => entry.key === picked) ?? objects[0]
  if (!current) return null
  const titleOf = (key: string) =>
    groups.flatMap((group) => group.items).find((item) => item.key === key)?.title ?? key
  const qtyOf = (key: string) => current.preset.find((row) => row.item === key)?.qty ?? null
  const load = () => {
    loadPreset(current.preset)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('lista')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }
  return (
    <section id="obiekty" aria-labelledby="obiekty-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="obiekty-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <div role="group" aria-labelledby="obiekty-h" className="pk-dobj">
        {objects.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className="pk-ind__item"
            aria-pressed={entry.key === current.key}
            aria-controls={panelId}
            onClick={() => setPicked(entry.key)}
          >
            <span className="pk-pt__body">
              <span className="pk-ind__name">{entry.title}</span>
              <span className="pk-pt__sub">{entry.example}</span>
            </span>
          </button>
        ))}
      </div>
      <div id={panelId} className="pk-situation">
        <span className="pk-eb">{current.example}</span>
        <h3 className="pk-h3" aria-live="polite">
          {current.heading}
        </h3>
        <div className="pk-dobj__cols">
          {current.columns.map((column) => (
            <div key={column.title} className="pk-lcard" style={lineStyle(column.line)}>
              <span className="pk-osv__title">{column.title}</span>
              <span className="pk-mark__label">{column.lines}</span>
              <ul className="pk-dsum__rows" role="list">
                {column.items.map((item) => (
                  <li key={item.title}>
                    <span>{item.item ? titleOf(item.item) : item.title}</span>
                    <b>{item.item ? qtyOf(item.item) : '✓'}</b>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pk-area__cta">
          <button type="button" className="pk-hbtn pk-hbtn--accent" onClick={load}>
            {texts.load} <span aria-hidden="true">↑</span>
          </button>
          <span className="pk-plan__note">{texts.note}</span>
        </div>
      </div>
    </section>
  )
}

/** „Zakres do wyboru” (spec §6.5 pkt 5): three levels and the „Co możemy dodać” tabs. */
export function ScopeSection({
  texts,
  levels,
  tabs,
}: {
  texts: Page['scope']
  levels: HubDeliveries['levels']
  tabs: HubDeliveries['prepTabs']
}) {
  const baseId = useId()
  const [index, setIndex] = useState(0)
  const tab = tabs[index] ?? tabs[0]
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1
    const to = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (to === undefined) return
    event.preventDefault()
    setIndex(to)
    document.getElementById(`${baseId}-${to}`)?.focus()
  }
  return (
    <section id="zakres" aria-labelledby="zakres-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__intro">
        <span className="pk-eb">{texts.eyebrow}</span>
        <h2 id="zakres-h" className="pk-h2 pk-h2--big">
          {texts.title}
        </h2>
      </div>
      <ol className="pk-roll">
        {levels.map((level, at) => (
          <li key={level.title} className="pk-roll__step">
            <span className="pk-roll__n">{String(at + 1).padStart(2, '0')}</span>
            <h3 className="pk-roll__title">{level.title}</h3>
            <p className="pk-roll__text">{level.text}</p>
          </li>
        ))}
      </ol>
      {tab && (
        <>
          <span className="pk-eb" id={`${baseId}-label`}>
            {texts.tabsLabel}
          </span>
          <div
            role="tablist"
            aria-labelledby={`${baseId}-label`}
            className="pk-ltabs pk-ltabs--topics"
            onKeyDown={onKey}
          >
            {tabs.map((entry, at) => (
              <button
                key={entry.title}
                id={`${baseId}-${at}`}
                type="button"
                role="tab"
                aria-selected={at === index}
                aria-controls={`${baseId}-panel`}
                tabIndex={at === index ? 0 : -1}
                className="pk-ltab"
                style={lineStyle(entry.line)}
                onClick={() => setIndex(at)}
              >
                <span className="pk-ltab__name">{entry.title}</span>
                <span className="pk-ltab__short">{entry.lines}</span>
              </button>
            ))}
          </div>
          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`${baseId}-${index}`}
            className="pk-area"
            style={lineStyle(tab.line)}
          >
            <h3 className="pk-h3">{tab.heading}</h3>
            <p className="pk-area__lead">{tab.lead}</p>
            <ul className="pk-area__list" role="list">
              {tab.items.map((item) => (
                <li key={item.title}>
                  <span aria-hidden="true">✓</span>
                  <span className="pk-osv__text">
                    <span className="pk-osv__title">{item.title}</span>
                    <span className="pk-area__text">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="pk-area__lead">{texts.optional}</p>
          </div>
        </>
      )}
    </section>
  )
}

/**
 * The floating bar of the list (spec §6.5 pkt 11): while the list is not empty; above the bottom
 * bar below 760 px; hidden while the form is on screen.
 */
export function ListBar({
  texts,
  groups,
}: {
  texts: Page['list']
  groups: HubDeliveries['listGroups']
}) {
  const { list } = useDeliveries()
  const [formVisible, setFormVisible] = useState(false)
  const totals = listTotals(list, groups)
  useEffect(() => {
    const form = document.getElementById('formularz')
    if (!form || !('IntersectionObserver' in window)) return
    // Hidden while the form is on screen and after it (the bar would cover the page's end).
    const observer = new IntersectionObserver(([entry]) =>
      setFormVisible(Boolean(entry && (entry.isIntersecting || entry.boundingClientRect.top < 0))),
    )
    observer.observe(form)
    return () => observer.disconnect()
  }, [])
  if (totals.positions === 0 || formVisible) return null
  return (
    <div className="pk-dbar" role="region" aria-label={texts.yours}>
      <span className="pk-dbar__text">
        {texts.bar} {totals.pieces} {texts.pcs} · {positions(totals.positions)} ·{' '}
        {totals.groups.map((group) => group.title).join(', ')}
      </span>
      <a href="#formularz" className="pk-hbtn pk-hbtn--accent">
        {texts.send} <span aria-hidden="true">→</span>
      </a>
    </div>
  )
}

/** The list summary inside the form section (the form fields come with H4-2). */
export function FormListSummary({
  texts,
  groups,
  segments,
}: {
  texts: Page
  groups: HubDeliveries['listGroups']
  segments: HubDeliveries['segments']
}) {
  const { list } = useDeliveries()
  const { segment } = useChoice()
  const current = segments.find((entry) => entry.key === segment) ?? segments[0]
  const totals = listTotals(list, groups)
  return (
    <div className="pk-contact__main">
      <span className="pk-eb">{texts.form.eyebrow}</span>
      <h2 id="formularz-h" className="pk-h2">
        {current?.form.heading}
      </h2>
      {current && (
        <p className="pk-plan__note">
          {texts.form.to} {current.lines}
        </p>
      )}
      <p className="pk-dsum__totals">
        {texts.list.yours}: {totals.pieces} {texts.list.pcs} · {positions(totals.positions)}
      </p>
      <a href="#lista" className="pk-hbtn">
        {texts.list.eyebrow} <span aria-hidden="true">↑</span>
      </a>
    </div>
  )
}
