'use client'

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { HeadingText } from '@/components/shared/HeadingText'
import { Icon } from '@/components/ui/Icon'
import type { HubHome } from '@/lib/prokom/home'
import { iconForService } from '@/lib/prokom/icons'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { stepIndex } from './autoplay'
import { CamScene, Tick, WifiArcs } from './art'
import { FpsGraph, ProgressRing } from './LineMocks'
import { PhoneMock, WebMock } from './WebMock'
import { Mark } from './Mark'
import type { HomeLine, TeamExample } from './model'
import { useAutoplay } from './useAutoplay'

/** The scene moves to the next line every 9 s until the visitor picks one (spec §6.1 pkt 2). */
const SCENE_MS = 9000
const TEAM = 'razem'

type Props = {
  head: Pick<HubHome['lines'], 'eyebrow' | 'title' | 'lead' | 'allLink'>
  /** `/linie`, or `null` while that page is not built. */
  allHref: string | null
  lines: HomeLine[]
  team: Omit<HubHome['team'], 'examples'> & { examples: TeamExample[] }
  techStages: HubHome['lines']['techStages']
  cameras: HubHome['lines']['cameras']
  cameraNotes: HubHome['lines']['cameraNotes']
  /** The company phone for the „Razem” tab. */
  phone: string | null
  tel: string | null
}

/**
 * „Wszystkie linie” (spec §6.1 pkt 2, board 01 `#linie`): six tabs — the five lines and „Razem” —
 * with one panel. The tabs move by themselves every 9 s (paused on hover, focus, hidden tab, off
 * screen; off with reduced motion) and stop for good after a manual choice. Arrow keys move
 * between tabs (WAI-ARIA tabs pattern).
 */
export function LineScene({
  head,
  allHref,
  lines,
  team,
  techStages,
  cameras,
  cameraNotes,
  phone,
  tel,
}: Props) {
  const keys = [...lines.map((line) => line.key), TEAM] as const
  const section = useRef<HTMLElement>(null)
  const tablist = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [round, setRound] = useState(0)
  const current = keys[index] ?? TEAM
  const next = useCallback(() => {
    setRound((value) => value + 1)
    // The scene runs through the lines only; „Razem” is picked by hand.
    setIndex((value) => stepIndex(value, lines.length))
  }, [lines.length])
  const { handlers, running, stop } = useAutoplay(section, {
    interval: SCENE_MS,
    onStep: next,
    disabled: current === TEAM,
  })

  const pick = (to: number) => {
    stop()
    setRound((value) => value + 1)
    setIndex(stepIndex(to, keys.length, 0))
  }
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
    const step = moves[event.key]
    if (step === undefined && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const to =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? keys.length - 1
          : stepIndex(index, keys.length, step)
    pick(to)
    event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus()
  }
  const line = lines.find((entry) => entry.key === current)

  // On a phone the tabs scroll sideways: keep the chosen one in view (not `scrollIntoView`, which
  // would also scroll the page).
  useEffect(() => {
    const row = tablist.current
    const tab = row?.querySelectorAll<HTMLElement>('[role="tab"]')[index]
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollTo({
      left: tab.offsetLeft - row.offsetLeft - 8,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [index])

  return (
    <section
      ref={section}
      id="linie"
      data-rail-section
      aria-labelledby="linie-h"
      className={`pk-scene ${HUB_CONTAINER}`}
      data-running={running ? '' : undefined}
      {...handlers}
    >
      <div className="pk-scene__head">
        <div className="pk-scene__intro">
          <span className="pk-eb">{head.eyebrow}</span>
          <h2 id="linie-h" className="pk-h2">
            <HeadingText text={head.title} emClass="pk-nowrap" />
          </h2>
          <p className="pk-lead">{head.lead}</p>
        </div>
        <span className="pk-scene__nav">
          {allHref && (
            <a href={allHref} className="pk-bx">
              {head.allLink} <span aria-hidden="true">→</span>
            </a>
          )}
          <button
            type="button"
            className="pk-bx pk-bx--round"
            aria-label="Poprzednia linia"
            onClick={() => pick(stepIndex(index, keys.length, -1))}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="pk-bx pk-bx--round"
            aria-label="Następna linia"
            onClick={() => pick(stepIndex(index, keys.length, 1))}
          >
            <span aria-hidden="true">→</span>
          </button>
        </span>
      </div>

      <div
        ref={tablist}
        role="tablist"
        aria-label="Linie PRO-KOM"
        className="pk-lr"
        onKeyDown={onKey}
      >
        {keys.map((key, i) => {
          const entry = lines.find((l) => l.key === key)
          const on = i === index
          return (
            <button
              key={key}
              id={`pk-lt-${key}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="pk-scene-panel"
              tabIndex={on ? 0 : -1}
              className="pk-lt"
              style={lineStyle(entry ? entry.key : 'prokom')}
              onClick={() => pick(i)}
            >
              <span className="pk-lt__top">
                <Mark size="xs" decorative />
                <span aria-hidden="true" className="pk-lt__dot" />
              </span>
              <span className="pk-lt__name">{entry ? entry.name : 'Razem'}</span>
              <span className="pk-lt__short">{entry ? entry.hero.short : team.eyebrow}</span>
              <span aria-hidden="true" className="pk-lpt">
                <i key={`${round}-${i}`} data-state={on ? (running ? 'run' : 'on') : undefined} />
              </span>
            </button>
          )
        })}
      </div>

      <div
        id="pk-scene-panel"
        role="tabpanel"
        aria-labelledby={`pk-lt-${current}`}
        key={`${current}-${round}`}
        className="pk-pn-wrap pk-stg"
        style={lineStyle(line ? line.key : 'prokom')}
      >
        {line ? (
          <LinePanel
            line={line}
            techStages={techStages}
            cameras={cameras}
            cameraNotes={cameraNotes}
          />
        ) : (
          <TeamPanel team={team} lines={lines} phone={phone} tel={tel} />
        )}
      </div>
    </section>
  )
}

function LinePanel({
  line,
  techStages,
  cameras,
  cameraNotes,
}: {
  line: HomeLine
  techStages: Props['techStages']
  cameras: Props['cameras']
  cameraNotes: Props['cameraNotes']
}) {
  const { scene } = line
  const href = line.url
  return (
    <>
      <span aria-hidden="true" className="pk-pn__mark">
        {line.name}
      </span>
      <div className="pk-pn__main">
        <span className="pk-pn__top">
          <Mark label={line.label} size="md" />
          {line.url && line.domain && (
            <a href={line.url} className="pk-pn__domain">
              <i aria-hidden="true" className="pk-rec" />
              {line.domain} <span aria-hidden="true">↗</span>
            </a>
          )}
        </span>
        <h3 className="pk-pn__h">{scene.heading}</h3>
        <p className="pk-pn__lead">{scene.lead}</p>
        {scene.facts.length > 0 && (
          <ul className="pk-lfx-list">
            {scene.facts.map((fact) => (
              <li key={fact} className="pk-lfx">
                <span className="pk-lfi" aria-hidden="true">
                  <Icon name="check" strokeWidth={3} />
                </span>
                {fact}
              </li>
            ))}
          </ul>
        )}
        <div className="pk-pn__cta">
          {line.url && (
            <a href={line.url} className="pk-btn-line">
              {scene.cta} <span aria-hidden="true">↗</span>
            </a>
          )}
          {line.points.length === 0 && line.phone && line.tel && (
            <a href={line.tel} className="pk-btn-phone">
              {line.phone}
            </a>
          )}
        </div>
        {/* Tech's points (runda 1811 D5): one number per point and the infoline. */}
        {line.points.length > 0 && (
          <ul className="pk-pn__points" role="list">
            {line.points.map((point) => (
              <li key={point.tel}>
                <a href={point.tel} className="pk-pn__point">
                  <span className="sr-only">{line.name}, </span>
                  <small>{point.label}</small>
                  <span className="sr-only">: </span>
                  <b>{point.phone}</b>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="pk-pn__who">
          <strong>Dla kogo:</strong> {scene.who}
        </p>
      </div>

      <div className="pk-pn__side">
        <LineVisual
          line={line}
          techStages={techStages}
          cameras={cameras}
          cameraNotes={cameraNotes}
        />
        <ul className="pk-ig">
          {scene.services.map((service) => (
            <li key={service.title}>
              <MaybeLink href={href} className="pk-svc">
                <span className="pk-svi" aria-hidden="true">
                  <Icon name={iconForService(service.title)} />
                </span>
                <span className="pk-svc__text">
                  <span className="pk-svc__title">{service.title}</span>
                  <span className="pk-svc__desc">{service.text}</span>
                </span>
              </MaybeLink>
            </li>
          ))}
        </ul>
        {scene.more.length > 0 && (
          <div className="pk-more">
            <span className="pk-more__label">Także</span>
            <ul>
              {scene.more.map((item) => (
                <li key={item}>
                  <MaybeLink href={href} className="pk-mch">
                    {item}
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pk-pn__foot">
        {scene.steps.length > 0 && (
          <ol className="pk-ss" aria-label="Jak zaczynamy">
            {scene.steps.map((step, i) => (
              <li key={step.title}>
                <span className="pk-ss__n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="pk-ss__t">{step.title}</span>
                <span aria-hidden="true" className="pk-ss__arrow">
                  →
                </span>
              </li>
            ))}
          </ol>
        )}
        {line.tools.length > 0 && (
          <span className="pk-pn__tools">
            <span className="pk-pn__tools-label">Online</span>
            {line.tools.map((tool) =>
              tool.url ? (
                <a key={tool.title} href={tool.url} className="pk-mch pk-mch--solid">
                  {tool.title} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span key={tool.title} className="pk-mch pk-mch--solid">
                  {tool.title}
                </span>
              ),
            )}
          </span>
        )}
      </div>
    </>
  )
}

/** Icons of the rows of the Biznes app window, by place (illustration only). */
const SCENE_ROW_ICONS = ['bolt', 'pc', 'site', 'shield'] as const

/** The picture on the right of a line: decorative, except the cameras and the repair stages. */
function LineVisual({
  line,
  techStages,
  cameras,
  cameraNotes,
}: {
  line: HomeLine
  techStages: Props['techStages']
  cameras: Props['cameras']
  cameraNotes: Props['cameraNotes']
}) {
  const [camera, setCamera] = useState(0)
  const [stage, setStage] = useState(Math.max(0, Math.min(2, techStages.length - 1)))
  switch (line.key) {
    case 'biznes':
      return (
        <div aria-hidden="true" className="pk-pn pk-app pk-app--big">
          <span className="pk-app__bar">
            <i className="pk-app__logo" />
            <span>Twoja firma</span>
            <em>
              <i /> wszystko działa
            </em>
          </span>
          <span className="pk-app__rows">
            {line.scene.status.map((row, i) => (
              <span key={row.label} className="pk-vr pk-vr--big pk-app__row">
                <b className="pk-app__ico">
                  <Icon name={SCENE_ROW_ICONS[i % SCENE_ROW_ICONS.length] ?? 'check'} />
                </b>
                <span className="pk-app__label">{row.label}</span>
                <span className="pk-vp">
                  <Tick />
                  {row.state}
                </span>
              </span>
            ))}
          </span>
          <span className="pk-app__sync">
            <i />
          </span>
        </div>
      )
    case 'instalacje':
      if (cameras.length === 0) return null
      return (
        <>
          <div
            className="pk-pn pk-cams"
            style={{
              gridTemplateColumns: cameras
                .map((_, i) => (i === camera ? '2.6fr' : '1fr'))
                .join(' '),
            }}
          >
            {cameras.map((cam, i) => (
              <button
                key={cam.label}
                type="button"
                className="pk-cb"
                data-kind={cam.kind}
                aria-pressed={i === camera}
                aria-label={`Pokaż: ${cam.label}`}
                onClick={() => setCamera(i)}
              >
                {cam.kind === 'cam' ? (
                  <span aria-hidden="true" className="pk-cb__feed">
                    <CamScene scene={i % 2} />
                  </span>
                ) : (
                  <span aria-hidden="true" className="pk-cb__feed pk-cb__feed--wifi">
                    <WifiArcs strength={96} />
                  </span>
                )}
                <em>{cam.label}</em>
              </button>
            ))}
          </div>
          <p className="pk-pn__note" aria-live="polite">
            {cameras[camera]?.kind === 'wifi' ? cameraNotes.wifi : cameraNotes.camera}
          </p>
        </>
      )
    case 'software':
      return (
        <div aria-hidden="true" className="pk-soft">
          <span className="pk-pn pk-soft__page">
            <WebMock size="lg" />
          </span>
          <span className="pk-pn pk-soft__mobile">
            <PhoneMock />
          </span>
        </div>
      )
    case 'tech':
      if (techStages.length === 0) return null
      return (
        <div className="pk-pn pk-stages">
          <span className="pk-pn__caption">
            ETAPY NAPRAWY · KLIKNIJ ETAP
            <span>
              <i aria-hidden="true" className="pk-rec" />
              ONLINE
            </span>
          </span>
          <span aria-hidden="true" className="pk-stages__head">
            <ProgressRing value={((stage + 1) / techStages.length) * 100}>
              <Icon name="wrench" />
            </ProgressRing>
            <span>
              <small>Twoje zgłoszenie</small>
              <strong>{techStages[stage]?.title}</strong>
            </span>
            <em>
              {stage + 1}/{techStages.length}
            </em>
          </span>
          <span role="group" aria-label="Etapy naprawy" className="pk-stages__row">
            {techStages.map((item, i) => (
              <button
                key={item.title}
                type="button"
                aria-pressed={i === stage}
                data-state={i < stage ? 'done' : i === stage ? 'now' : undefined}
                onClick={() => setStage(i)}
              >
                <span aria-hidden="true">{i < stage ? <Tick /> : i + 1}</span>
                {item.title}
              </button>
            ))}
          </span>
          <span className="pk-stages__text" aria-live="polite">
            {techStages[stage]?.text}
          </span>
        </div>
      )
    case 'gaming':
      return (
        <div aria-hidden="true" className="pk-pn pk-game">
          <span className="pk-pn__caption">
            KLATKI MIERZONE W GRACH
            <span>
              <i className="pk-rec" />
              TEST
            </span>
          </span>
          <FpsGraph size="lg" />
          <span className="pk-game__foot">
            <span className="pk-game__fps">
              FPS<small>średnio w teście</small>
            </span>
            <span className="pk-game__parts">
              <i>CPU</i>
              <i>GPU</i>
              <i>RAM</i>
              <i>SSD</i>
            </span>
          </span>
        </div>
      )
  }
}

function TeamPanel({
  team,
  lines,
  phone,
  tel,
}: {
  team: Props['team']
  lines: HomeLine[]
  phone: string | null
  tel: string | null
}) {
  const [index, setIndex] = useState(0)
  const example = team.examples[index]
  return (
    <>
      <div className="pk-pn__main">
        <Mark
          label={team.eyebrow.toLocaleUpperCase('pl-PL')}
          size="md"
          className="pk-pn__team-mark"
        />
        <h3 className="pk-pn__h">{team.title}</h3>
        <p className="pk-pn__lead">{team.lead}</p>
        {team.examples.length > 1 && (
          <div role="group" aria-label="Wybierz przykład" className="pk-team__tabs">
            {team.examples.map((entry, i) => (
              <button
                key={entry.persona}
                type="button"
                aria-pressed={i === index}
                className="pk-team__tab"
                onClick={() => setIndex(i)}
              >
                {entry.tab}
              </button>
            ))}
          </div>
        )}
        <div className="pk-pn__cta">
          {phone && tel && (
            <a href={tel} className="pk-btn-line">
              {phone}
            </a>
          )}
          <a href="#dobierz" className="pk-btn-phone pk-btn-phone--text">
            {team.cta}
          </a>
        </div>
        <span className="pk-team__note">
          <span aria-hidden="true" />
          {team.note}
        </span>
      </div>

      {example && (
        <div className="pk-tw" key={example.persona}>
          <div className="pk-th">
            <span aria-hidden="true" className="pk-thi">
              <Icon name="home" />
            </span>
            <span className="pk-th__text">
              <span className="pk-th__node">{example.node}</span>
              <span className="pk-th__title">{example.title}</span>
            </span>
          </div>
          {example.cards.map((card, i) => {
            const line = lines.find((entry) => entry.key === card.line)
            if (!line) return null
            return (
              <MaybeLink
                key={card.line}
                href={line.url}
                className="pk-tc"
                style={{ ...lineStyle(card.line), animationDelay: `${0.12 + i * 0.1}s` }}
              >
                <Mark label={line.label} className="pk-tc__mark" />
                <span className="pk-tc__points">
                  {card.points.map((point) => (
                    <span key={point} className="pk-tch">
                      {point}
                    </span>
                  ))}
                </span>
                {line.phone && (
                  <span className="pk-tph">
                    {line.phone}
                    <i aria-hidden="true">↗</i>
                  </span>
                )}
              </MaybeLink>
            )
          })}
          <div className="pk-te">
            {team.pillars.map((pillar) => (
              <span key={pillar}>
                <i aria-hidden="true" />
                {pillar}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/** A link to the line's site; without an address plain text, never a dead link to this page. */
function MaybeLink({
  href,
  className,
  style,
  children,
}: {
  href: string | null
  className: string
  style?: CSSProperties
  children: ReactNode
}) {
  return href ? (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  ) : (
    <span className={className} style={style}>
      {children}
    </span>
  )
}
