/**
 * INST-6 PR4: texts of the package for `architekci` → new wording (runda v6 §2). From the
 * architects' package only the „Nowe rozwiązania” cards reach the panel (`archNewsToImport()`);
 * the page's SEO has its own text in `map.ts`, the rest of the page lives in `dane/architekci.ts`.
 */
export const ARCHITEKCI: Readonly<Record<string, string>> = {
  // „Nowe rozwiązania” — card descriptions
  'Pełny bas do salonu albo kina domowego bez skrzyni na podłodze.':
    'Głęboki bas w salonie albo w kinie domowym bez dużej skrzyni na podłodze.',
  'Wzmacniacz Sonos Amp zamienia zwykłe głośniki sufitowe w strefę sterowaną z aplikacji, z AirPlay i dźwiękiem z telewizora.':
    'Wzmacniacz Sonos Amp zamienia zwykłe głośniki sufitowe w strefę sterowaną z aplikacji. Gra muzykę z telefonu przez AirPlay i dźwięk z telewizora.',
  'Modułowe głośniki z drewna i miedzi połączone rurkami w kompozycję na ścianie. Instalacja artystyczna, która gra.':
    'Modułowe głośniki z drewna i miedzi połączone rurkami w kompozycję na ścianie. Całość wygląda jak instalacja artystyczna i działa jak zestaw Hi-Fi.',
  'Projektor stoi w meblu tuż przy ścianie i daje obraz do 150". Zamiast dużego telewizora: gładka ściana albo ekran.':
    'Projektor stoi w meblu tuż przy ścianie i daje obraz do 150". Wyświetla go na gładkiej ścianie albo na ekranie, więc w salonie nie wisi duży telewizor.',
  'Ekran wysuwa się z sufitu albo komody na pilota lub z systemu automatyki. Gdy niepotrzebny, znika.':
    'Ekran wysuwa się z sufitu albo z komody na pilota lub z systemu automatyki. Po oglądaniu chowa się z powrotem.',
  'Wybrane funkcje Ampio udostępnione w standardzie Matter. Inwestor steruje światłem i roletami także głosem, z ulubionej aplikacji.':
    'Wybrane funkcje Ampio działają w standardzie Matter, który łączy urządzenia różnych marek. Inwestor steruje światłem i roletami z ulubionej aplikacji, także głosem.',
}
