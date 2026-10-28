import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import type { PreviewKind } from '@/lib/software/previews'

/**
 * Screens of „Podglądy na żywo” (board `Main`, `#podglady`): what a sample customer's site,
 * booking page, panel, field app and automations look like — HTML, decorative, colours from the
 * Software tokens only (decision 28.10, like `AreaScene`). Sample content, not an offer.
 *
 * Every screen is drawn in `em` on a font size taken from its frame's width (`cqw`), so the
 * whole mock-up scales with the frame without JS: 10 px per em at the board's 880 px laptop.
 */

const box = 'rounded-[0.8em] border border-border bg-card'
const pill = 'rounded-full px-[0.8em] py-[0.3em] text-[1em] font-extrabold'

/** Hills and a house — the „photo” of the sample sites, on an area gradient. */
function Picture({
  area,
  className,
  children,
}: {
  area: string
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cx('relative overflow-hidden rounded-[1.2em]', className)}
      style={{ backgroundImage: `var(--grad-area-${area})` }}
    >
      <svg
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full text-white"
        fill="currentColor"
      >
        <path d="M0 140L60 78L110 118L170 46L232 108L300 66V200H0Z" opacity="0.28" />
        <path d="M0 172L80 132L150 160L222 124L300 150V200H0Z" opacity="0.45" />
        <path d="M112 200V152L152 124L192 152V200Z" opacity="0.95" />
      </svg>
      {children}
    </div>
  )
}

function Laptop({ children }: { children: ReactNode }) {
  return (
    <div className="@container">
      <div className="rounded-t-[1.6cqw] bg-surface-dark p-[1.2cqw] pb-[1.4cqw] shadow-raised">
        <div
          className="relative aspect-[880/510] overflow-hidden rounded-[0.9cqw] bg-surface text-ink"
          style={{ fontSize: 'calc(100cqw / 92)' }}
        >
          {children}
          <span className="absolute right-[1em] bottom-[1em] rounded-[0.5em] bg-surface-dark px-[0.8em] py-[0.4em] text-[0.9em] font-extrabold tracking-[0.1em] text-white">
            DANE FIKCYJNE
          </span>
        </div>
      </div>
      <div className="mx-[-4%] h-[1.8cqw] rounded-b-[2cqw] bg-border" />
    </div>
  )
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="@container">
      <div className="rounded-[14cqw] bg-surface-dark p-[3.5cqw] shadow-raised">
        <div
          className="relative aspect-[230/470] overflow-hidden rounded-[11cqw] bg-surface text-ink"
          style={{ fontSize: 'calc(100cqw / 22)' }}
        >
          <span className="absolute top-[0.8em] left-1/2 z-10 h-[1.6em] w-[7em] -translate-x-1/2 rounded-full bg-surface-dark" />
          {children}
        </div>
      </div>
    </div>
  )
}

function Brand({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cx('flex items-center gap-[0.6em] font-extrabold', className)}>
      <span className="size-[1.6em] rounded-[0.45em] bg-accent" />
      {name}
    </span>
  )
}

/* ------------------------------------------------------------------ laptop */

function SiteLaptop() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-[2.8em] py-[1.4em]">
        <Brand name="Twoja Firma" className="text-[1.5em]" />
        <span className="flex gap-[2em] text-[1.2em] font-bold text-ink-2">
          <span>Oferta</span>
          <span>Realizacje</span>
          <span>Opinie</span>
          <span>Kontakt</span>
        </span>
        <span className="rounded-[0.8em] bg-button px-[1.2em] py-[0.7em] text-[1.2em] font-extrabold text-accent-ink">
          Bezpłatna wycena
        </span>
      </div>
      <div className="flex items-center gap-[2.6em] px-[2.8em] pt-[3em] pb-[2em]">
        <div className="flex flex-1 flex-col gap-[1.1em]">
          <span className="text-[1.1em] font-extrabold tracking-[0.14em] text-accent-text">
            REMONTY · PODHALE
          </span>
          <span className="font-display text-[3.8em] leading-[1.02] font-extrabold">
            Remonty i wykończenia pod klucz
          </span>
          <span className="text-[1.3em] text-ink-2">
            Łazienki, kuchnie i poddasza. Jedna ekipa od projektu po sprzątanie.
          </span>
          <span className="mt-[0.4em] flex gap-[0.8em] text-[1.2em] font-extrabold">
            <span className="rounded-[0.8em] bg-button px-[1.3em] py-[0.8em] text-accent-ink">
              Umów wycenę
            </span>
            <span className="rounded-[0.8em] border border-border px-[1.3em] py-[0.8em]">
              Zobacz realizacje
            </span>
          </span>
        </div>
        <Picture area="www" className="h-[22em] flex-1">
          <span
            className={cx(
              box,
              'absolute bottom-[1.2em] left-[1.2em] px-[1em] py-[0.5em] text-[1.1em] font-extrabold',
            )}
          >
            Wolne terminy: marzec
          </span>
        </Picture>
      </div>
      <div className="grid grid-cols-3 gap-[1.2em] px-[2.8em]">
        {[
          ['Łazienki', 'Od projektu po fugi'],
          ['Kuchnie', 'Zabudowa i instalacje'],
          ['Poddasza', 'Ocieplenie i wykończenie'],
        ].map(([name, note]) => (
          <span key={name} className={cx(box, 'flex flex-col gap-[0.4em] p-[1.4em]')}>
            <span className="size-[2.8em] rounded-[0.8em] bg-accent-soft" />
            <b className="text-[1.3em]">{name}</b>
            <span className="text-[1.1em] text-ink-2">{note}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function BookingLaptop() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-[2.8em] py-[1.4em]">
        <span className="font-mock text-[2.1em] font-bold">Twój Pensjonat</span>
        <span className="flex items-center gap-[2em] text-[1.2em] font-bold text-ink-2">
          <span>Pokoje</span>
          <span>Okolica</span>
          <span>Galeria</span>
          <span className="flex gap-[0.2em] rounded-[0.7em] bg-chip p-[0.3em] text-ink">
            <span className="rounded-[0.5em] bg-card px-[0.6em] py-[0.2em]">PL</span>
            <span className="px-[0.6em] py-[0.2em]">EN</span>
            <span className="px-[0.6em] py-[0.2em]">DE</span>
          </span>
        </span>
      </div>
      <Picture area="cal" className="mx-[2.8em] h-[19em]">
        <span className="absolute bottom-[1.6em] left-[1.6em] max-w-[60%] font-mock text-[2.2em] leading-tight font-bold text-white">
          Cisza, widok na Tatry i śniadanie z lokalnych produktów
        </span>
      </Picture>
      <div className={cx(box, 'mx-[4.8em] -mt-[2.6em] flex items-center p-[0.8em] shadow-raised')}>
        {[
          ['PRZYJAZD', '12 sty'],
          ['WYJAZD', '15 sty'],
          ['GOŚCIE', '2 osoby'],
        ].map(([caption, value]) => (
          <span
            key={caption}
            className="flex flex-1 flex-col border-r border-border px-[1em] py-[0.4em]"
          >
            <span className="text-[1em] font-extrabold text-ink-2">{caption}</span>
            <b className="text-[1.4em]">{value}</b>
          </span>
        ))}
        <span className="ml-[1em] rounded-[0.8em] bg-button px-[1.6em] py-[1em] text-[1.3em] font-extrabold text-accent-ink">
          Sprawdź termin
        </span>
      </div>
      <div className="grid grid-cols-3 gap-[1.2em] px-[2.8em] pt-[1.8em]">
        {[
          ['Pokój z widokiem', 'Wolny w tym terminie', 'cal'],
          ['Apartament rodzinny', 'Wolny w tym terminie', 'care'],
          ['Pokój dwuosobowy', 'Ostatni wolny', 'www'],
        ].map(([name, state, area]) => (
          <span key={name} className={cx(box, 'flex items-center gap-[1em] p-[1em]')}>
            <span
              className="size-[4.4em] shrink-0 rounded-[0.8em]"
              style={{ backgroundImage: `var(--grad-area-${area})` }}
            />
            <span className="flex flex-col">
              <b className="text-[1.2em]">{name}</b>
              <span
                className={cx(
                  'text-[1.1em] font-bold',
                  state === 'Ostatni wolny' ? 'text-ink-2' : 'text-ok-text',
                )}
              >
                {state}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

const JOBS = [
  ['Łazienka · Kowalscy', 'W toku'],
  ['Kuchnia · Nowakowie', 'Gotowe'],
  ['Poddasze · Wiśniewscy', 'Wycena'],
  ['Elewacja · Zając', 'Nowe'],
] as const

function Status({ state }: { state: string }) {
  return (
    <span
      className={cx(
        pill,
        'text-[0.95em]',
        state === 'Gotowe' ? 'bg-surface-2 text-ok-text' : 'bg-accent-soft text-accent-text',
      )}
    >
      {state}
    </span>
  )
}

function PanelLaptop() {
  return (
    <div className="flex h-full">
      <div className="flex w-[17em] flex-col gap-[0.2em] bg-surface-dark p-[1.6em] text-[1.2em] font-bold text-white/80">
        <span className="mx-[0.5em] mb-[1.2em] flex items-center gap-[0.6em] text-[1.1em] font-extrabold text-white">
          <span className="size-[1.6em] rounded-[0.45em] bg-accent" />
          Twoja Firma
        </span>
        {['Pulpit', 'Zlecenia', 'Kalendarz', 'Klienci', 'Magazyn', 'Faktury', 'Raporty'].map(
          (item, i) => (
            <span
              key={item}
              className={cx(
                'rounded-[0.6em] px-[0.8em] py-[0.6em]',
                i === 0 && 'bg-white/15 text-white',
              )}
            >
              {item}
            </span>
          ),
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[1.4em] px-[2.2em] py-[1.8em]">
        <div className="flex items-center justify-between">
          <b className="text-[1.8em]">Dzień dobry, Anna</b>
          <span className="flex items-center gap-[0.8em]">
            <span className={cx(box, 'h-[3em] w-[18em]')} />
            <span className="size-[3em] rounded-full bg-accent-soft" />
          </span>
        </div>
        <div className="grid grid-cols-4 gap-[1em]">
          {[
            ['Zlecenia w toku', '14'],
            ['Na dziś', '5'],
            ['Do faktury', '6'],
            ['Nowe zapytania', '3'],
          ].map(([caption, value], i) => (
            <span
              key={caption}
              className={cx(
                'rounded-[1.2em] p-[1.2em]',
                i === 3 ? 'bg-button text-accent-ink' : box,
              )}
            >
              <span className="block text-[1.1em] font-bold opacity-80">{caption}</span>
              <b className="block font-display text-[2.6em] leading-tight">{value}</b>
            </span>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_1fr] gap-[1.2em]">
          <div className={cx(box, 'flex flex-col p-[1.4em]')}>
            <b className="text-[1.2em]">Zlecenia, ostatnie 8 tygodni</b>
            <div className="flex flex-1 items-end gap-[1em] pt-[1.4em]">
              {[40, 55, 48, 62, 58, 74, 68, 86].map((height, i) => (
                <span
                  key={i}
                  className={cx(
                    'flex-1 rounded-t-[0.5em]',
                    i === 7 ? 'bg-accent' : 'bg-accent-soft',
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          <div className={cx(box, 'flex flex-col gap-[0.9em] p-[1.4em] text-[1.15em]')}>
            <b>Ostatnie zlecenia</b>
            {JOBS.map(([job, state]) => (
              <span
                key={job}
                className="flex items-center justify-between border-b border-border pb-[0.6em] last:border-0"
              >
                <span>{job}</span>
                <Status state={state} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldLaptop() {
  const columns = [
    [
      'NOWE · 2',
      [
        ['Elewacja', 'Zając · czw'],
        ['Taras', 'Kmiecik · pt'],
      ],
    ],
    ['W DRODZE · 1', [['Kuchnia', 'Nowakowie · ekipa Piotra']]],
    ['NA MIEJSCU · 1', [['Poddasze', 'Wiśniewscy · 2 zdjęcia']]],
    [
      'GOTOWE · 3',
      [
        ['Łazienka nr 128', 'Kowalscy · 3 zdjęcia · podpis'],
        ['Schody', 'Gąsienica · protokół'],
      ],
    ],
  ] as const
  return (
    <div className="flex h-full flex-col gap-[1.4em] px-[2.2em] py-[1.8em]">
      <div className="flex items-center justify-between">
        <b className="text-[1.8em]">Zlecenia · ten tydzień</b>
        <span className="flex gap-[0.6em] text-[1.1em] font-extrabold">
          <span className="rounded-[0.8em] bg-surface-dark px-[1em] py-[0.6em] text-white">
            Wszystkie ekipy
          </span>
          <span className={cx(box, 'px-[1em] py-[0.6em]')}>Ekipa Marka</span>
          <span className={cx(box, 'px-[1em] py-[0.6em]')}>Ekipa Piotra</span>
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-[1em]">
        {columns.map(([title, cards]) => (
          <div key={title} className="flex flex-col gap-[0.8em] rounded-[1.2em] bg-chip p-[1em]">
            <b className="text-[1.1em] text-ink-2">{title}</b>
            {cards.map(([name, note], i) => (
              <span key={name} className={cx(box, 'p-[1em] text-[1.1em]')}>
                <b className="block">{name}</b>
                {note}
                {title.startsWith('GOTOWE') && i === 0 && (
                  <span className="mt-[0.4em] block font-extrabold text-ok-text">przed chwilą</span>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AutomationLaptop() {
  const flows = [
    [
      'NOWE ZAPYTANIE',
      ['Formularz na stronie', 'Asystent AI streszcza', 'Przypisz do osoby', 'SMS do klienta'],
    ],
    [
      'ZLECENIE ZAKOŃCZONE',
      ['Protokół z podpisem', 'Faktura w Twoim programie', 'E-mail z fakturą'],
    ],
  ] as const
  const log = [
    ['09:12', 'Zapytanie od Jana przypisane do Marka'],
    ['09:12', 'SMS z potwierdzeniem wysłany'],
    ['10:40', 'Faktura przekazana do programu'],
    ['11:05', 'Raport tygodniowy wysłany do szefa'],
  ]
  return (
    <div className="flex h-full bg-surface-dark text-white">
      <div className="flex min-w-0 flex-1 flex-col gap-[1.6em] px-[2.2em] py-[1.8em]">
        <div className="flex items-center justify-between">
          <b className="text-[1.7em]">Automatyzacje · Twoja Firma</b>
          <span className="flex items-center gap-[0.6em] rounded-full bg-white/10 px-[1em] py-[0.5em] text-[1.1em] font-extrabold">
            <span className="size-[0.7em] rounded-full bg-ok" />
            Wszystkie działają
          </span>
        </div>
        {flows.map(([title, steps]) => (
          <div key={title} className="flex flex-col gap-[0.8em]">
            <span className="text-[1.1em] font-extrabold tracking-[0.1em] text-white/70">
              {title}
            </span>
            <div className="flex items-center gap-[0.8em]">
              {steps.map((step, i) => (
                <span key={step} className="contents">
                  {i > 0 && <span className="h-[0.2em] w-[2.2em] shrink-0 bg-accent" />}
                  <span
                    className={cx(
                      'flex-1 rounded-[1.2em] border p-[1.2em] text-[1.2em]',
                      step.includes('AI')
                        ? 'border-accent bg-white/10'
                        : 'border-white/15 bg-white/5',
                    )}
                  >
                    <span
                      className="mb-[0.6em] block size-[1.8em] rounded-[0.5em]"
                      style={{
                        backgroundImage: `var(--grad-area-${['www', 'auto', 'sys', 'app'][i % 4]})`,
                      }}
                    />
                    <b>{step}</b>
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-[27em] flex-col gap-[0.8em] border-l border-white/10 p-[1.8em] text-[1.1em]">
        <b className="text-[1.2em]">Dziennik</b>
        {log.map(([time, entry]) => (
          <span key={entry} className="rounded-[0.8em] bg-white/5 p-[0.8em]">
            <b className="text-accent-on-dark">{time}</b> {entry}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- phone */

function PhoneTop({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="bg-surface-dark px-[1.4em] pt-[4em] pb-[1.4em] text-white">
      <span className="font-bold opacity-80">{caption}</span>
      <b className="block text-[1.6em] leading-tight">{title}</b>
    </div>
  )
}

function SitePhone() {
  return (
    <div className="flex h-full flex-col gap-[1em]">
      <div className="flex items-center justify-between px-[1.4em] pt-[3.6em]">
        <Brand name="Twoja Firma" className="text-[1.3em]" />
        <span className="flex flex-col gap-[0.3em]">
          <span className="h-[0.2em] w-[1.6em] bg-ink" />
          <span className="h-[0.2em] w-[1.6em] bg-ink" />
          <span className="h-[0.2em] w-[1.6em] bg-ink" />
        </span>
      </div>
      <Picture area="www" className="mx-[1.2em] h-[12em]" />
      <div className="flex flex-col gap-[0.5em] px-[1.4em]">
        <b className="font-display text-[2em] leading-[1.05]">Remonty i wykończenia pod klucz</b>
        <span className="text-ink-2">Łazienki, kuchnie i poddasza.</span>
      </div>
      <div className="flex flex-col gap-[0.6em] px-[1.2em] font-extrabold">
        <span className={cx(box, 'p-[1em]')}>Łazienki</span>
        <span className={cx(box, 'p-[1em]')}>Kuchnie</span>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-[0.6em] border-t border-border p-[1.2em] text-center font-extrabold">
        <span className="rounded-[1em] border border-border p-[1em]">Zadzwoń</span>
        <span className="rounded-[1em] bg-button p-[1em] text-accent-ink">Wycena</span>
      </div>
    </div>
  )
}

function BookingPhone() {
  return (
    <div className="flex h-full flex-col gap-[1em] bg-surface-dark px-[1.2em] pt-[4.2em] text-white">
      <span className="font-bold opacity-80">Powiadomienia</span>
      <b className="font-display text-[2.6em] leading-none">Twój Pensjonat</b>
      <div className="rounded-[1.4em] bg-card p-[1.2em] text-ink">
        <span className="flex justify-between text-[0.95em] font-extrabold text-ink-2">
          <span>TWÓJ PENSJONAT</span>
          <span>teraz</span>
        </span>
        <b className="mt-[0.3em] block text-[1.1em]">Nowa rezerwacja</b>
        Pokój z widokiem · 12–15 stycznia · 2 osoby. Zaliczka opłacona online.
        <span className="mt-[0.8em] flex gap-[0.6em] text-center font-extrabold">
          <span className="flex-1 rounded-[0.8em] bg-button p-[0.6em] text-accent-ink">
            Potwierdź
          </span>
          <span className="flex-1 rounded-[0.8em] bg-chip p-[0.6em]">Szczegóły</span>
        </span>
      </div>
      <div className="rounded-[1.4em] bg-card/90 p-[1.2em] text-ink">
        <span className="flex justify-between text-[0.95em] font-extrabold text-ink-2">
          <span>TWÓJ PENSJONAT</span>
          <span>5 min</span>
        </span>
        <b className="mt-[0.3em] block text-[1.1em]">Pytanie od gościa (DE)</b>
        Czy jest parking? Przetłumaczone na polski.
      </div>
    </div>
  )
}

function PanelPhone() {
  return (
    <div className="flex h-full flex-col">
      <PhoneTop caption="Pulpit" title="Dzień dobry, Anna" />
      <div className="grid grid-cols-2 gap-[0.8em] p-[1.2em]">
        {[
          ['W toku', '14'],
          ['Na dziś', '5'],
        ].map(([caption, value]) => (
          <span key={caption} className={cx(box, 'p-[1em]')}>
            <span className="font-bold text-ink-2">{caption}</span>
            <b className="block font-display text-[2.2em]">{value}</b>
          </span>
        ))}
      </div>
      <b className="px-[1.4em] pb-[0.6em]">Dziś</b>
      <div className="flex flex-col gap-[0.6em] px-[1.2em]">
        {[
          ['8:00', 'Łazienka · Kowalscy'],
          ['11:30', 'Wycena · Wiśniewscy'],
          ['14:00', 'Odbiór · Nowakowie'],
        ].map(([time, job]) => (
          <span key={time} className={cx(box, 'flex gap-[0.8em] p-[0.9em]')}>
            <b className="text-accent-text">{time}</b>
            {job}
          </span>
        ))}
      </div>
      <div className="mt-auto flex justify-around border-t border-border p-[1.2em] font-bold text-ink-2">
        <span className="text-accent-text">Pulpit</span>
        <span>Zlecenia</span>
        <span>Klienci</span>
      </div>
    </div>
  )
}

function FieldPhone() {
  return (
    <div className="flex h-full flex-col">
      <div className="bg-button px-[1.4em] pt-[4em] pb-[1.4em] text-accent-ink">
        <span className="font-bold opacity-80">Zlecenie nr 128</span>
        <b className="block text-[1.5em]">Łazienka · Kowalscy</b>
        <span className="mt-[0.5em] inline-block rounded-full bg-white/20 px-[0.8em] py-[0.2em] font-extrabold">
          Na miejscu
        </span>
      </div>
      <div className="flex flex-col gap-[0.6em] p-[1.2em]">
        {['Demontaż starej armatury', 'Hydroizolacja', 'Płytki i fugi', 'Odbiór z klientem'].map(
          (task, i) => (
            <span key={task} className="flex items-center gap-[0.8em]">
              <span
                className={cx(
                  'size-[1.5em] shrink-0 rounded-[0.45em]',
                  i < 3 ? 'bg-accent' : 'border-2 border-ink-2',
                )}
              />
              {task}
            </span>
          ),
        )}
      </div>
      <div className="grid grid-cols-3 gap-[0.6em] px-[1.2em]">
        {['www', 'cal', 'care'].map((area) => (
          <span
            key={area}
            className="h-[4.4em] rounded-[0.8em]"
            style={{ backgroundImage: `var(--grad-area-${area})` }}
          />
        ))}
      </div>
      <div className={cx(box, 'relative mx-[1.2em] mt-[0.8em] h-[4.8em]')}>
        <svg viewBox="0 0 160 50" className="absolute inset-0 size-full text-ink">
          <path
            d="M14 34c10-16 18-18 22-6s10 10 18-6 12-8 16 4 14 6 24-10 18-2 30 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute right-[0.8em] bottom-[0.3em] text-[0.85em] text-ink-2">
          podpis klienta
        </span>
      </div>
      <span className="mx-[1.2em] mt-[0.8em] inline-flex items-center gap-[0.5em] font-extrabold">
        <span className="size-[0.7em] rounded-full bg-warn" />
        Bez zasięgu · wyśle się samo
      </span>
      <span className="mx-[1.2em] mt-auto mb-[1.2em] rounded-[1em] bg-button p-[1em] text-center font-extrabold text-accent-ink">
        Zakończ zlecenie
      </span>
    </div>
  )
}

function AssistantPhone() {
  const bubble = 'rounded-[1.3em] p-[1em]'
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-[0.8em] border-b border-border px-[1.2em] pt-[3.8em] pb-[1em]">
        <span
          className="size-[2.6em] rounded-full"
          style={{ backgroundImage: 'var(--grad-area-auto)' }}
        />
        <span>
          <b className="block text-[1.2em]">Asystent</b>
          <span className="text-ink-2">Twoja Firma</span>
        </span>
      </div>
      <div className="flex flex-col gap-[0.8em] p-[1.2em]">
        <span className={cx(bubble, 'mr-[2em] bg-chip')}>
          Dzień dobry, ile kosztuje remont łazienki 6 m²? Najlepiej w marcu.
        </span>
        <span className={cx(bubble, 'border border-accent-line bg-accent-soft')}>
          <b className="block text-[0.9em] tracking-[0.06em] text-accent-text">STRESZCZENIE AI</b>
          Remont łazienki, 6 m², termin: marzec. Klient z okolicy. Proponowana odpowiedź jest
          gotowa.
        </span>
        <span className={cx(bubble, 'ml-[2em] bg-card shadow-raised')}>
          Dzień dobry! Chętnie przygotujemy wycenę. Kiedy możemy przyjechać na pomiar?
        </span>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-[0.6em] p-[1.2em] text-center font-extrabold">
        <span className="rounded-[1em] border border-border p-[1em]">Popraw</span>
        <span className="rounded-[1em] bg-button p-[1em] text-accent-ink">Wyślij</span>
      </div>
    </div>
  )
}

const LAPTOP: Record<PreviewKind, () => ReactNode> = {
  www: SiteLaptop,
  rez: BookingLaptop,
  sys: PanelLaptop,
  app: FieldLaptop,
  auto: AutomationLaptop,
}

const PHONE: Record<PreviewKind, () => ReactNode> = {
  www: SitePhone,
  rez: BookingPhone,
  sys: PanelPhone,
  app: FieldPhone,
  auto: AssistantPhone,
}

export function PreviewLaptop({ kind }: { kind: PreviewKind }) {
  const Screen = LAPTOP[kind]
  return (
    <Laptop>
      <Screen />
    </Laptop>
  )
}

export function PreviewPhone({ kind }: { kind: PreviewKind }) {
  const Screen = PHONE[kind]
  return (
    <Phone>
      <Screen />
    </Phone>
  )
}
