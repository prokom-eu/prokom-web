# prokominstalacje.pl — audyt develop (06.11.2026, przed pokazaniem szefowi)

Wersja: `origin/develop` abb109b (po INST-1: #322 #323 #325 #327 #328 #329). Sprawdzone na buildzie produkcyjnym (`pnpm build && pnpm start`, świeży `pnpm seed`) w chmurze + lokalna wersja Krystiana w Chrome.
Zakres: 35 adresów × 4 widoki (1440 jasny/ciemny, 390 jasny/ciemny), axe-core (WCAG 2.1 AA), CLS/LCP z przeglądarki, interakcje (hero, galeria, formularze, klawiatura, reduced motion), SEO (tytuły, opisy, JSON-LD, sitemap, robots, llms.txt, 404), tekst wszystkich stron, niezależny przegląd kodu rundy v5.
Plan naprawy: `docs/zadania/prokominstalacje-domkniecie.md` (§8 — mapa punktów na sesje).

## Werdykt
Technicznie strona jest w bardzo dobrym stanie: 35/35 stron 200, CLS 0 na desktopie, zero przewijania w bok na 390 px, JSON-LD bez błędów, unikalne tytuły, sitemap 36 adresów, 404 linii działa, galeria i hero zachowują się poprawnie (pauza przy najechaniu, stop przy reduced motion, focus wraca). Kod v5 bez blokerów (tsc czysty, 2546 testów zielonych).
Do pokazania szefowi blokują **treści**: WhatsApp nadal na stronie, obietnica „zdjęcia w formularzu”, którego nie ma, oraz „W przygotowaniu” na stronie architektów. Do produkcji dochodzi kontrast (229 elementów w jasnym motywie), obrazy OG, logo marek i weryfikacja dat prawnych.

## P0 — przed pokazaniem szefowi
1. **WhatsApp wbrew decyzji 01.11** — strona główna (FAQ: „Zadzwoń albo napisz na WhatsApp”, przycisk „Napisz na WhatsApp”, karta „WhatsApp i e-mail”), `/kontakt` (karta WhatsApp), 6 stron „Dla kogo” („Zdjęcia możesz wysłać… przez WhatsApp”), polityka prywatności. Źródła: `dane/glownaSekcje.ts:402,509`, `dane/obiekty.ts:260-265`, `dane/kontakt.ts`, `blocks/InstContact`, `blocks/InstHome`, `seed/instalacje/contact.ts`, `legal.ts:75`. → usuwa L1-I (krok 2–3).
2. **Obietnica bez funkcji:** „Zdjęcia możesz wysłać w formularzu” (6 stron „Dla kogo”, przycisk „Wyślij zdjęcia i opis →”), „Wyślij zdjęcia do wyceny” (`/monitoring`), „Wyślij zdjęcie obiektu…” (FAQ na 15 stronach), „wysyłasz zdjęcia” (Proces). Żaden formularz Instalacji nie ma pola pliku (zgodnie z decyzją „bez przesyłania plików”). → przeredagować na „Opisz obiekt — zdjęcia pokażesz nam na wizji lokalnej / wyślesz w odpowiedzi na nasz e-mail”.
3. **„W przygotowaniu” ×3 na `/dla-architektow`** (Symbole DWG/PDF, Opisy DOCX, Wytyczne rack) + „Checklista w PDF / Wyślij PDF” — pliku checklisty nie ma w repo (wysyłka ręczna?). Na stronie premium nie pokazujemy rzeczy niegotowych → ukryć do czasu plików albo przygotować PDF.

## P1 — przed produkcją
4. **Kontrast WCAG AA (jasny motyw):** 229 elementów na 24 stronach. Głównie nadtytuły `.eye` w kolorach usług na `#f4f5f1` (2,9–4,3:1: amber #b38b3b 2,87, zielony #5e9e52 2,95, #499c84 3,0, #ac7b2f 3,4…), `.sgwho` #a86a00 na #fdf2df (4,0), chipy `.sgchip`, wyróżnienia `em` w scenach (1,8–2,6). Ciemny motyw: 11. → ciemniejsze warianty `--h-*-text` w `tokens-instalacje.css` + test kontrastu.
5. **Brak obrazu OG na wszystkich 35 stronach** (`og:image` pusty). Udostępnienie linku na FB/WhatsApp/Messenger = bez podglądu. → `SiteSettings.seo.ogImage` w panelu (minimum) albo generator 1200×630.
6. **Logo marek za małe:** siatka 11 kolumn → Hikvision ~10 px wysokości, Ampio/MikroTik ~17 px (spec §2: 30–34 px). Ubiquiti wygląda na przycięte. → 2 rzędy × 6 albo stała szerokość kafla z przewijaniem.
7. **Daty i przepisy do weryfikacji w Dz.U. przed produkcją** (strona je podaje jako fakty, bez źródeł):
   - WT 2002 „utraciło moc 20.09.2026”, okres przejściowy do 20.03.2028 (art. 102a) — zgodne ze źródłami z 31.10.2026; zdanie „nowego do października 2026 nie ogłoszono” zestarzeje się → „stan na …” + przegląd co miesiąc.
   - Pensjonat: „od 30.06.2026 czujka dymu w każdym pokoju” — źródła prasowe mówią o „co najmniej jednej w lokalu / na poziomie”; sprawdzić rozporządzenie MSWiA.
   - Hotele: „15.03.2027 termin Wi-Fi” — zgodne z prasą (6 mies. od 15.09.2026).
   - Liczby „Dla kogo”: 6 031 miejsc w Zakopanem, ok. 60% szkód = zalania (Compensa), ok. 320 tys. kradzieży w sklepach (policja 2023), 64,2% mieszkań deweloperzy (GUS 2025), 20,5 tys. szkół OSE, 321/849 mieszkań w powiatach — mieć źródło w repo (`docs/tresci/`) dla każdej.
8. **LCP na stagingu ponad budżet** (CI Lighthouse 42140299033): `/` 2,8 s, `/ladowarki-ev` 3,3 s (budżet 2,5 s). Lokalnie w przeglądarce LCP to lead/H1 (<1 s) — na serwerze winny TTFB (strony bez cache, `Cache-Control: no-store`) i font. → preload fontu display, sprawdzić TTFB stagingu.
9. **Zdjęcia realizacji:** 600×337, serwowane w wariancie 375 px na kartach 415 px (rozmyte, na Retinie wyraźnie), 16:9 w karcie 4:3. Brak realizacji monitoringu/alarmów — główna usługa linii nie ma ani jednego zdjęcia. Empik bez zdjęcia na głównej. Jedno zdjęcie to karton mikrofonów RØDE (`2/20170125_133515`). → oryginały od szefa + 2–3 realizacje monitoringu.
10. **Licencje zdjęć producentów** (Nowe rozwiązania) — świadome, ale musi być potwierdzone przed produkcją.

## P2 — warto (jakość premium)
11. Hero: brak przycisku pauzy autoodtwarzania (WCAG 2.2.2 — pauza tylko najechaniem/focusem); pasek postępu nie pauzuje (CSS `transition` jedzie dalej); podgląd kamery w trybie compact nie zamyka się Esc; stała wysokość + `overflow:hidden` może uciąć tekst przy powiększonej czcionce.
12. Hero na telefonie: najpierw scena, H1 dopiero na ~490 px, lead i przyciski pod pierwszym ekranem; hero zajmuje ~2,5 ekranu.
13. Strony bardzo długie: `/dla-architektow` 21 000 px (desktop) / 25 500 px (telefon), usługi 11–15 tys. px. Tu najbardziej pomoże szyna + „Na tej stronie” (L1-I).
14. Przekrój architektów (widok „Wszystkie instalacje”): numery punktów zasłaniają nazwy pokoi („SY[10]LNIA”, „[11]ŁAZIENKA”).
15. Karty Dla kogo: „Pokaż na żywo” tylko na 6 z 14 kart — wizualnie nierówne; sylwetki obiektów proste (bloki z kropkami).
16. Kontrast/sloty drobne: pole „Salon: Rabka-Zdrój…” w ciemnym CTA wygląda jak wyłączone pole formularza; newsletter architektów — przycisk nad zgodami.
17. `/kontakt`: pusta prawa połowa hero, WhatsApp (P0), układ do przebudowy w L2-I.
18. Galeria: czytnik ekranu słyszy tylko „2 / 17” (bez opisu zdjęcia).
19. Powtórzenia SEO: identyczny blok „Gwarancja / Odpowiadamy szybko / Masz już instalację” na 15 stronach; „Do 24 h odpowiadamy…” 15×; zdanie FAQ „Wyślij zdjęcie…” 15×.
20. Wymagania RUNDA-V5 nieodhaczone w STAN: przyciemnienie tła pod tekstem hero (§1.3), lista marek z panelu (§2 — dziś na sztywno), wiązki `clip-path` (§1.5).
21. `/dla-kogo/szkoly` telefon: CLS 0,27 po przewinięciu (leniwy widżet) — do sprawdzenia.
22. Poradnik: 1 wpis + wpis polecany z rysunkiem zastępczym — cienko jak na pozycję w menu (4 wpisy w planie).

## P3 — kosmetyka
23. Tytuły >60 znaków: `/` (66), `/alarmy`, `/dla-kogo/firmy` (64), `/dla-architektow`, `/dla-kogo/koscioly`, `/dla-kogo/budowy` (63).
24. axe moderate na każdej stronie: `region` (`.topw` poza landmarkiem), `landmark-unique` (dwa `nav` „Strony PRO-KOM”) — znika z nową powłoką.
25. `/serwis` kolejność nagłówków (`#sv-sys`), link w tekście bez podkreślenia na `/dla-architektow` (`.mut > a`).
26. Historia gita: #322 i #325 zawierają logikę (hero, marki) pod tytułami „strefa wspólna”/„fix” — upewnij się, że diff hero był czytany; gałąź `origin/inst/wsp-v5` do usunięcia.

## Co jest naprawdę dobre
- CLS 0 na 35 stronach (desktop), 0 px przewijania w bok na 390 px, wszystkie strony < 1 s LCP lokalnie.
- Galeria `<dialog>`: focus, Esc, ←/→, blokada tła, przywrócenie focusu — sprawdzone na żywo.
- Hero v5 mieści się w 900 px, nic nie nachodzi; autoodtwarzanie pauzuje przy najechaniu i przy reduced motion.
- Formularz architektów bez pola rzutów (do końca: Zod, testy, polityka), filtr tenanta w nowych zapytaniach, poprawka `next/image` bez ryzyka SSRF.
- Ciemny motyw: tylko 11 problemów kontrastu.
- SEO techniczne: canonical, JSON-LD (Organization, LocalBusiness, Service, FAQPage, BreadcrumbList), sitemap, llms.txt, 404 z tytułem linii.

Źródła weryfikacji prawnej: poradnikremontowy.com.pl (31.10.2026, WT), muratordom.pl (czujki 30.06.2026), spidersweb.pl (09.2026, kategoryzacja hoteli).
