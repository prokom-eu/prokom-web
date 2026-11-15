# Przekazanie 03.11.2026: koło v3, GoPOS, „O firmie”, kolorowe marki (prokombiznes.pl)

## Pliki (już w repo, PR `docs/biznes-poprawki-0311`)
| Plik | Co |
|---|---|
| `docs/design/prokombiznes/kolo/KOLO-HERO.md` | specyfikacja koła v3 (19 pozycji) |
| `docs/design/prokombiznes/kolo/prototyp.html` | prototyp koła — cel wizualny i licznik kolizji |
| `seed/prokombiznes/k4/media/kolo/kolo-<slug>.webp` | 17 wyciętych zdjęć koła (2 pozycje to ikony) |
| `docs/design/prokombiznes/poprawki-0311/POPRAWKI-0311.md` | specyfikacja A–D: scena GoPOS, lokale GoPOS, „O firmie”, kolorowe marki |
| `docs/design/prokombiznes/poprawki-0311/sekcje.html` | prototyp sekcji A–C |
| `seed/prokombiznes/k4/media/gopos-scena/*.webp` | 9 wyciętych zdjęć GoPOS z włączonym ekranem |

Zdjęcia wycięte z tła z oryginałów, które już są w paczce K3/K4 (packshoty producentów, bez ludzi) — nic z nowych źródeł.

**Warunek startu:** scalone #306, #310 i #311 (ruch R2 zmienia `DepartmentWheel.tsx` i `motion.css` — ta sesja nadpisuje: koło v3 zamiast podświetlania miniatur, loga zawsze kolorowe zamiast „z szarości do koloru”). Gałęzie od świeżego `origin/develop`.

## Kolejność
Jedna sesja, 3 PR-y piętrowo (CLAUDE.md, Biznes w jednym folderze):
1. **PR 1** `feat/biznes-kolo-v3`: koło. Ma migrację (kolumny dodawane: `wheelImage`, `wheelLink`, `shortName`).
2. **PR 2** `feat/biznes-gopos-scena`, od PR 1: scena GoPOS i zdjęcia lokali.
3. **PR 3** `fix/biznes-o-firmie-marki`, od PR 2: „O firmie” i kolorowe loga. Mały, bez logiki.

Szacunek: jedna dłuższa sesja. Najwięcej pracy wymaga PR 1 (geometria z danych, testy).

## Prompt dla Claude Code (wklej w całości)

```
/zadanie poprawki Biznes 03.11 — koło v3, scena GoPOS, „O firmie”, kolorowe marki
Specyfikacje: docs/design/prokombiznes/kolo/KOLO-HERO.md (koło) i docs/design/prokombiznes/poprawki-0311/POPRAWKI-0311.md (A–D). Wzorce: kolo/prototyp.html i poprawki-0311/sekcje.html — otwórz oba, to cel wizualny 1:1 (literały kolorów z prototypów zamień na tokeny z tokens.css).
Pliki i zdjęcia są już w repo (tabela w poprawki-0311/PRZEKAZANIE-0311.md). Warunek: scalone #306, #310, #311 — jeśli nie, zatrzymaj się i powiedz mi. Decyzje 03.11 nadpisują R2: koło v3 zamiast podświetlania miniatur, loga zawsze kolorowe.
Jedna sesja, 3 PR-y piętrowo, wszystkie gałęzie od origin/develop (drugi od pierwszego, trzeci od drugiego).

PR 1 feat/biznes-kolo-v3 (KOLO-HERO.md):
1. DepartmentWheel.tsx od nowa wg spec: brak obrotu pierścienia, 19 pozycji równo co 360/N, dział na środku swojej grupy (geometria liczona z liczebności działów — czysta funkcja + test Vitest), R produktów 282, działów 168, bąbel 56, rdzeń 164, --u = 100cqw/640 (container-type), etykiety skrócone (dolne nad ikoną). Ikona działu na pierścieniu bez pomiaru w JS (osobny wrapper ikony w punkcie, etykieta absolutnie względem ikony).
2. Rdzeń: „Dział N z 5”, nazwa z auto-rozmiarem (wzór w spec), „Zobacz dział” jako pigułka — BEZ liczby pozycji i bez miniatur.
3. Jeden dymek z nazwą w warstwie nad całym kołem (nie w bąblu), pozycja na zewnątrz koła, przy hover i :focus-visible.
4. Ruch: auto-przełączanie 6,5 s przez animationend pierścienia, które NIE staje pod kursorem ani przy najechaniu na produkt (decyzja Krystiana 03.11). Klik w dział = start odliczania od zera. Przycisk „Wstrzymaj animację”/„Wznów animację” pod kołem (WCAG 2.2.2) i pauza przy fokusie z klawiatury (:focus-visible). Reduced motion: bez ruchu.
5. Dane: kolo_hero wg tabeli (4·6·3·3·3; popraw dział usl na ksef, przkas), CatalogGroups.wheelProducts maxRows 6, nowe pola: Products.wheelImage (upload), CatalogGroups.wheelLink {label, href, icon} (Opieka IT → /opieka-it), CatalogGroups.shortName — jedna migracja dodająca kolumny (pnpm payload migrate:create, push wyłączony). Seed wgrywa kolo-*.webp idempotentnie (wzorzec k4-logo-*), zapis przy różnicy.
6. Karta produktu: ?kolor=<nazwa> wybiera kolor w ColorPicker (porównanie bez wielkości liter i ogonków; nieznany = domyślnie) — test.
7. e2e biznes-wheel wg sekcji „Testy” w spec (19 klikalnych, kolizje ≥ 8 px w 1024/1280/1440 × motyw × dział, dymek na wierzchu, ruch pod kursorem i pauza przyciskiem).

PR 2 feat/biznes-gopos-scena (POPRAWKI-0311 §A i §B): zdjęcia sceny i lokali z gopos-scena/ (pola stage[].img i segImg z plikami, k4Pages rozpoznaje plik albo slug), kompozycja sceny z pozycji w danych ≥ 721 px, siatka 1–4 na telefonie, droga zamówienia co 2,6 s + ten sam przycisk pauzy, scena lokalu (bilet pod urządzeniem, biały tekst biletu), miniatury w zakładkach, płynna wymiana. e2e biznes-gopos wg spec.

PR 3 fix/biznes-o-firmie-marki (§C i §D): wariant „O firmie” bez cytatu — karta z H2, leadem, 2 liczbami i 4 autoryzacjami ze statusem z Partners (teksty w polach bloku, seed usuwa stats 3–4), mniejsze odstępy; loga marek zawsze kolorowe (usuń grayscale/opacity z motion.css), zamiast tego skala 1,04 i jednorazowy błysk po płytce przy najechaniu, wejście kaskadą przez data-revealed. e2e biznes-home wg spec.

Każdy PR: lint/typecheck/test + e2e zmienionego obszaru zielone, telefon 390 i 1440, jasny i ciemny, zrzuty obok prototypu w opisie PR, Lighthouse ≥ 90 dla / i /gopos (koło i scena to wyspy klienckie — nic więcej nie przechodzi do klienta). /przeglad dla PR 1 i PR 2 (migracja, logika), potem /pr. Bez nowych zależności. Zasady: bez zdjęć ludzi, zero cen, statusy tylko dozwolone (K4-FINAL §1). Na koniec docs/STAN.md i /koniec-sesji.
```

## Decyzje Krystiana zapisane w tej paczce (03.11)
- Koło: 19 pozycji z listy Krystiana + Ubiquiti + Opieka IT; iPhone 18 Pro w kolorze burgund.
- Koło nie zatrzymuje się pod kursorem. Pauzę zostawia tylko przycisk (wymóg WCAG) i fokus z klawiatury.
- Środek koła bez liczby pozycji.
- GoPOS pokazuje sprzęt GoPOS i Sunmi z włączonym ekranem, nie wyłączone packshoty.
- Loga marek kolorowe zawsze.
