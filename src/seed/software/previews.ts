import type { Solution } from '../../payload-types'

type Preview = NonNullable<Solution['preview']>

/**
 * Mock-up of each seeded solution (PRZEKAZANIE-v24 §5, ZMIANY-v24 §8). The migration
 * `swa1_solutions_preview` fills the same values on staging and production, where the seed is off.
 */
export const SOLUTION_PREVIEWS: Record<string, Preview> = {
  'strona-wizytowka': { kind: 'site', variant: 'wizytowka' },
  'strona-firmowa-z-panelem': { kind: 'site', variant: 'firmowa' },
  'rozbudowana-strona-firmowa': { kind: 'site', variant: 'rozbudowana' },
  'landing-page': { kind: 'site', variant: 'landing' },
  'strona-dla-hotelu-lub-pensjonatu': { kind: 'site', variant: 'pensjonat' },
  'strona-dla-restauracji-lub-baru': { kind: 'site', variant: 'restauracja' },
  'przebudowa-starej-strony': { kind: 'before', variant: 'przebudowa' },
  'sklep-internetowy': { kind: 'site', variant: 'sklep' },
  'system-zlecen-i-grafik-ekip': { kind: 'dash', variant: 'zamowienia' },
  'crm-dla-malej-i-sredniej-firmy': { kind: 'dash', variant: 'crm' },
  'czas-pracy-i-rozliczenia': { kind: 'dash', variant: 'czas' },
  'system-serwisu-i-zgloszen': { kind: 'dash', variant: 'zamowienia' },
  'z-excela-do-systemu': { kind: 'dash', variant: 'excel' },
  'magazyn-i-zamowienia': { kind: 'dash', variant: 'excel' },
  'wyceny-i-oferty-z-pdf': { kind: 'dash', variant: 'crm' },
  'panel-klienta-i-portal-b2b': { kind: 'dash', variant: 'crm' },
  'grafik-i-rezerwacje-zajec': { kind: 'dash', variant: 'czas' },
  'kalendarz-sal-i-imprez': { kind: 'dash', variant: 'czas' },
  'aplikacja-dla-ekip-w-terenie': { kind: 'phone', variant: 'budowlanka' },
  'aplikacja-do-rezerwacji-dla-gosci': { kind: 'phone', variant: 'pensjonat' },
  'aplikacja-do-programu-ktory-masz': { kind: 'phone', variant: 'firmowa' },
  'powiadomienia-sms-i-e-mail': { kind: 'flow', variant: 'sms' },
  'faktury-bez-przepisywania': { kind: 'flow', variant: 'faktury' },
  'asystent-ai-do-zapytan': { kind: 'flow', variant: 'ai' },
  'raporty-dla-szefa': { kind: 'flow', variant: 'raporty' },
  'polaczenie-programow': { kind: 'flow', variant: 'faktury' },
  'opieka-nad-strona-i-systemem': { kind: 'care', variant: null },
  'przejecie-po-innym-wykonawcy': { kind: 'care', variant: null },
  'audyt-strony-lub-programu': { kind: 'before', variant: 'przebudowa' },
}
