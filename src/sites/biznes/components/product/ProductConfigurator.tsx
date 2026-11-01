'use client'

import { cx } from '@/components/ui/cx'
import {
  ADVISE,
  EMPTY_STATE,
  chosenValues,
  togglePreset,
  toggleValue,
  type Configurator,
} from '@/lib/catalog/configurator'

import { ProductAddButton } from './ProductAddButton'
import { useProductConfig } from './ProductConfig'
import { ProductSection } from './ProductSection'
import { CONFIGURATOR_ID } from './ProductVersionPicker'

const STEPS = [
  'Zacznij od gotowej konfiguracji albo wybieraj po kolei',
  'Czego nie wiesz — kliknij „Doradźcie”',
  'Dodaj do zapytania — wycenę dostaniesz na piśmie',
]

const CHIP =
  'inline-flex min-h-11 items-center rounded-full px-4 text-[0.95rem] font-bold transition-[box-shadow,background-color]'
const ROW =
  'flex min-h-11 w-full items-center rounded-2xl px-4 py-2.5 text-left text-[0.95rem] font-bold transition-[box-shadow,background-color]'
const ON = 'bg-ink text-surface shadow-none'
const OFF =
  'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]'
const ADVISE_OFF =
  'bg-transparent text-ink-2 outline-1 -outline-offset-1 outline-dashed outline-border hover:text-ink hover:outline-ink-3'

/**
 * „Wybierz wersję” — configurator 2.0 (K31-ZMIANY §13.7): three steps, ready configurations
 * that fill the matching options, every option numbered with one plain sentence, „Doradźcie”,
 * long values as rows, „W każdej wersji” and a sticky summary „Wybrano X z N”. Not a cart.
 */
export function ProductConfigurator({ config }: { config: Configurator }) {
  const { state, setState, colors } = useProductConfig()
  // With colour dots in the hero (K32 §9) the configurator's own „Kolor” is not offered twice.
  const hidden = (name: string) => colors.length > 0 && /^kolor/i.test(name.trim())
  const chosen = chosenValues(config, state).filter(({ name }) => !hidden(name)).length
  const total = config.options.filter(({ name }) => !hidden(name)).length
  const lead = [config.description, 'Nie musisz znać wszystkich parametrów.']
    .filter(Boolean)
    .join(' ')

  return (
    <ProductSection
      id={CONFIGURATOR_ID}
      eyebrow="Konfigurator"
      heading="Wybierz wersję"
      lead={lead}
      aside="bez cen i bez zobowiązań"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-7">
        <div className="flex min-w-0 flex-col gap-7">
          <ol className="grid gap-2.5 sm:grid-cols-3">
            {STEPS.map((step, position) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-[18px] bg-surface-2 px-4 py-3.5 text-sm font-bold text-ink"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-text text-xs text-accent-ink">
                  {position + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {config.presets.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase">
                Gotowe konfiguracje — najczęściej wybierane
              </h3>
              <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                {config.presets.map((preset, position) => {
                  const on = state.preset === position
                  return (
                    <li key={preset.name} className="flex">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setState(togglePreset(config, state, position))}
                        className={cx(
                          'flex w-full flex-col gap-2 rounded-[20px] p-4 text-left transition-shadow sm:p-5',
                          on
                            ? 'bg-accent-soft shadow-[inset_0_0_0_2px_var(--accent-text)]'
                            : 'bg-card shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                        )}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="text-[1.05rem] font-extrabold text-ink">
                            {preset.name}
                          </span>
                          <span
                            className={cx(
                              'shrink-0 text-xs font-extrabold',
                              on ? 'text-ok-text' : 'text-accent-text',
                            )}
                          >
                            {on ? '✓ wybrana' : 'wybierz'}
                          </span>
                        </span>
                        <span className="text-sm leading-relaxed text-ink-2">
                          {preset.configuration}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <ol className="flex flex-col">
            {config.options.map((option, index) => {
              if (hidden(option.name)) return null
              const value = state.selection[index]
              const labelId = `opcja-${index}`
              const status = !value ? 'do wyboru' : value === ADVISE ? 'doradźcie' : '✓ wybrano'
              return (
                <li
                  key={option.name}
                  className="flex flex-col gap-3 border-b border-border py-6 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      id={labelId}
                      className="flex items-center gap-3 text-[1.08rem] font-extrabold text-ink"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs text-ink-2">
                        {index + 1}
                      </span>
                      {option.name}
                    </h3>
                    <span
                      className={cx(
                        'shrink-0 pt-1 text-sm font-extrabold',
                        value && value !== ADVISE ? 'text-ok-text' : 'text-accent-text',
                      )}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 sm:pl-10">
                    {option.help && (
                      <p className="text-sm leading-relaxed text-ink-2">{option.help}</p>
                    )}
                    <div
                      role="group"
                      aria-labelledby={labelId}
                      className={cx(option.rows ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2')}
                    >
                      {option.values.map((item) => (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={value === item}
                          onClick={() => setState(toggleValue(state, index, item))}
                          className={cx(option.rows ? ROW : CHIP, value === item ? ON : OFF)}
                        >
                          {item}
                        </button>
                      ))}
                      <button
                        type="button"
                        aria-pressed={value === ADVISE}
                        onClick={() => setState(toggleValue(state, index, ADVISE))}
                        className={cx(CHIP, 'self-start', value === ADVISE ? ON : ADVISE_OFF)}
                      >
                        Doradźcie
                      </button>
                    </div>
                    {option.note && (
                      <p className="text-sm leading-relaxed text-ink-2">
                        <b className="font-extrabold text-ink">Podpowiedź:</b> {option.note}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          {config.standard.length > 0 && (
            <div className="rounded-[18px] bg-surface-2 px-5 py-4 text-sm leading-relaxed text-ink-2">
              <b className="font-extrabold text-ink">W każdej wersji: </b>
              {config.standard.map((row) => `${row.name}: ${row.value}`).join(' · ')}
            </div>
          )}
        </div>

        <aside
          aria-label="Twoja konfiguracja"
          data-surface="dark"
          className="flex flex-col gap-5 rounded-[28px] bg-surface-dark p-6 text-white ring-1 ring-white/10 ring-inset lg:sticky lg:top-40"
        >
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-[1.4rem] font-extrabold font-stretch-106%">
              Twoja konfiguracja
            </h3>
            <div
              role="progressbar"
              aria-label="Wybrane opcje"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={chosen}
              className="h-1.5 overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="h-full rounded-full bg-accent-on-dark transition-[width]"
                style={{ width: `${total ? (chosen / total) * 100 : 0}%` }}
              />
            </div>
            <p aria-live="polite" className="text-sm font-bold text-white/80">
              Wybrano {chosen} z {total} · resztę możemy dobrać za Ciebie
            </p>
          </div>
          <dl className="flex flex-col divide-y divide-white/10 text-[0.95rem]">
            {state.preset !== null && config.presets[state.preset] && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-white/75">Gotowa konfiguracja</dt>
                <dd className="text-right font-extrabold">{config.presets[state.preset]!.name}</dd>
              </div>
            )}
            {config.options.map((option, index) => {
              if (hidden(option.name)) return null
              const value = state.selection[index]
              return (
                <div key={option.name} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-white/75">{option.name}</dt>
                  <dd
                    className={cx(
                      'min-w-0 text-right',
                      value && value !== ADVISE ? 'font-extrabold' : 'text-white/60',
                    )}
                  >
                    {!value ? 'do wyboru' : value === ADVISE ? 'doradźcie' : value}
                  </dd>
                </div>
              )
            })}
          </dl>
          <div className="flex flex-col items-center gap-3">
            <ProductAddButton variant="light" className="w-full" />
            <button
              type="button"
              onClick={() => setState(EMPTY_STATE)}
              className="min-h-11 text-sm font-extrabold text-white underline underline-offset-4 hover:text-accent-on-dark"
            >
              Wyczyść wybór
            </button>
          </div>
          <p className="text-[0.82rem] leading-relaxed text-white/70">
            Wybrana wersja trafi do zapytania jako notatka. Gdy coś zostawisz do doradzenia —
            dobierzemy to do Twojej pracy i wpiszemy w ofercie.
          </p>
        </aside>
      </div>
    </ProductSection>
  )
}
