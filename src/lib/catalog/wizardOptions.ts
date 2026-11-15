// Plain constants of Konfigurator 3.0: client code (engine, menu, search) reads them without the
// zod schema of `wizard.ts` (ADR-023: zod stays out of the shared route entry).

/** Scales of the board: 1 stanowisko, 2–3, 4–10, ponad 10 — the engine's rules read them. */
export const WIZARD_SCALES = ['1', '2', '4', '10'] as const
export type WizardScale = (typeof WIZARD_SCALES)[number]

/** Situations the engine knows (K35 §1.2 pkt 1 — `etap`). */
export const WIZARD_STAGES = ['nowa', 'wymiana', 'awaria', 'ksef'] as const
export type WizardStage = (typeof WIZARD_STAGES)[number]

/** Needs the engine adds by itself (situation, scale) — they must be in the list of needs. */
export const ENGINE_NEEDS = ['ksef', 'opieka', 'plat', 'kopie', 'ups'] as const

/** Where a result link of a need leads (`l` of the board): a brand, a page, the offer. */
export const WIZARD_LINK_KINDS = [
  'marka',
  'gopos',
  'insert',
  'oferta',
  'vending',
  'opieka',
] as const
export type WizardLinkKind = (typeof WIZARD_LINK_KINDS)[number]
