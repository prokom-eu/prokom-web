// START-TUTAJ.md — installation guide in the package (SZABLONY-MAILI.md §7), with counts from the build.
import type { Content } from './load.ts'
import type { RenderedLine } from './render.ts'

export function startGuide(content: Content, lines: RenderedLine[], missing: string[]): string {
  const rows = lines.map((r) => {
    const d = content.dane.linie[r.line]
    return `| ${d.NAZWA} | ${d.MAIL} | \`${r.line}/\` | ${r.templates.length} |`
  })
  const total = lines.reduce((n, r) => n + r.templates.length, 0)
  return [
    '# Szablony ręcznych odpowiedzi PRO-KOM — start',
    '',
    `Paczka v2 zbudowana przez \`pnpm szablony:build\`: **${total} szablonów** w ${lines.length} skrzynkach.`,
    'Zastępuje paczkę v1 z 03.11. Treści zmienia się w `tools/szablony-maili/tresci/*.yaml` (repo prokom-web), potem build i ponowny import.',
    '',
    '| Skrzynka | Adres | Folder | Szablony |',
    '|---|---|---|---|',
    ...rows,
    '',
    'W każdym folderze: `quicktext-<linia>.xml` (szablony), `podpis-<linia>.html` (podpis), `logo-<linia>.png` (znak do podpisu).',
    'Obok: `podglad-szablonow.html` (wszystkie szablony do przejrzenia) i `KATALOG-SZABLONOW.md` (tekst + autoodpowiedzi do panelu poczty).',
    '',
    '## Instalacja w Thunderbirdzie (raz, ok. 30 minut)',
    '',
    '1. Skopiuj paczkę do folderu `maile` obok folderu `repos` — `pnpm szablony:copy` (albo ręcznie). Logo w podpisach wskazuje na ten folder.',
    '2. **Podpis:** Ustawienia kont → skrzynka linii → „Dołącz podpis z pliku” → `podpis-<linia>.html`. W „Tworzenie i adresowanie”: „Rozpoczynaj odpowiedź nad cytatem” i „podpis pod odpowiedzią”. W pliku podpisu podmień `[Imię i nazwisko]` (jeśli jest).',
    '3. **Tryb HTML:** Tworzenie wiadomości → „Twórz wiadomości w formacie HTML” musi być włączone dla skrzynki.',
    '4. **Quicktext** (dodatek, MPL 2.0) → Ustawienia → **usuń grupy z v1** → Importuj `quicktext-<linia>.xml` tylko dla skrzynek obsługiwanych na tym komputerze.',
    '5. **Raz po imporcie:** w szablonie „Prośba o opinię w Google” podmień adres przycisku `WSTAW-LINK` na link do opinii tej linii (Quicktext → Ustawienia → szablon → edytuj HTML) i usuń żółty akapit pod przyciskiem.',
    '',
    '## Codziennie',
    '',
    '- Odpowiedz → wpisz skrót + Tab (np. `oferta` + Tab) albo wybierz z menu Quicktext.',
    '- Wypełnij pola, o które zapyta Quicktext (to samo pole w jednym szablonie wpisuje się raz).',
    '- Zdania oznaczone w podglądzie przerywaną linią są opcjonalne — usuń, jeśli nie dotyczą.',
    '- Przeczytaj całość i wyślij. Hasła i kody do urządzeń nigdy mailem.',
    '',
    '## Do uzupełnienia w `dane.yaml`',
    '',
    missing.length > 0
      ? missing.map((m) => `- ${m}`).join('\n')
      : '- nic — wszystkie dane linii są uzupełnione.',
    '- Osoby podpisujące: `PODPISUJE` z wartością `[Imię i nazwisko]` zostaje w podpisie do ręcznej podmiany.',
    '',
  ].join('\n')
}
