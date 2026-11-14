import type { IconName } from '@/lib/shared/icons'

/**
 * Icon of a hub service or tool by the words of its title (board Naglowek, `icOf`; spec §5.2): the
 * first rule that matches wins. Order matters — „automatyzacje” before „automat”, „serwis kas”
 * before the general „serwis”. Icons from the shared set (`lib/shared/icons.ts`).
 */
const RULES: readonly [RegExp, IconName][] = [
  [/automatyzac/, 'gear'],
  [/kas[ay]?\b|kasy|fiskal|przegląd/, 'receipt'],
  [/gopos|gastro/, 'monitor'],
  [/terminal|płatn/, 'card'],
  [/wag[ia]|skaner|etykiet|sprawdzark/, 'barcode'],
  [/automat/, 'vending'],
  [/serwer|dysk|\bnas\b/, 'server'],
  [/komputer(?!.* gier)|laptop|pracowni/, 'laptop'],
  [/office|eset|licencj/, 'grid'],
  [/opiek|bezpiecze|zapor|gwarancj/, 'shield'],
  [/kopi|odzysk|danych/, 'database'],
  [/insert|subiekt|ksef|comarch|erp|podpis|faktur/, 'doc'],
  [/niszcz|drukark/, 'printer'],
  [/monitoring|kamer/, 'camera'],
  [/alarm|domofon/, 'bell'],
  [/dostęp|zamk/, 'lock'],
  [/\bsie[cć]|sieci|wi-?fi|światłow|teletech|internet/, 'wifi'],
  [/nagłośn|głośnik|audio/, 'speaker'],
  [/ekran|telewiz|anten|rtv|agd/, 'tv'],
  [/ładowar/, 'bolt'],
  [/stron|audyt|www|sklep internetow/, 'site'],
  [/system|panel|crm/, 'panel'],
  [/aplikac|telefon|tablet|hammer|gsm/, 'mobile'],
  [/status/, 'clock'],
  [/dostaw|zapytan|przetarg|zamówie/, 'box'],
  [/inwestyc|współprac|architekt|dewelop/, 'building'],
  [/smart/, 'home'],
  [/konsol|\bgr[ęy]\b|pod grę|gier|gaming/, 'gamepad'],
  [/zestaw|gotowe/, 'pc'],
  [/konfigurator/, 'sliders'],
  [/rodzic/, 'users'],
  [/porówn/, 'chart'],
  [/test|wydajn/, 'gauge'],
  [/akcesori/, 'plug'],
  [/napraw|serwis/, 'wrench'],
  // Tools of „Załatw online” (board Narzedzia).
  [/zaplanuj|\bplan\b/, 'cal'],
  [/katalog|wyszukiw/, 'search'],
  [/awari|zgłoś/, 'flash'],
  [/projekt/, 'rocket'],
  [/podgląd/, 'monitor'],
  [/konto|logow/, 'key'],
]

/** Icon of a title that no rule knows — the tests keep every service of the package off it. */
export const DEFAULT_SERVICE_ICON: IconName = 'check'

export function iconForService(title: string): IconName {
  const text = title.toLowerCase()
  return RULES.find(([pattern]) => pattern.test(text))?.[1] ?? DEFAULT_SERVICE_ICON
}
