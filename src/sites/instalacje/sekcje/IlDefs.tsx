import type { CSSProperties } from 'react'

const c = (token: string): CSSProperties => ({ stopColor: `var(--${token})` })

/**
 * Shared gradients, patterns and filters of the prototype's illustrations (`zrodlo/header.html`
 * → `.pkdefs`), drawn once per service page so the ported rules (`fill: url(#gWood)`,
 * `filter: url(#fSh)` …) work unchanged. Colours from tokens (`--inst-scene-*`, `--il-*`,
 * `--sx-*` under `data-inst-il` / `data-inst-sx` on the page). `gDarkUi` is ours: the prototype
 * paints `.syb` white in the light theme (`.pk[data-theme=light] .syb`), so its stops follow the
 * colour scheme.
 */
export function IlDefs() {
  return (
    <svg
      className="pkdefs"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', overflow: 'hidden' }}
    >
      <defs>
        <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c('inst-scene-wood-1')} />
          <stop offset="1" style={c('inst-scene-wood-2')} />
        </linearGradient>
        <linearGradient id="gWoodL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={c('il-g-wood-l1')} />
          <stop offset=".5" style={c('il-g-wood-l2')} />
          <stop offset="1" style={c('inst-il-kdoor-kpn-line')} />
        </linearGradient>
        <linearGradient id="gRoof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c('inst-scene-roof-1')} />
          <stop offset="1" style={c('inst-scene-roof-2')} />
        </linearGradient>
        <linearGradient id="gWallD" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c('il-g-wall-d1')} />
          <stop offset="1" style={c('il-g-wall-d2')} />
        </linearGradient>
        <linearGradient id="gWallL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c('il-g-wall-l1')} />
          <stop offset="1" style={c('il-g-wall-l2')} />
        </linearGradient>
        <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={c('il-g-glass-1')} />
          <stop offset=".55" style={c('il-g-glass-2')} />
          <stop offset="1" style={c('il-g-glass-3')} />
        </linearGradient>
        <linearGradient id="gLit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c('inst-scene-lit-1')} />
          <stop offset="1" style={c('inst-scene-lit-2')} />
        </linearGradient>
        <linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={c('inst-scene-metal-1')} />
          <stop offset=".6" style={c('inst-scene-metal-2')} />
          <stop offset="1" style={c('inst-scene-metal-3')} />
        </linearGradient>
        <linearGradient id="gDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c('il-g-dark-1')} />
          <stop offset="1" style={c('il-g-dark-2')} />
        </linearGradient>
        <linearGradient id="gDarkUi" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0"
            style={{ stopColor: 'light-dark(var(--inst-plan-white), var(--il-g-dark-1))' }}
          />
          <stop
            offset="1"
            style={{ stopColor: 'light-dark(var(--inst-plan-white), var(--il-g-dark-2))' }}
          />
        </linearGradient>
        <linearGradient id="gAcc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={c('inst-scene-acc-1')} />
          <stop offset="1" style={c('inst-scene-acc-2')} />
        </linearGradient>
        <linearGradient id="gCar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c('inst-plan-white')} />
          <stop offset="1" style={c('il-g-car-2')} />
        </linearGradient>
        <radialGradient id="gPool" cx=".5" cy=".5" r=".5">
          <stop offset="0" style={c('il-lit')} stopOpacity=".55" />
          <stop offset="1" style={c('il-lit')} stopOpacity="0" />
        </radialGradient>
        <pattern id="pFloor" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" style={{ fill: 'var(--sx-tile)' }} />
          <path
            d="M0 11H22M11 0V11M0 22V11"
            style={{ stroke: 'var(--il-g-floor-line)' }}
            strokeWidth="1"
          />
        </pattern>
        <pattern id="pFloorL" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" style={{ fill: 'var(--il-g-floor-l)' }} />
          <path
            d="M0 11H22M11 0V11M0 22V11"
            style={{ stroke: 'var(--il-g-floor-l-line)' }}
            strokeWidth="1"
          />
        </pattern>
        <pattern id="pPlank" width="80" height="14" patternUnits="userSpaceOnUse">
          <rect width="80" height="14" style={{ fill: 'var(--il-g-plank)' }} />
          <path
            d="M0 13.5H80M40 0V14"
            style={{ stroke: 'var(--il-g-plank-line)' }}
            strokeWidth="1"
          />
        </pattern>
        <filter id="fSh" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="5"
            floodOpacity=".35"
            style={{ floodColor: 'var(--inst-mask)' }}
          />
        </filter>
        <filter id="fGl" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
