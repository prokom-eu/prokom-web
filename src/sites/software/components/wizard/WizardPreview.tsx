import { cx } from '@/components/ui/cx'
import type { SoftwareWizard } from '@/lib/software/wizard'
import type { Preview } from '@/lib/software/wizardFlow'

/** Line icon drawn from SVG path data of the wizard JSON (ADR-014 rozstrz. 8). */
export function PathIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cx('size-5 shrink-0', className)}
    >
      <path d={d} />
    </svg>
  )
}

// Addresses in the browser bar of the mock-up (board `Kreator`); the site uses its brand domain.
const BAR: Record<Exclude<Preview['kind'], 'www'>, string> = {
  idle: 'twój-projekt',
  odsw: 'twojafirma.pl · przed i po',
  sys: 'panel.twojafirma.pl',
  app: 'Aplikacja · iPhone i Android',
  auto: 'Automatyzacje · działa w tle',
}

// Sample content of the mock-ups — illustration, not offer (board `Kreator`).
const KANBAN = [
  { n: 'Nowe', c: ['Łazienka · Kowalscy', 'Taras · Lis'] },
  { n: 'W drodze', c: ['Kuchnia · Nowak'] },
  { n: 'Gotowe', c: ['Dach · Wójcik'] },
]
const BARS: [string, number, string][] = [
  ['Marek', 92, 'pełny etat'],
  ['Piotr', 78, 'ekipa 2'],
  ['Anna', 60, 'biuro'],
]

const label = 'text-[11px] font-extrabold uppercase tracking-[0.12em]'

function Idle({ idle }: { idle: SoftwareWizard['ui']['idle'] }) {
  const tile = 'rounded-2xl bg-card p-3 shadow-raised motion-safe:animate-float'
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center sm:px-8">
      <div aria-hidden="true" className="grid w-full max-w-[360px] grid-cols-2 gap-3 text-left">
        <div className={tile}>
          <p className={cx(label, 'text-accent-text')}>Strona</p>
          <i className="mt-2 block h-2 w-3/4 rounded bg-accent-soft" />
          <i className="mt-2 block h-9 rounded-md bg-accent" />
          <span className="mt-2 grid grid-cols-3 gap-1.5">
            <i className="h-3 rounded bg-accent-soft" />
            <i className="h-3 rounded bg-accent-soft" />
            <i className="h-3 rounded bg-accent-soft" />
          </span>
        </div>
        <div className={cx(tile, '[animation-delay:-1.5s]')}>
          <p className={cx(label, 'text-accent-text')}>System</p>
          <span className="mt-2 grid h-[60px] grid-cols-[14px_1fr_1fr_1fr] gap-1.5">
            <i className="rounded bg-surface-dark" />
            <i className="rounded bg-accent-soft" />
            <i className="rounded bg-accent-soft" />
            <i className="rounded bg-accent-soft" />
          </span>
        </div>
        <div className={cx(tile, '[animation-delay:-3s]')}>
          <p className={cx(label, 'text-accent-text')}>Aplikacja</p>
          <span className="mx-auto mt-2 flex h-[72px] w-12 flex-col gap-1 rounded-lg border-2 border-ink p-1.5">
            <i className="h-1.5 rounded bg-accent-soft" />
            <i className="h-1.5 rounded bg-accent-soft" />
            <i className="mt-auto h-2 rounded bg-accent" />
          </span>
        </div>
        <div className={cx(tile, '[animation-delay:-4.5s]')}>
          <p className={cx(label, 'text-accent-text')}>Automatyzacja</p>
          <span className="mt-5 flex items-center justify-center gap-1.5">
            <i className="size-5 rounded-full bg-accent" />
            <i className="h-0.5 w-4 bg-accent-line" />
            <i className="size-5 rounded-full bg-accent" />
            <i className="h-0.5 w-4 bg-accent-line" />
            <i className="size-5 rounded-full bg-ok" />
          </span>
        </div>
      </div>
      <p className="mt-8 font-display text-xl font-extrabold">{idle.title}</p>
      <p className="mt-2 text-sm text-ink-2">{idle.text}</p>
      <ol className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
        {idle.steps.map((step, i) => (
          <li
            key={step}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-accent text-xs text-accent-ink">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Site({ preview }: { preview: Extract<Preview, { kind: 'www' }> }) {
  const [name, slogan, lead, cta, , cards] = preview.brand
  const has = (feature: (typeof preview.features)[number]) => preview.features.includes(feature)
  return (
    <div className="space-y-3 p-4 text-ink">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <b className="font-mock text-base">{name}</b>
        <span className="ml-auto flex gap-3 text-xs font-bold">
          {preview.navs.map((item) => (
            <i key={item} className="not-italic">
              {item}
            </i>
          ))}
        </span>
        {has('lang') && (
          <span className="flex gap-1 text-[11px] font-bold">
            <i className="rounded bg-ink px-1.5 py-0.5 not-italic text-surface">PL</i>
            <i className="rounded bg-chip px-1.5 py-0.5 not-italic">EN</i>
            <i className="rounded bg-chip px-1.5 py-0.5 not-italic">DE</i>
          </span>
        )}
        {has('login') && (
          <span className="rounded bg-chip px-2 py-0.5 text-[11px] font-bold">Zaloguj</span>
        )}
      </div>
      <div className="rounded-2xl bg-cta p-5 text-white">
        <b className="block font-mock text-sm">{slogan}</b>
        <span className="mt-1.5 block text-xs opacity-90">{lead}</span>
        <em className="mt-4 inline-block rounded-lg bg-white px-3 py-2 text-xs font-bold not-italic text-surface-dark">
          {cta}
        </em>
      </div>
      {has('booking') && (
        <div className="grid grid-cols-4 items-center gap-2 rounded-xl bg-card p-3 text-xs shadow-raised">
          {[
            ['Przyjazd', '12 sty'],
            ['Wyjazd', '15 sty'],
            ['Goście', '2 osoby'],
          ].map(([key, value]) => (
            <span key={key} className="font-bold">
              <small className={cx(label, 'block text-[9px] text-ink-2')}>{key}</small>
              {value}
            </span>
          ))}
          <em className="rounded-lg bg-accent px-2 py-2 text-center font-bold not-italic text-accent-ink">
            {cta}
          </em>
        </div>
      )}
      {has('form') && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <span className="rounded-lg border border-border bg-card px-3 py-2 text-ink-2">Imię</span>
          <span className="rounded-lg border border-border bg-card px-3 py-2 text-ink-2">
            Telefon
          </span>
          <em className="rounded-lg bg-accent px-3 py-2 text-center font-bold not-italic text-accent-ink">
            Wyślij zgłoszenie
          </em>
        </div>
      )}
      {has('map') && (
        <div className="grid grid-cols-[1fr_1fr_88px] gap-2 text-xs">
          <span className="rounded-lg bg-card p-2.5">
            <b className="block">Zadzwoń</b>123 456 789
          </span>
          <span className="rounded-lg bg-card p-2.5">
            <b className="block">Godziny</b>pn–pt 8–16
          </span>
          <i className="rounded-lg bg-accent-soft" />
        </div>
      )}
      {has('cards') && cards.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {cards.map((card) => (
            <span key={card} className="rounded-xl bg-card p-2 text-xs font-bold shadow-raised">
              <i className="mb-2 block h-14 rounded-lg bg-accent-soft" />
              {card}
            </span>
          ))}
        </div>
      )}
      {has('catalog') && (
        <div aria-hidden="true" className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className="h-10 rounded-lg bg-accent-soft" />
          ))}
        </div>
      )}
      {has('blog') && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="rounded-lg bg-card p-2.5">
            <b className="block">Poradnik</b>Jak wybrać…
          </span>
          <span className="rounded-lg bg-card p-2.5">
            <b className="block">Aktualności</b>Nowość w ofercie
          </span>
        </div>
      )}
    </div>
  )
}

function Rebuild({ issues }: { issues: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 text-xs font-bold">
      <div className="space-y-2">
        <span className={cx(label, 'inline-block rounded bg-ink px-2 py-1 text-surface')}>
          Teraz
        </span>
        <i aria-hidden="true" className="block h-8 rounded bg-chip" />
        <i aria-hidden="true" className="block h-3 rounded bg-chip" />
        {issues.map(([bad]) => (
          <span key={bad} className="block rounded-md bg-surface-2 px-2 py-1.5">
            × {bad}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        <span className={cx(label, 'inline-block rounded bg-accent px-2 py-1 text-accent-ink')}>
          Po przebudowie
        </span>
        <i aria-hidden="true" className="block h-8 rounded bg-accent" />
        <i aria-hidden="true" className="block h-3 rounded bg-accent-soft" />
        {issues.map(([, good]) => (
          <span key={good} className="block rounded-md bg-accent-soft px-2 py-1.5 text-ok-text">
            ✓ {good}
          </span>
        ))}
      </div>
    </div>
  )
}

function System({ view }: { view: SoftwareWizard['systemViews'][string] }) {
  return (
    <div className="grid min-h-[260px] grid-cols-[120px_1fr] text-xs">
      <div className="space-y-1 bg-surface-dark p-3 text-white">
        <b className="mb-3 block text-sm">Twoja Firma</b>
        {view.side.map((item, i) => (
          <span
            key={item}
            className={cx(
              'block rounded-lg px-2.5 py-2 font-bold',
              i === view.a ? 'bg-accent text-accent-ink' : 'opacity-80',
            )}
          >
            {item}
          </span>
        ))}
      </div>
      <div className="bg-surface-2 p-3">
        <b className="block font-display text-sm">{view.t}</b>
        {view.v === 'kan' && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {KANBAN.map((column) => (
              <div key={column.n} className="space-y-1.5 rounded-lg bg-chip p-2">
                <small className={cx(label, 'block text-[9px] text-ink-2')}>{column.n}</small>
                {column.c.map((card) => (
                  <span key={card} className="block rounded-md bg-card p-2 font-bold">
                    {card}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
        {view.v === 'list' && (
          <div className="mt-3 space-y-1.5">
            {(view.l ?? []).map(([a = '', b = '', status = '']) => (
              <span key={a} className="flex items-center gap-2 rounded-md bg-card px-2.5 py-2">
                <b>{a}</b>
                <small className="text-ink-2">{b}</small>
                <em className="ml-auto rounded bg-accent-soft px-1.5 py-0.5 font-bold not-italic text-accent-text">
                  {status}
                </em>
              </span>
            ))}
          </div>
        )}
        {view.v === 'bars' && (
          <div className="mt-3 space-y-2.5">
            {BARS.map(([name, width, note]) => (
              <span key={name} className="block">
                <b>{name}</b> <small className="text-ink-2">{note}</small>
                <i className="mt-1 block h-2 rounded bg-chip">
                  <i className="block h-full rounded bg-accent" style={{ width: `${width}%` }} />
                </i>
              </span>
            ))}
          </div>
        )}
        {view.v === 'xls' && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <i aria-hidden="true" className="h-16 w-20 rounded bg-accent-soft" />
            <em className="not-italic">→</em>
            {[
              ['48', 'klientów'],
              ['12', 'zleceń'],
              ['0', 'duplikatów'],
            ].map(([n, what]) => (
              <span key={what} className="rounded-lg bg-card px-3 py-2">
                <b className="block text-base">{n}</b>
                {what}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function App({ view }: { view: SoftwareWizard['preview']['appViews'][string] }) {
  return (
    <div className="flex justify-center p-5">
      <div className="w-[210px] rounded-[28px] border-4 border-ink bg-card p-3 text-xs">
        <b className="block font-display text-sm">{view.t}</b>
        <div className="mt-3 space-y-2">
          {view.l.map(([a, b]) => (
            <span key={a} className="block rounded-xl bg-surface-2 p-2.5">
              <b className="block">{a}</b>
              <small className="text-ink-2">{b}</small>
            </span>
          ))}
        </div>
        <em className="mt-4 block rounded-xl bg-accent py-2.5 text-center font-bold not-italic text-accent-ink">
          {view.b}
        </em>
      </div>
    </div>
  )
}

function Automation({ actions }: { actions: string[] }) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 text-sm">
      <span className="rounded-full bg-ink px-4 py-2 font-bold text-surface">
        Nowe zlecenie albo koniec dnia
      </span>
      <div className="w-[86%] space-y-2">
        {actions.map((action) => (
          <span
            key={action}
            className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 font-bold shadow-raised"
          >
            <i className="not-italic text-ok-text">✓</i>
            {action}
          </span>
        ))}
      </div>
      <small className="text-ink-2">Bez klikania. Także w nocy i w weekend.</small>
    </div>
  )
}

/**
 * Live preview of the wizard (spec. §6.3): a browser frame whose content follows the answers —
 * built from `previewOf`, so the rules stay in the JSON. Purely visual: hidden from screen
 * readers except the address bar, which names what is shown.
 */
export function WizardPreview({
  preview,
  idle,
}: {
  preview: Preview
  idle: SoftwareWizard['ui']['idle']
}) {
  const bar = preview.kind === 'www' ? preview.brand[4] : BAR[preview.kind]
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-border bg-stage shadow-raised">
      <div className="flex items-center gap-1.5 bg-surface-dark px-4 py-2.5">
        <i aria-hidden="true" className="size-2.5 rounded-full bg-white/30" />
        <i aria-hidden="true" className="size-2.5 rounded-full bg-white/30" />
        <i aria-hidden="true" className="size-2.5 rounded-full bg-white/30" />
        <span className="ml-3 min-w-0 flex-1 truncate rounded-full bg-white/10 px-4 py-1 text-xs font-bold text-white">
          {bar}
        </span>
      </div>
      <div aria-hidden="true" className="bg-dots flex-1">
        {preview.kind === 'idle' && <Idle idle={idle} />}
        {preview.kind === 'www' && <Site preview={preview} />}
        {preview.kind === 'odsw' && <Rebuild issues={preview.issues} />}
        {preview.kind === 'sys' && <System view={preview.view} />}
        {preview.kind === 'app' && <App view={preview.view} />}
        {preview.kind === 'auto' && <Automation actions={preview.actions} />}
      </div>
    </div>
  )
}
