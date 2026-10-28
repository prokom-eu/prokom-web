/**
 * One plain sentence under each configurator option (K31-ZMIANY §13.7, dictionary `konf_help`).
 * Texts 1:1 from the board `k31/boards/Strona.dc.html` (field `pom` of the options), matched by
 * the option name; an option without a match has no sentence.
 */
const HELP: [RegExp, string][] = [
  [
    /crk/,
    'Jak urządzenie wysyła dane do Centralnego Repozytorium Kas: kablem (LAN), przez Wi-Fi albo modemem z kartą SIM.',
  ],
  [
    /^(model|wersja|generacja|platforma)/,
    'Różnice między wersjami opisujemy niżej, w sekcji „Czym różnią się wersje”.',
  ],
  [
    /graficzn|^grafika/,
    'Osobna karta graficzna przydaje się do grafiki, wideo, CAD i 3D; do pracy biurowej wystarczy zintegrowana.',
  ],
  [
    /^procesor/,
    'Od procesora zależy szybkość pracy. Do biura i programów sprzedażowych wystarczy podstawowy, do grafiki, CAD i wielu programów naraz — mocniejszy.',
  ],
  [
    /^pamięć|^ram\b/,
    'Więcej pamięci RAM = więcej programów i kart przeglądarki naraz bez spowolnień.',
  ],
  [
    /^dysk|pojemność dysku/,
    'Miejsce na system, programy i pliki. SSD to szybki dysk bez ruchomych części.',
  ],
  [
    /^system/,
    'Windows 11 Pro ma funkcje dla firm, np. szyfrowanie dysku BitLocker i dołączanie do domeny.',
  ],
  [
    /^ekran|wyświetlacz/,
    'Matowy nie odbija światła, dotykowy pozwala pracować palcem lub rysikiem, wyższa rozdzielczość daje ostrzejszy obraz.',
  ],
  [
    /^gwarancja/,
    '„Na miejscu” (on-site) — serwisant naprawia u Ciebie; „kurier” — sprzęt jedzie do serwisu i wraca.',
  ],
  [
    /przekątn|^rozmiar/,
    'Większy ekran jest wygodniejszy, mniejszy — lżejszy i zajmuje mniej miejsca.',
  ],
  [
    /licencj|abonament|pakiet|^plan/,
    'Zakres programu lub usługi. Nie wiesz, który wybrać — zostaw „Doradźcie”.',
  ],
  [/stanowisk|użytkownik/, 'Ile osób lub komputerów będzie pracować jednocześnie.'],
  [/wwan|^modem/, 'Modem LTE/5G daje internet z karty SIM, bez Wi-Fi.'],
  [
    /montaż|^podstawa|uchwyt/,
    'Jak urządzenie będzie stało lub wisiało — pomożemy dobrać przy wizycie.',
  ],
]

export function optionHelp(name: string): string | null {
  const key = name.trim().toLowerCase()
  return HELP.find(([pattern]) => pattern.test(key))?.[1] ?? null
}
