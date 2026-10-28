'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import {
  AUTO_STEP_MS,
  autoStep,
  builderHint,
  buildItem,
  complexity,
  DEFAULT_MODULES,
  moduleCountLabel,
  orderModules,
  toggleModule,
} from '@/lib/software/heroBuilder'
import { projectActions, useProject } from '@/lib/software/projectStore'
import { PathIcon } from '@/sites/software/components/wizard/WizardPreview'

export type HeroModule = { key: string; label: string; icon: string }

type Props = { modules: readonly HeroModule[] }

// Sidebar names of the modules in the mock-up's panel (board `Main`); `www` has none.
const SIDE: Record<string, string> = {
  zlec: 'Zlecenia',
  app: 'Ekipy',
  fv: 'Faktury',
  sms: 'Powiadomienia',
  rap: 'Raporty',
  ai: 'Asystent',
}

/** Sample order number of the mock-up (as on the board). */
const ORDER = 128

const tag = 'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold'

function Widget({
  title,
  children,
  accent,
}: {
  title: string
  children: ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={cx(
        'flex min-w-0 flex-col gap-1 rounded-lg border p-2 text-[10px] leading-tight',
        accent ? 'border-accent-line bg-accent-soft' : 'border-border bg-card',
      )}
    >
      <b className={cx('text-[10.5px]', accent ? 'text-accent-text' : 'text-ink')}>{title}</b>
      {children}
    </div>
  )
}

function Row({ name, label, className }: { name: string; label: string; className: string }) {
  return (
    <span className="flex items-center justify-between gap-1 text-ink-2">
      <span className="truncate">{name}</span>
      <span className={cx(tag, className)}>{label}</span>
    </span>
  )
}

/** Sample content of the mock-up widgets — an illustration, not an offer (board `Main`). */
function widgets(on: (key: string) => boolean) {
  return [
    on('www') && (
      <Widget key="www" title="Zapytania ze strony">
        <Row
          name="Remont łazienki · Kowalscy"
          label="nowe"
          className="bg-accent-soft text-accent-text"
        />
        <Row name="Taras · Lis" label="wycena" className="bg-chip text-ink" />
      </Widget>
    ),
    on('zlec') && (
      <Widget key="zlec" title="Zlecenia w tym tygodniu">
        <span className="flex h-8 items-end gap-1">
          {[40, 55, 48, 70, 62, 92].map((height, i) => (
            <i
              key={i}
              className={cx('flex-1 rounded-sm', i === 5 ? 'bg-accent' : 'bg-accent-soft')}
              style={{ height: `${height}%` }}
            />
          ))}
        </span>
      </Widget>
    ),
    on('app') && (
      <Widget key="app" title="Ekipy w terenie">
        <Row
          name="Ekipa Marka · Poddasze"
          label="na miejscu"
          className="bg-surface-2 text-ok-text"
        />
        <Row name="Ekipa Piotra · Kuchnia" label="w drodze" className="bg-chip text-ink" />
      </Widget>
    ),
    on('fv') && (
      <Widget key="fv" title="Do faktury">
        <Row name={`Łazienka #${ORDER}`} label="wysłana" className="bg-surface-2 text-ok-text" />
        <Row name={`Schody #${ORDER - 1}`} label="czeka" className="bg-chip text-ink" />
      </Widget>
    ),
    on('sms') && (
      <Widget key="sms" title="Powiadomienia">
        <span className="text-ink-2">SMS do klienta: „Ekipa będzie jutro 8:00”</span>
        <span className="font-extrabold text-ok-text">wysłano · 09:12</span>
      </Widget>
    ),
    on('rap') && (
      <Widget key="rap" title="Raport tygodnia">
        <span className="font-display text-base font-black text-ink">48 200 zł</span>
        <span className="text-ink-2">14 zleceń · 3 opóźnione</span>
      </Widget>
    ),
    on('ai') && (
      <Widget key="ai" title="Asystent AI" accent>
        <span className="text-ink-2">
          Streścił 3 zapytania i przygotował odpowiedzi. Ty zatwierdzasz.
        </span>
      </Widget>
    ),
  ].filter(Boolean)
}

function Note({
  show,
  className,
  title,
  text,
}: {
  show: boolean
  className: string
  title: string
  text: string
}) {
  return (
    <span
      className={cx(
        'absolute z-20 hidden max-w-[200px] flex-col rounded-xl bg-card px-3 py-2 text-xs font-extrabold text-ink shadow-raised transition duration-300 min-[640px]:flex',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        className,
      )}
    >
      {title}
      <small className="text-[11px] font-semibold text-ink-2">{text}</small>
    </span>
  )
}

/**
 * „Twój system” in the hero (spec. §4 pkt 1): a panel mock-up that assembles itself from
 * modules until the visitor touches it (never with `prefers-reduced-motion`, paused while the
 * tab is hidden), the module switches, the count with complexity and a hint, and one
 * „Twój projekt” item for the chosen set. The mock-up itself is decorative.
 */
export function HeroBuilder({ modules }: Props) {
  const all = modules.map((module) => module.key)
  const [on, setOn] = useState<string[]>(() => orderModules(DEFAULT_MODULES, all))
  const [touched, setTouched] = useState(false)
  const project = useProject()

  useEffect(() => {
    if (touched || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let state = { count: Math.min(DEFAULT_MODULES.length, all.length), hold: 0 }
    const timer = window.setInterval(() => {
      if (document.hidden) return
      state = autoStep(state, all.length)
      setOn(all.slice(0, state.count))
    }, AUTO_STEP_MS)
    return () => window.clearInterval(timer)
    // `all` comes from the server and does not change while the page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched])

  const has = (key: string) => on.includes(key)
  const n = on.length
  const level = complexity(n)
  const item = buildItem(on)
  const added = project.some((entry) => entry.id === item.id)
  const side = on.filter((key) => SIDE[key]).map((key) => SIDE[key])
  const panel = widgets(has)

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div aria-hidden="true" className="relative mx-auto w-full max-w-[640px] pt-10">
        <span className="absolute left-1/2 top-0 z-30 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-card px-3 py-1.5 text-xs font-extrabold text-ink shadow-raised ring-1 ring-border">
          <i className="size-2 rounded-full bg-ok" />
          Twój system ·
          <span className="font-bold text-ink-2">
            {touched ? 'Twój wybór' : 'składa się samo · kliknij, żeby przejąć'}
          </span>
        </span>
        <div className="absolute inset-x-[6%] top-4 bottom-[-6%] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_68%)]" />
        <div className="relative mx-[4%] rounded-t-[14px] border-[6px] border-b-0 border-surface-dark bg-surface-dark">
          <div className="grid aspect-[16/10] grid-cols-[26%_1fr] overflow-hidden rounded-t-[8px]">
            <div className="flex flex-col gap-1 bg-surface-dark p-2.5 text-[10px] font-bold text-white/70 min-[640px]:p-3">
              <span className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold text-white">
                <i className="size-3 rounded bg-accent" />
                Twoja Firma
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1 text-white">Pulpit</span>
              {side.map((name) => (
                <span key={name} className="px-2 py-1">
                  {name}
                </span>
              ))}
            </div>
            <div className="flex min-w-0 flex-col gap-2 bg-surface-2 p-2.5 min-[640px]:p-3">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-ink">
                <span>Dzień dobry, Anna</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-ok-text">
                  <i className="size-1.5 rounded-full bg-ok" />
                  na żywo
                </span>
              </div>
              {panel.length === 0 ? (
                <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border p-3 text-center text-[11px] font-bold text-ink-2">
                  Tu pojawi się Twój system. Dodaj pierwszy moduł.
                </div>
              ) : (
                <div className="grid grid-cols-2 content-start gap-1.5">{panel}</div>
              )}
            </div>
          </div>
        </div>
        <div className="relative mx-0 h-3 rounded-b-xl bg-border" />
        <div
          className={cx(
            'absolute bottom-[2%] right-[2%] z-10 w-[22%] min-w-[92px] overflow-hidden rounded-[18px] border-[4px] border-ink bg-card text-[9px] shadow-raised transition duration-300',
            has('app') ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
        >
          <div className="bg-accent px-2 pb-2 pt-5 text-accent-ink">
            <span className="font-bold">Zlecenie #{ORDER}</span>
            <b className="block text-[10px]">Łazienka · Kowalscy</b>
          </div>
          <div className="flex flex-col gap-1 p-2 text-ink-2">
            <span>☑ Demontaż</span>
            <span>☑ Hydroizolacja</span>
            <span>☐ Odbiór z klientem</span>
            <span className="mt-1 rounded-md bg-accent py-1.5 text-center font-extrabold text-accent-ink">
              Zakończ zlecenie
            </span>
          </div>
        </div>
        <Note
          show={has('fv')}
          className="bottom-[14%] left-0"
          title="Twój program do faktur"
          text="zostaje, dane płyną same"
        />
        <Note
          show={has('ai')}
          className="left-0 top-[18%]"
          title="Asystent AI"
          text="odpowiada, Ty zatwierdzasz"
        />
        <Note
          show={has('sms')}
          className="right-0 top-[14%]"
          title="SMS wysłany"
          text="klient wie, kiedy przyjedziecie"
        />
      </div>

      <div
        role="group"
        aria-label="Moduły Twojego systemu"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[640px]:mx-0 min-[640px]:flex-wrap min-[640px]:justify-center min-[640px]:overflow-visible min-[640px]:px-0"
      >
        {modules.map((module) => {
          const active = has(module.key)
          return (
            <button
              key={module.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setTouched(true)
                setOn((current) => toggleModule(current, module.key, all))
              }}
              className={cx(
                'inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 text-sm font-bold transition-colors',
                active
                  ? 'border-accent-line bg-accent-soft text-ink'
                  : 'border-border bg-card text-ink hover:border-accent-line',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-5 place-items-center rounded-full text-[11px] font-extrabold',
                  active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2',
                )}
              >
                {active ? '✓' : '+'}
              </span>
              <PathIcon d={module.icon} className="size-4" />
              {module.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
        <div className="flex items-center gap-3.5">
          <span className="font-display text-3xl font-black text-grad-h1">{n}</span>
          <span className="flex flex-col leading-tight">
            <b>{moduleCountLabel(n)}</b>
            <span className="text-sm text-ink-2">{builderHint(n)}</span>
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="flex min-w-36 flex-col gap-1.5 text-xs font-extrabold uppercase text-ink-2">
            Złożoność · {level.level}
            <span className="h-1.5 rounded-full bg-surface-2">
              <i
                className="block h-full rounded-full bg-accent"
                style={{ width: `${level.width}%` }}
              />
            </span>
          </span>
          <button
            type="button"
            disabled={n === 0}
            aria-pressed={added}
            onClick={() => projectActions.toggle(item.id, item.name)}
            className={cx(
              'min-h-11 shrink-0 rounded-xl px-4 text-sm font-extrabold disabled:opacity-50',
              added ? 'bg-accent-soft text-accent-text' : 'bg-button text-accent-ink',
            )}
          >
            {added ? '✓ W Twoim projekcie' : 'Chcę taki system'}
          </button>
        </div>
      </div>
    </div>
  )
}
