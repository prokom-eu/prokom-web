import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import type { HomeArea } from '@/lib/software/homeAreas'

/**
 * Picture of an area in the „Oferta” panel (board `Main`, `OXD` scenes): a small mock-up on the
 * area's gradient — HTML, decorative, colours from tokens only. Sample content, not an offer.
 */

const card = 'rounded-xl bg-card text-ink shadow-raised'
const toastClass = cx(card, 'absolute flex items-center gap-2 px-3 py-2 text-xs font-extrabold')

function Toast({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={cx(toastClass, className)}>
      <i className="grid size-5 place-items-center rounded-full bg-ok text-[10px] not-italic text-white">
        ✓
      </i>
      {children}
    </span>
  )
}

function Site() {
  return (
    <>
      <div className={cx(card, 'w-[78%] overflow-hidden p-2.5')}>
        <div className="flex items-center gap-1.5 px-1 pb-2 text-[11px] text-ink-2">
          <i className="size-1.5 rounded-full bg-border" />
          <i className="size-1.5 rounded-full bg-border" />
          <i className="size-1.5 rounded-full bg-border" />
          <span className="ml-2">twojafirma.pl</span>
        </div>
        <div className="rounded-lg bg-cta p-4 text-white">
          <b className="font-mock text-lg">Remonty łazienek</b>
          <span className="block text-[11px] opacity-85">Rabka-Zdrój i okolice</span>
          <span className="mt-2.5 inline-block rounded-md bg-card px-2.5 py-1 text-[11px] font-extrabold text-ink">
            Bezpłatna wycena
          </span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <i className="h-8 rounded-md bg-surface-2" />
          <i className="h-8 rounded-md bg-surface-2" />
          <i className="h-8 rounded-md bg-surface-2" />
        </div>
      </div>
      <Toast className="bottom-[10%] right-[8%]">Nowe zapytanie ze strony</Toast>
    </>
  )
}

function Panel() {
  const columns: [string, string[]][] = [
    ['Nowe', ['Łazienka · Kowalscy', 'Taras · Lis']],
    ['W drodze', ['Kuchnia · Nowak']],
    ['Gotowe', ['Dach · Wójcik']],
  ]
  return (
    <div className={cx(card, 'grid w-[82%] grid-cols-[22%_1fr] overflow-hidden text-[10.5px]')}>
      <div className="flex flex-col gap-1 bg-surface-dark p-2.5 font-bold text-white/70">
        <b className="mb-1 text-white">Twoja Firma</b>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-white">Zlecenia</span>
        <span className="px-1.5">Ekipy</span>
        <span className="px-1.5">Klienci</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 bg-surface-2 p-2.5">
        {columns.map(([name, cards]) => (
          <div key={name} className="flex flex-col gap-1">
            <small className="font-extrabold text-ink-2">{name}</small>
            {cards.map((text) => (
              <span key={text} className="rounded-md bg-card p-1.5 text-ink">
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Phone() {
  return (
    <>
      <div
        className={cx(
          card,
          'flex w-[150px] flex-col gap-2 rounded-[22px] border-4 border-ink p-3 text-[11px]',
        )}
      >
        <b>Dziś · Ekipa Marka</b>
        <span className="rounded-lg bg-surface-2 p-2">
          <b className="block">8:00 · Łazienka</b>
          <small className="text-ink-2">Kowalscy · Rabka</small>
        </span>
        <span className="rounded-lg bg-surface-2 p-2">
          <b className="block">13:00 · Taras</b>
          <small className="text-ink-2">Lis · Mszana Dolna</small>
        </span>
        <span className="rounded-lg bg-accent py-1.5 text-center font-extrabold text-accent-ink">
          Zakończ zlecenie
        </span>
      </div>
      <Toast className="bottom-[12%] right-[6%]">Protokół ze zdjęciami zapisany</Toast>
    </>
  )
}

function Calendar() {
  const taken = new Set([2, 3, 8, 17, 18])
  const chosen = new Set([11, 12, 13])
  return (
    <div className={cx(card, 'w-[62%] p-3 text-[11px]')}>
      <div className="mb-2 flex justify-between">
        <b>Styczeń</b>
        <span className="text-ink-2">Pokój z widokiem</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 21 }, (_, i) => (
          <i
            key={i}
            className={cx(
              'h-5 rounded',
              chosen.has(i) ? 'bg-accent' : taken.has(i) ? 'bg-border' : 'bg-surface-2',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function Plug() {
  return (
    <div className="flex w-[80%] flex-col items-center gap-3">
      <div className="flex w-full items-center gap-2">
        <span className={cx(card, 'px-3 py-2 text-xs font-extrabold')}>Twój obecny program</span>
        <i className="h-0.5 flex-1 border-t-2 border-dashed border-accent-line" />
        <span className="rounded-xl bg-accent px-3 py-2 text-xs font-extrabold text-accent-ink shadow-raised">
          + nowy moduł
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {['Panel dla klientów', 'Połączenie z fakturami', 'Raporty'].map((text) => (
          <span key={text} className={cx(card, 'px-2.5 py-1 text-[11px] font-bold')}>
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}

function Flow() {
  return (
    <div className="flex w-[80%] items-center gap-3">
      <span className={cx(card, 'px-3 py-2 text-xs font-extrabold')}>Nowe zlecenie</span>
      <i className="h-0.5 w-8 bg-accent-line" />
      <div className="flex flex-col gap-1.5">
        {['SMS do klienta', 'Faktura w programie', 'Raport dla szefa w poniedziałek'].map(
          (text) => (
            <span
              key={text}
              className={cx(card, 'flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold')}
            >
              <i className="text-ok-text not-italic">✓</i>
              {text}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

function Checks({
  title,
  note,
  rows,
}: {
  title?: string
  note?: string
  rows: [string, string, boolean][]
}) {
  return (
    <div className={cx(card, 'flex w-[62%] flex-col gap-1.5 p-3 text-[11px]')}>
      {title && (
        <div className="mb-1 flex justify-between">
          <b>{title}</b>
          <span className="text-ink-2">{note}</span>
        </div>
      )}
      {rows.map(([name, state, good]) => (
        <span
          key={name}
          className="flex items-center justify-between rounded-md bg-surface-2 px-2 py-1.5"
        >
          <b>{name}</b>
          <em className={cx('not-italic font-extrabold', good ? 'text-ok-text' : 'text-ink-2')}>
            {state}
          </em>
        </span>
      ))}
    </div>
  )
}

const SCENES: Record<HomeArea['key'], () => ReactNode> = {
  www: Site,
  sys: Panel,
  app: Phone,
  cal: Calendar,
  plug: Plug,
  auto: Flow,
  care: () => (
    <Checks
      rows={[
        ['Kopia zapasowa', 'dziś 03:00', true],
        ['Aktualizacje', 'na bieżąco', true],
        ['Monitoring', 'działa', true],
      ]}
    />
  ),
  aud: () => (
    <Checks
      title="Audyt strony"
      note="raport na piśmie"
      rows={[
        ['Szybkość', 'do poprawy', false],
        ['Telefon', 'dobrze', true],
        ['Google i AI', 'do poprawy', false],
        ['Bezpieczeństwo', 'dobrze', true],
      ]}
    />
  ),
}

export function AreaScene({ areaKey }: { areaKey: HomeArea['key'] }) {
  const Scene = SCENES[areaKey]
  return (
    <div
      aria-hidden="true"
      // Dotted stage, one flat colour for every area (ADR-015 v23, board `Main` `.oxs`).
      className="relative grid h-56 place-items-center overflow-hidden rounded-t-[26px] bg-surface-2 bg-dots min-[640px]:h-[270px]"
    >
      <Scene />
    </div>
  )
}
