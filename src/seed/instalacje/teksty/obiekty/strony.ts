/**
 * INST-6 PR4: texts of the package for `strony` → new wording (runda v6 §2). From the fixed pages
 * only the SEO descriptions are read through the seed (`PAGE_FILES` in `map.ts`); the hero and
 * the band come from `formPages.ts`, the sections from `dane/` and the shared group. A description
 * has 140–155 characters (§2.2 p. 7).
 */
export const STRONY: Readonly<Record<string, string>> = {
  // Kontakt
  'Kontakt z PRO-KOM Instalacje: salon w Rabce-Zdroju (ul. Orkana 16B). Telefon, e-mail i mapa stref dojazdu.':
    'Kontakt z PRO-KOM Instalacje: salon w Rabce-Zdroju przy ul. Orkana 16B. Zadzwoń, napisz albo sprawdź na mapie strefę dojazdu na Podhalu i w Małopolsce.',
  // O firmie
  'PRO-KOM Tadeusz Wójciak z Rabki-Zdroju, od 2004 roku. Salon w Rabce-Zdroju, instalacje, serwis i rozwiązania dla firm.':
    'PRO-KOM Tadeusz Wójciak z Rabki-Zdroju, od 2004 roku. Projektujemy, montujemy i serwisujemy monitoring, alarmy, sieci i smart home na całym Podhalu.',
  // Zaplanuj
  'Zaplanuj instalację w 2 minuty: wybierz, co chcesz zamontować, opisz obiekt i zostaw telefon. Oddzwonimy do 24 h w dni robocze.':
    'Zaplanuj instalację w 2 minuty: wybierz monitoring, alarm, Wi-Fi albo smart home, opisz obiekt i zostaw telefon. Oddzwonimy do 24 h w dni robocze.',
}
