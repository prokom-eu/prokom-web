/**
 * INST-6 PR3: the ten service pages and `/uslugi` — the package's texts → new wording (exact
 * texts after `withoutLaw()`). One module per service, merged here.
 */
import { ALARM } from './uslugi/alarm'
import { ANT } from './uslugi/ant'
import { EV } from './uslugi/ev'
import { KAM } from './uslugi/kam'
import { KD } from './uslugi/kd'
import { OFERTA } from './uslugi/oferta'
import { SCR } from './uslugi/scr'
import { SMART } from './uslugi/smart'
import { SND } from './uslugi/snd'
import { TEL } from './uslugi/tel'
import { WIFI } from './uslugi/wifi'
import { USLUGI_SEO } from './uslugi/wspolne'

/** One dictionary per service (and the shared SEO); a text may sit in one of them only (test). */
export const USLUGI_MODULES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  kam: KAM,
  alarm: ALARM,
  kd: KD,
  wifi: WIFI,
  tel: TEL,
  ant: ANT,
  smart: SMART,
  snd: SND,
  scr: SCR,
  ev: EV,
  oferta: OFERTA,
  seo: USLUGI_SEO,
}

export const USLUGI_TEXTS: Readonly<Record<string, string>> = Object.assign(
  {},
  ...Object.values(USLUGI_MODULES),
)
