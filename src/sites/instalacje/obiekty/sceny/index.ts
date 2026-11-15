import type { BuiltObjectKey } from '../../dane/obiekty'
import { SCENE_APT } from './apt'
import { SCENE_BUD } from './bud'
import { SCENE_DEV } from './dev'
import { SCENE_DOM } from './dom'
import { SCENE_FIRMA } from './firma'
import { SCENE_GMINA } from './gmina'
import { SCENE_HOTEL } from './hotel'
import { SCENE_KOSC } from './kosc'
import { SCENE_PENS } from './pens'
import { SCENE_REST } from './rest'
import { SCENE_SKLEP } from './sklep'
import { SCENE_SZK } from './szk'

/** Cross-sections of the object pages (`sceny/<key>.ts`), rendered on the server only. */
export const OBJECT_SCENE_ART: Record<BuiltObjectKey, { viewBox: string; html: string }> = {
  pens: SCENE_PENS,
  dom: SCENE_DOM,
  apt: SCENE_APT,
  hotel: SCENE_HOTEL,
  rest: SCENE_REST,
  sklep: SCENE_SKLEP,
  firma: SCENE_FIRMA,
  kosc: SCENE_KOSC,
  szk: SCENE_SZK,
  gmina: SCENE_GMINA,
  dev: SCENE_DEV,
  bud: SCENE_BUD,
}
