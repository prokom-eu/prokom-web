import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/brand/contrast'
import { DARK_THEME_LINES } from '@/lib/brand/theme'
import { LINE_VALUES, type Line } from '@/lib/tenant/lines'

import { darkMediaBlock, findRule, resolve, rule, type Declarations } from './parse-tokens'

// ADR-013: neutral colours per line, a dark theme only for lines designed for it.
type Mode = 'light' | 'dark'

const root = rule(':root')
const darkSelector = (line: Line) => `[data-line='${line}'][data-theme='dark']`
const mediaSelector = (line: Line) => `[data-line='${line}']:not([data-theme='light'])`

/** Every custom property as the browser sees it on `<html>` for a line and theme. */
function scope(line: Line, mode: Mode): Declarations {
  return {
    ...root,
    ...rule(`[data-line='${line}']`),
    ...(mode === 'dark' ? rule(darkSelector(line)) : {}),
  }
}

function hex(token: string, s: Declarations): string {
  const value = resolve(`var(${token})`, s)
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${token} is not #rrggbb: ${value}`)
  return value
}

/** `color-mix(in srgb, top share, bottom)` of two `#rrggbb` colours — a Tailwind `/16` tint. */
function mix(top: string, bottom: string, share: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2]
    .map((i) =>
      Math.round(channel(top, i) * share + channel(bottom, i) * (1 - share))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

const TEXT_ON_SURFACES: Array<[string, string[]]> = [
  ['--ink', ['--surface', '--surface-2', '--surface-3', '--card']],
  ['--ink-2', ['--surface', '--surface-2', '--surface-3', '--card']],
  // ADR-013: the third ink only on the main surface and cards (light Biznes: 4.21 on surface-2).
  ['--ink-3', ['--surface', '--card']],
  // ADR-013: small accent text not on surface-3 (dark Biznes: 4.28).
  ['--accent-text', ['--surface', '--surface-2', '--card']],
  // Small green labels ("partner", "0 zł") of the Biznes header.
  ['--ok-text', ['--surface', '--surface-2', '--card']],
  // Accent part of the plain H1 (Biznes hero, v20) — large text, but kept at 4.5:1.
  ['--h1-accent', ['--surface', '--surface-2']],
]

const cases = LINE_VALUES.flatMap((line) =>
  (DARK_THEME_LINES.includes(line) ? (['light', 'dark'] as const) : (['light'] as const)).map(
    (mode) => ({ line, mode }),
  ),
)

describe.each(cases)('$line, $mode theme', ({ line, mode }) => {
  const s = scope(line, mode)

  it.each(TEXT_ON_SURFACES)('%s reaches 4.5:1 on its surfaces', (text, surfaces) => {
    for (const surface of surfaces) {
      expect(
        contrastRatio(hex(text, s), hex(surface, s)),
        `${text} on ${surface}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('button label reaches 4.5:1 on the button', () => {
    expect(contrastRatio(hex('--accent-ink', s), hex('--accent-text', s))).toBeGreaterThanOrEqual(
      4.5,
    )
    expect(contrastRatio(hex('--accent-ink', s), hex('--button-bg', s))).toBeGreaterThanOrEqual(4.5)
  })

  it('text and links reach 4.5:1 on dark blocks', () => {
    expect(contrastRatio(hex('--c-white', s), hex('--surface-dark', s))).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(hex('--accent-on-dark', s), hex('--surface-dark', s)),
    ).toBeGreaterThanOrEqual(4.5)
  })

  // WCAG 1.4.11: status dots (open / closed, partner) carry meaning next to their text.
  it('status dots reach 3:1 on the surfaces they sit on', () => {
    for (const dot of ['--ok', '--warn']) {
      for (const surface of ['--surface', '--surface-2', '--card']) {
        expect(
          contrastRatio(hex(dot, s), hex(surface, s)),
          `${dot} on ${surface}`,
        ).toBeGreaterThanOrEqual(3)
      }
    }
  })

  // Badges and the inquiry switch of the Biznes catalog cards (`ProductCard`): small bold labels, 4.5:1.
  // `--surface` on `--ok-text` is also „Polecamy” of the Software offer window (SWR3).
  it('card badge labels reach 4.5:1 on their badges', () => {
    const pairs: [string, string][] = [
      ['--surface', '--ok-text'],
      ['--promo-ink', '--promo'],
      ['--surface', '--ink'],
      ['--accent-ink', '--accent-text'],
    ]
    for (const [text, badge] of pairs) {
      expect(
        contrastRatio(hex(text, s), hex(badge, s)),
        `${text} on ${badge}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  // WCAG 1.4.11: a form field must be visible against the field and what surrounds it.
  // `--border` (~1.25:1) is decorative only (ADR-013 point 5).
  it('form field border reaches 3:1 on every surface', () => {
    for (const surface of ['--surface', '--surface-2', '--surface-3', '--card']) {
      expect(
        contrastRatio(hex('--border-input', s), hex(surface, s)),
        `--border-input on ${surface}`,
      ).toBeGreaterThanOrEqual(3)
    }
  })

  it('accent reaches 3:1 on the surface (large elements)', () => {
    expect(contrastRatio(hex('--accent', s), hex('--surface', s))).toBeGreaterThanOrEqual(3)
  })

  // ADR-013: the second accent ends the H1 gradient — large text, so 3:1.
  it('second accent reaches 3:1 on the surface (H1 gradient)', () => {
    expect(contrastRatio(hex('--accent-2', s), hex('--surface', s))).toBeGreaterThanOrEqual(3)
  })
})

// Pairs used only by Biznes components. Software shows `--ok` and `--warn` as dots only
// (docs/design/prokomsoftware/README.md, „Kontrast”), so its light values do not need 4.5:1 here.
describe.each(cases.filter(({ line }) => line === 'biznes'))(
  'Biznes components, $mode theme',
  ({ line, mode }) => {
    const s = scope(line, mode)

    it('green partner labels of the footer reach 4.5:1 on the dark block', () => {
      expect(contrastRatio(hex('--ok', s), hex('--surface-dark', s))).toBeGreaterThanOrEqual(4.5)
    })

    it('„W zapytaniu” label (remove on hover) reaches 4.5:1 on its badge', () => {
      expect(contrastRatio(hex('--warn', s), hex('--surface-2', s))).toBeGreaterThanOrEqual(4.5)
    })

    it('orange label of the downtime calculator reaches 4.5:1 on its card', () => {
      expect(contrastRatio(hex('--warn', s), hex('--card', s))).toBeGreaterThanOrEqual(4.5)
    })

    it('the no-photo note reaches 4.5:1 on every studio stop (K31-ZMIANY §4.10)', () => {
      for (const stop of ['--st1', '--st2', '--st3']) {
        expect(
          contrastRatio(hex('--ink-2', s), hex(stop, s)),
          `--ink-2 on ${stop}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    })
  },
)

// ADR-015 and the contrast table of docs/design/prokomsoftware/README.md: text on the second card
// level, active chips and preview stages; the button label on the accent button.
describe.each(cases.filter(({ line }) => line === 'software'))(
  'Software surfaces, $mode theme',
  ({ line, mode }) => {
    const s = scope(line, mode)
    const panels = ['--card-2', '--accent-soft', '--stage', '--chip']

    it.each(['--ink', '--ink-soft', '--ink-2', '--accent-text', '--ok-text'])(
      '%s reaches 4.5:1 on panels, chips and stages',
      (text) => {
        for (const surface of panels) {
          expect(
            contrastRatio(hex(text, s), hex(surface, s)),
            `${text} on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5)
        }
      },
    )

    it('button label reaches 4.5:1 on the accent button', () => {
      expect(contrastRatio(hex('--accent-ink', s), hex('--accent', s))).toBeGreaterThanOrEqual(4.5)
    })

    // ADR-015 point 9: status dots also sit on fields, preview stages and active chips.
    it('status dots reach 3:1 on fields, stages and active chips', () => {
      for (const dot of ['--ok', '--warn']) {
        for (const surface of ['--surface-3', '--stage', '--accent-soft']) {
          expect(
            contrastRatio(hex(dot, s), hex(surface, s)),
            `${dot} on ${surface}`,
          ).toBeGreaterThanOrEqual(3)
        }
      }
    })

    it('form field border reaches 3:1 on the second card level', () => {
      expect(contrastRatio(hex('--border-input', s), hex('--card-2', s))).toBeGreaterThanOrEqual(3)
    })

    // ADR-015 v20 pkt 4: the „Twój projekt” pill is inverted (--ink background, --surface
    // text); its „Zobacz →” accent is the other theme's text accent.
    it('pill text and accent reach 4.5:1 on the inverted pill', () => {
      for (const text of ['--surface', '--pill-accent']) {
        expect(
          contrastRatio(hex(text, s), hex('--ink', s)),
          `${text} on --ink`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    })

    // ADR-015 v20 pkt 3: the Kreator button of the bottom bar and the „Dobierz rozwiązanie” card
    // use the gradient --accent → --accent-2 with --accent-ink on it — both ends must hold.
    it('label on the accent gradient reaches 4.5:1 at both ends', () => {
      for (const end of ['--accent', '--accent-2']) {
        expect(
          contrastRatio(hex('--accent-ink', s), hex(end, s)),
          `--accent-ink on ${end}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    })
  },
)

// ADR-I003 §3: the Instalacje visualisation uses the second card level and active chips like
// Software, and puts button labels on --accent.
describe.each(cases.filter(({ line }) => line === 'instalacje'))(
  'Instalacje surfaces, $mode theme',
  ({ line, mode }) => {
    const s = scope(line, mode)

    it.each(['--ink', '--ink-soft', '--ink-2', '--accent-text'])(
      '%s reaches 4.5:1 on the second card level and active chips',
      (text) => {
        for (const surface of ['--card-2', '--accent-soft']) {
          expect(
            contrastRatio(hex(text, s), hex(surface, s)),
            `${text} on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5)
        }
      },
    )

    it('button label reaches 4.5:1 on the accent button', () => {
      expect(contrastRatio(hex('--accent-ink', s), hex('--accent', s))).toBeGreaterThanOrEqual(4.5)
    })

    it('form field border reaches 3:1 on the second card level', () => {
      expect(contrastRatio(hex('--border-input', s), hex('--card-2', s))).toBeGreaterThanOrEqual(3)
    })
  },
)

// ADR-015 v20 pkt 5: the „Czasem powiemy: nie budujcie” block keeps the light palette's
// gradient in both themes, with a white label.
it('Software: white on the „Czasem powiemy” gradient reaches 4.5:1 at both ends', () => {
  const s = scope('software', 'light')
  for (const end of ['--c-software-light-accent-text', '--c-software-light-accent']) {
    expect(
      contrastRatio(hex('--c-white', s), hex(end, s)),
      `white on ${end}`,
    ).toBeGreaterThanOrEqual(4.5)
  }
})

// ADR-015 v22 pkt 1, 7: the dark footer of Software (SWR2) — texts on `--footer-bg`, the line
// colours of „Jedna firma, sześć adresów” as rules (3:1), white on the CTA button's gradient.
describe.each(cases.filter(({ line }) => line === 'software'))(
  'Software dark footer, $mode theme',
  ({ line, mode }) => {
    const s = scope(line, mode)

    it.each([
      '--footer-text',
      '--footer-muted',
      '--footer-eyebrow',
      '--footer-ok',
      '--accent-on-dark',
    ])('%s reaches 4.5:1 on the footer', (text) => {
      expect(contrastRatio(hex(text, s), hex('--footer-bg', s))).toBeGreaterThanOrEqual(4.5)
    })

    it.each(['prokom', 'biznes', 'instalacje', 'software', 'tech', 'zakopane'])(
      'line colour %s reaches 3:1 on the footer (rules and marks)',
      (key) => {
        expect(
          contrastRatio(hex(`--c-${key}-on-dark`, s), hex('--footer-bg', s)),
        ).toBeGreaterThanOrEqual(3)
      },
    )

    // Ticks and the „0 zł” badge sit on `bg-footer-ok/16` — the green mixed 16% into the footer.
    it('green badge text reaches 4.5:1 on its own tinted background', () => {
      const badge = mix(hex('--footer-ok', s), hex('--footer-bg', s), 0.16)
      expect(contrastRatio(hex('--footer-ok', s), badge)).toBeGreaterThanOrEqual(4.5)
    })

    // The current line's card („Software”) is tinted `bg-accent-on-dark/16`; its texts stay AA.
    it.each(['--footer-text', '--footer-muted'])(
      '%s reaches 4.5:1 on the current line card',
      (text) => {
        const card = mix(hex('--accent-on-dark', s), hex('--footer-bg', s), 0.16)
        expect(contrastRatio(hex(text, s), card)).toBeGreaterThanOrEqual(4.5)
      },
    )

    it('white on the CTA button gradient reaches 4.5:1 at both ends', () => {
      for (const end of ['--c-software-light-accent-text', '--c-software-light-accent']) {
        expect(
          contrastRatio(hex('--c-white', s), hex(end, s)),
          `white on ${end}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    })
  },
)

describe('dark theme definitions', () => {
  it.each([...LINE_VALUES])('%s: dark rules exist only for lines with a dark design', (line) => {
    const media = darkMediaBlock()
    const expected = DARK_THEME_LINES.includes(line)
    expect(findRule(darkSelector(line)) !== null).toBe(expected)
    expect(findRule(mediaSelector(line), media) !== null).toBe(expected)
  })

  it.each([...DARK_THEME_LINES])(
    '%s: the system preference gives the same values as an explicit choice',
    (line) => {
      expect(rule(mediaSelector(line), darkMediaBlock())).toEqual(rule(darkSelector(line)))
    },
  )
})

// Tags of the Biznes need tiles ("73 dni", "0 zł przegląd"): white text on the tile colour.
describe('Biznes need tile tags', () => {
  const s = scope('biznes', 'light')
  it.each(['--tone-green-tag', '--tone-red-tag', '--tone-blue-tag', '--tone-violet-tag'])(
    'white reaches 4.5:1 on %s',
    (tone) => {
      expect(contrastRatio(hex('--c-white', s), hex(tone, s))).toBeGreaterThanOrEqual(4.5)
    },
  )
})

// Wizard card of the Biznes home page: white text and the green label on dark green, navy step
// numbers on the green dots — in both themes.
describe.each(['light', 'dark'] as const)('Biznes wizard card, %s theme', (mode) => {
  const s = scope('biznes', mode)
  it.each(['--c-white', '--tone-green-2'])('%s reaches 4.5:1 on --wizard', (text) => {
    expect(contrastRatio(hex(text, s), hex('--wizard', s))).toBeGreaterThanOrEqual(4.5)
  })
  it('step numbers reach 4.5:1 on the green dot', () => {
    expect(contrastRatio(hex('--surface-dark', s), hex('--ok', s))).toBeGreaterThanOrEqual(4.5)
  })
})
