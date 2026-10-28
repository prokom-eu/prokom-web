'use client'

import { cx } from '@/components/ui/cx'
import { chosenValues, versionSelection } from '@/lib/catalog/configurator'
import { variantSlug } from '@/lib/catalog/productName'

import { useProductConfig, VERSION_PARAM } from './ProductConfig'

/** Id of the configurator section („Wybierz wersję”). */
export const CONFIGURATOR_ID = 'wybierz-wersje'

/** Up to 4 chosen options in „Twoja wersja” of the hero (K31-ZMIANY §4 pkt 1). */
const YOUR_VERSION_ROWS = 4

function scrollToConfigurator() {
  document.getElementById(CONFIGURATOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * „W tej karcie” of a card with many models (K31-ZMIANY §13.5): each model picks its version in
 * the configurator and puts `?wersja=` in the address, without reloading the page.
 */
export function VersionChips() {
  const { config, variants, state, setState } = useProductConfig()
  if (variants.length < 2) return null
  const current = config ? Object.values(state.selection) : []
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-extrabold tracking-[0.1em] text-ink-3 uppercase">
        W tej karcie
      </span>
      {variants.map((variant) => {
        const slug = variantSlug(variant)
        const model = config
          ? Object.values(versionSelection(config, variants, slug).selection)
          : []
        const picked = model.some((value) => current.includes(value))
        return (
          <button
            key={variant}
            type="button"
            aria-pressed={Boolean(picked)}
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set(VERSION_PARAM, slug)
              window.history.replaceState(null, '', url)
              if (config) {
                setState(versionSelection(config, variants, slug))
                scrollToConfigurator()
              }
            }}
            className={cx(
              'min-h-9 rounded-xl px-2.5 text-sm font-bold transition-shadow',
              picked
                ? 'bg-accent-soft text-accent-text shadow-[inset_0_0_0_1.5px_var(--accent-text)]'
                : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
            )}
          >
            {variant}
          </button>
        )
      })}
    </div>
  )
}

/**
 * „Twoja wersja” in the hero: up to 4 chosen options and „Zmień wersję”; before any choice the
 * card's benefit stands there instead (K31-ZMIANY §4 pkt 1).
 */
export function YourVersion({ benefit }: { benefit: string | null }) {
  const { config, state } = useProductConfig()
  const rows = config ? chosenValues(config, state).slice(0, YOUR_VERSION_ROWS) : []
  const preset = config && state.preset !== null ? config.presets[state.preset] : null
  if (rows.length === 0) {
    return benefit ? <p className="leading-relaxed text-ink-2">{benefit}</p> : null
  }
  return (
    <div className="rounded-[20px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-extrabold text-ink">
          Twoja wersja{preset && <span className="font-bold text-ink-2"> · {preset.name}</span>}
        </p>
        <button
          type="button"
          onClick={scrollToConfigurator}
          className="min-h-9 text-sm font-extrabold text-accent-text hover:underline"
        >
          Zmień wersję ↓
        </button>
      </div>
      <dl className="mt-1">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex justify-between gap-4 border-t border-dashed border-border py-2 text-sm first:border-t-0"
          >
            <dt className="text-ink-2">{row.name}</dt>
            <dd className="text-right font-bold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
