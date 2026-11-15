/**
 * INST-6 PR4: the twelve „Dla kogo” pages, the architects' page and the line's other pages — the
 * package's texts → new wording (exact texts after `withoutLaw()`). One module per page.
 */
import { DOM } from './obiekty/dom'
import { APT } from './obiekty/apt'
import { PENS } from './obiekty/pens'
import { HOTEL } from './obiekty/hotel'
import { REST } from './obiekty/rest'
import { SKLEP } from './obiekty/sklep'
import { FIRMA } from './obiekty/firma'
import { KOSC } from './obiekty/kosc'
import { SZK } from './obiekty/szk'
import { GMINA } from './obiekty/gmina'
import { DEV } from './obiekty/dev'
import { BUD } from './obiekty/bud'
import { ARCHITEKCI } from './obiekty/architekci'
import { STRONY } from './obiekty/strony'

/** One dictionary per page; a text may sit in one of them only (test). */
export const OBIEKTY_MODULES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  dom: DOM,
  apt: APT,
  pens: PENS,
  hotel: HOTEL,
  rest: REST,
  sklep: SKLEP,
  firma: FIRMA,
  kosc: KOSC,
  szk: SZK,
  gmina: GMINA,
  dev: DEV,
  bud: BUD,
  architekci: ARCHITEKCI,
  strony: STRONY,
}
