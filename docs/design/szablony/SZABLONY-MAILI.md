# Szablony ręcznych odpowiedzi PRO-KOM — specyfikacja v2 (16.11.2026)

Pięć skrzynek w Thunderbirdzie: **Biznes, Instalacje, Software, PRO-KOM (pro-kom.eu, biuro@), Tech (prokomserwis.pl)**. Gaming ma szablony w swoim panelu (P3) — poza zakresem.
Zastępuje paczkę `szablony-maili` v1 z 03.11 (101 szablonów, 3 linie, sam tekst z listami).

- **Treści (źródło prawdy):** `tools/szablony-maili/tresci/*.yaml` — napisane w czacie i zaakceptowane. W kodzie nie zmieniamy treści; zmiana treści = zmiana YAML.
- **Wzorzec wyglądu:** `docs/design/szablony/probka-wzorzec.png` i `probka-wzorzec.html` (6 przykładowych maili z podpisami — tak ma wyglądać wynik). Wygląd komponentów: §4 (wiążący HTML).
- **Wynik:** paczka do Thunderbirda (dodatek Quicktext): XML-e szablonów, podpisy HTML z logo, podgląd wszystkich szablonów, katalog tekstowy, autoodpowiedzi.

## 1. Cel i zasady treści

Mail od PRO-KOM ma wyglądać i brzmieć jak od najlepszej firmy w regionie: najważniejsza informacja w pierwszych dwóch zdaniach, liczby i terminy w karcie (klient nie musi otwierać PDF), zawsze następny krok, jedna sprawa = jeden mail.

Zasady wpisane w treści (nie zmieniać w kodzie, pilnują testy z §8):
- „Państwo” w każdym szablonie. Bez WhatsAppa. Hasła i kody do urządzeń **nigdy** mailem.
- Obietnice tylko z `dane.yaml` (`OBIETNICA`): Biznes 60 minut w godzinach pracy · Instalacje odpowiedź w 24 h w dni robocze (nie przyjazd) · Software 1 dzień roboczy · PRO-KOM kierowanie do zespołu, przy dostawach 60 minut · Tech wycena przed naprawą.
- Instalacje: gwarancja 24 miesiące na montaż; dokumentacja odbiorowa nie jest standardem; SSP/DSO tylko integracja.
- PRO-KOM i Biznes: konfiguracja, montaż i szkolenie przy dostawach — tylko jeśli ustalone; RTV/AGD dla firm bez montażu.
- Tech: bez paczkomatów; diagnoza i wycena bezpłatne; bez obietnic czasu poza potwierdzonymi.
- Dane kontaktowe tylko przez zmienne (`{TEL}`, `{MAIL}`…), nigdy literałem w treści szablonu.

## 2. Liczby

| Linia | Wspólne (`wspolne.yaml`) | Własne | Razem |
|---|---|---|---|
| Biznes | 31 | 14 | 45 |
| Instalacje | 31 | 12 | 43 |
| Software | 31 | 11 | 42 |
| PRO-KOM | 31 | 11 | 42 |
| Tech | 13 | 28 | 41 |

Liczby „wspólne” wynikają z pola `linie` w każdym szablonie (generator liczy sam; test sprawdza, że każda linia ma ≥ 40 szablonów i żadna grupa nie jest pusta).
Autoodpowiedzi (3) × 5 linii — w katalogu, ustawiane w panelu poczty na serwerze.

## 3. Składnia treści (YAML → HTML)

Każdy szablon: `id` (unikalne w pliku), `grupa` (klucz z `grupy`), `nazwa`, `skrot` (słowo kluczowe Quicktext, małe litery bez polskich znaków), `linie` (tylko w `wspolne.yaml`; domyślnie wszystkie 4 bez Tech), `kiedy` (podpowiedź dla piszącego — trafia do podglądu i katalogu, **nie** do maila), `temat` (opcjonalny temat do nowej wiadomości), `tresc`.

Treść: akapity oddziela pusta linia. Akapit zaczynający się od `::` to blok (do pierwszej pustej linii):

| Zapis | Komponent (§4) |
|---|---|
| `::karta Tytuł` + wiersze `Etykieta: wartość` | karta podsumowania (dzieli na pierwszym `:`) |
| `::kroki [Tytuł]` + wiersze `1. tekst` | kroki z numerami w kółkach (pierwszy wypełniony) |
| `::info Tytuł` / `::uwaga Tytuł` / `::ok Tytuł` + tekst | ramka: akcent linii / bursztyn / zieleń |
| `::przycisk Etykieta \| adres` | przycisk-link (tabela, działa w Outlooku) |
| `::pozycje` + wiersz nagłówka `A \| B \| C` + wiersze | tabela pozycji; wiersz zaczynający się od `**` = suma (gruba linia w akcencie) |
| `::lista` + wiersze `- tekst` | lista z ✓ w kolorze akcentu |
| zwykłe wiersze `- tekst` (cały akapit) | lista punktowana |

W tekście:
- `**pogrubienie**` → `<strong style="color:#121613">`.
- `{I:etykieta}` → pole, o które Quicktext zapyta: `[[INPUT=etykieta]]`. Ta sama etykieta w jednym szablonie = to samo pole (sprawdzić ręcznie w Quicktext, §9).
- `{S:etykieta|a;b;c}` → lista wyboru `[[INPUT=etykieta|select|a;b;c]]`. **Opcje bez zagnieżdżonych pól** (Quicktext nie zagnieżdża `[[…]]`) i bez znaków `;` `|` `[` `]` w treści opcji — test.
- `{M:tekst}` → do jednorazowej podmiany po imporcie (np. link do opinii Google); żółte tło zostaje w XML, żeby nie dało się przeoczyć.
- `{?:tekst}` → zdanie opcjonalne: w XML zwykły tekst, w podglądzie i katalogu podkreślone przerywaną linią z dopiskiem „usuń, jeśli nie dotyczy”.
- Zmienne linii z `dane.yaml` (`{TEL}`, `{TEL2}`, `{MAIL}`, `{WWW}`, `{NAZWA}`, `{GODZ}`, `{OBIETNICA}`, `{GWARANCJA_MONTAZ}`, `{STATUS_URL}`, `{KURIER_ADRES}`, `{KURIER_ZASADA}`, `{OBIETNICA_DOSTAWY}`, `{FIRMA}`, `{NIP}`, `{ADRES}`, `{OD_ROKU}`) — podstawiane przy budowie.
- Odwołanie do innej linii: `{biznes.TEL}`, `{tech.STATUS_URL}` itd.
- `{PYTANIA}` → lista z `pytania.<linia>` (jako lista punktowana).
- `{S_PUNKT}` (Tech) → przy jednym opublikowanym punkcie: „Rabka-Zdrój, ul. Orkana 16B, 34-700 Rabka-Zdrój”; przy dwóch lub więcej — lista wyboru z opublikowanych punktów. Punkt `published: false` nie pojawia się nigdzie.
- Wartość zaczynająca się od `[DO UZUPEŁNIENIA]` albo `[SZEF]`: build zwykły → ostrzeżenie w konsoli i czerwona ramka w podglądzie; `--strict` → błąd. Tech `MAIL` i `LOGO` są dziś `[DO UZUPEŁNIENIA]` — do czasu uzupełnienia podpis Tech pokazuje wordmark HTML (§5), a `{MAIL}` Tech zostaje widocznym znacznikiem.

## 4. Komponenty HTML (wiążące)

Ogólne: maile wstawiane do odpowiedzi w Thunderbirdzie i czytane w Gmailu, Outlooku, Apple Mail. Dlatego: **tabele + style inline**, bez klas, bez `<style>`, bez zewnętrznych fontów i obrazków (poza logo w podpisie), szerokość treści max 600 px, font `Arial, Helvetica, sans-serif`. Kolory: tekst `#1F2421`, drugorzędny `#5A615B`, linie `#DDE2DA`; akcenty linii z `dane.yaml` (`ACC`, `ACC_TXT`, `ACC_BTN`, `ACC_SOFT`). Kontrast AA dla każdego tekstu (test).

Całość szablonu w opakowaniu:
```html
<div style="font:15px/1.6 Arial,Helvetica,sans-serif;color:#1F2421;max-width:600px"> … </div>
```
Akapit: `<p style="margin:0 0 14px">…</p>`. Tytuł bloku (karta, kroki):
```html
<div style="font:700 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:{ACC_TXT};margin:0 0 8px">TYTUŁ</div>
```

**Karta**
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
  style="border-collapse:separate;max-width:600px;margin:4px 0 18px;background:{ACC_SOFT};border-left:4px solid {ACC};border-radius:12px">
 <tr><td style="padding:16px 20px 10px">
  [tytuł bloku]
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
   <tr>
    <td style="padding:9px 14px 9px 0;width:36%;vertical-align:top;font:13px/1.45 Arial,Helvetica,sans-serif;color:#5A615B">Etykieta</td>
    <td style="padding:9px 0;vertical-align:top;font:600 14.5px/1.45 Arial,Helvetica,sans-serif;color:#121613">Wartość</td>
   </tr>
   <!-- kolejne wiersze: obie komórki dostają border-top:1px solid #DDE2DA -->
  </table>
 </td></tr>
</table>
```

**Kroki** (pierwszy krok: kółko wypełnione `ACC`, cyfra biała; pozostałe: tło białe, ramka `ACC`, cyfra `ACC_TXT`)
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;max-width:600px">
 <tr>
  <td style="width:40px;vertical-align:top;padding:0 0 12px">
   <div style="width:28px;height:28px;border-radius:14px;background:{ACC};border:1.5px solid {ACC};color:#FFFFFF;font:700 13px/28px Arial,Helvetica,sans-serif;text-align:center">1</div>
  </td>
  <td style="vertical-align:top;padding:4px 0 12px;font:15px/1.55 Arial,Helvetica,sans-serif;color:#1F2421">Tekst kroku</td>
 </tr>
</table>
```

**Ramka** (`info`: tło `ACC_SOFT`, pasek `ACC`, tytuł `ACC_TXT` · `uwaga`: `#FFF6E5` / `#E09A12` / `#8A5A00` · `ok`: `#ECF7EE` / `#2E8B4A` / `#1F6B36`)
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
  style="border-collapse:separate;max-width:600px;margin:4px 0 18px;background:{TŁO};border-radius:12px">
 <tr>
  <td style="width:4px;background:{PASEK};border-radius:12px 0 0 12px"></td>
  <td style="padding:13px 18px;font:14.5px/1.55 Arial,Helvetica,sans-serif;color:#1F2421">
   <div style="font:700 14.5px/1.4 Arial,Helvetica,sans-serif;color:{TYTUŁ};margin-bottom:3px">Tytuł</div>
   Tekst (wiersze łączone <br>)
  </td>
 </tr>
</table>
```

**Przycisk** (pod przyciskiem nic — adres jest w `href`; jeśli adres to pole `{I:…}`, Quicktext zapyta o niego)
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px">
 <tr><td style="background:{ACC_BTN};border-radius:10px">
  <a href="ADRES" style="display:inline-block;padding:13px 24px;font:700 15px/1 Arial,Helvetica,sans-serif;color:#FFFFFF;text-decoration:none;border-radius:10px">Etykieta&nbsp;→</a>
 </td></tr>
</table>
```

**Pozycje**: tabela `width="100%"`, ramka `1px solid #DDE2DA`; nagłówek `<th>` 11px wersaliki `#5A615B` na `#F3F4F1`, ostatnia kolumna do prawej i `white-space:nowrap`; wiersze z `border-top:1px solid #DDE2DA`, 14px; wiersz sumy 700 z `border-top:2px solid {ACC}`.

**Lista ✓**: tabela, w pierwszej kolumnie (24 px) `✓` 700 w kolorze `ACC`, w drugiej tekst 15px/1.55.

Pola w XML Quicktext: `[[INPUT=…]]` bez żadnej otoczki (Quicktext zamienia je na wpisany tekst). W podglądzie: `<span style="background:#FFF0A6;border-radius:3px;padding:0 3px">‹etykieta›</span>`.

## 5. Podpisy (jeden plik na linię)

Układ jak we wzorcu: krótka kreska akcentu (44×3 px) → znak linii 176 px szerokości po lewej | kreska `#DDE2DA` | imię i nazwisko (15px 700), rola (`ACC_TXT` 700), telefon(y) jako `tel:`, e-mail jako `mailto:`, domena (`ACC_TXT`), adres i godziny → pod spodem 11px `#8A918B`: obietnica linii, `FIRMA · NIP · od OD_ROKU roku`.
- Tech: zamiast adresu jeden wiersz na każdy opublikowany punkt (`nazwa · adres · godziny`).
- Logo: oficjalny znak poziomy z `public/brand/prokom-<linia>_poziome_kolor.svg` (PRO-KOM: `prokom-glowna_…`) wyrenderowany do **PNG 3×** (528 px szerokości, białe tło) — Gmail i Outlook nie pokazują SVG. Plik `logo-<linia>.png` obok podpisu; `src` w podpisie = `file:///D:/PRO-KOM/maile/<linia>/logo-<linia>.png` (ścieżkę bazową ustawia `--logo-base`; po produkcji linii można przełączyć na `https://<domena>/brand/mail/…`).
- Tech do czasu oficjalnego SVG: wordmark HTML (PRO‑KOM + kreska i „TECH” w `#C4362B`, jak we wzorcu) — bez obrazka.
- `PODPISUJE` z wartością `[Imię i nazwisko]` zostaje w pliku jako znacznik do ręcznej podmiany (instrukcja).

## 6. Wyniki budowy (`pnpm szablony:build` → `tools/szablony-maili/dist/`)

```
dist/
├─ START-TUTAJ.md               instrukcja instalacji (z §7, z liczbami z budowy)
├─ podglad-szablonow.html       wszystkie szablony 5 linii, zakładki, wyszukiwarka, skróty, „kiedy”, podpis
├─ KATALOG-SZABLONOW.md         tekst wszystkich szablonów + autoodpowiedzi (bez HTML)
├─ biznes/      quicktext-biznes.xml      podpis-biznes.html      logo-biznes.png
├─ instalacje/  …
├─ software/    …
├─ prokom/      …
└─ tech/        quicktext-tech.xml        podpis-tech.html        (logo-tech.png, gdy jest plik)
```
- **Quicktext XML** — format jak w v1 (sprawdzony): `<?xml version="1.0" encoding="UTF-8"?>`, `<quicktext version="2">`, `<filetype>templates</filetype>`, `<menu><title>` = nazwa grupy, `<text shortcut="" type="1">` (HTML) z `<name>`, `<body>` (CDATA z HTML), `<subject>` (CDATA: `temat`, jeśli jest), `<attachments>` (pusta CDATA), `<keyword>` (= `skrot`). Kolejność: grupy linii po grupach wspólnych 1–7. Nazwa menu z prefiksem linii nie jest potrzebna (każda skrzynka importuje swój plik), ale **skrót musi być unikalny w obrębie linii** (test) — przy kolizji generator dodaje sufiks i ostrzega.
- **Podgląd**: jeden plik HTML bez zależności; zakładki 5 linii z kolorem i liczbą; lewa kolumna: grupy i szablony ze skrótem, wyszukiwanie po nazwie/skrócie/treści; karta szablonu: grupa, nazwa, „kiedy” (żółta notka), temat, mail w ramce 640 px z podpisem; legenda pól. Logo w podglądzie jako data URI.
- **dist/ w `.gitignore`** — w repo tylko źródła; paczkę buduje się lokalnie.

## 7. Instalacja w Thunderbirdzie (treść START-TUTAJ w dist)
1. Skopiuj `dist/` do `D:\PRO-KOM\maile\` (skrypt `pnpm szablony:copy` na Windows albo ręcznie).
2. Podpis: Ustawienia kont → skrzynka linii → „Dołącz podpis z pliku” → `podpis-<linia>.html`; „Rozpoczynaj odpowiedź nad cytatem”, „podpis pod odpowiedzią”. W pliku podpisu podmień `[Imię i nazwisko]`.
3. Quicktext (dodatek, MPL 2.0) → Ustawienia → **usuń grupy z v1** → Importuj `quicktext-<linia>.xml` tylko dla skrzynek obsługiwanych na tym komputerze.
4. Raz po imporcie: w szablonie „Prośba o opinię w Google” wpisz link do opinii tej linii (pole z żółtym tłem).
5. Codziennie: Odpowiedz → skrót + Tab (np. `wycena`+Tab) albo menu Quicktext → wypełnij pytania → przeczytaj całość → wyślij.
6. Tryb wiadomości HTML musi być włączony dla skrzynki (Tworzenie wiadomości → „Twórz wiadomości w formacie HTML”).

## 8. Testy automatyczne (vitest, `tools/szablony-maili/**/*.test.ts`)
- Schemat YAML (zod): wymagane pola, unikalne `id` w pliku, `grupa` istnieje, `linie` z dozwolonych, `skrot` `^[a-z0-9]+$`.
- Każda linia ≥ 40 szablonów; grupa pusta w danej linii nie trafia do XML ani podglądu; skróty unikalne w linii (po sufiksach).
- Brak nierozwiązanych zmiennych `{…}` w wyniku (poza `[[INPUT…]]`); brak zagnieżdżonych `{…}` w opcjach `{S:}`; opcje bez `;|[]`.
- Literały: w treściach YAML brak numerów telefonów (`\d{3} \d{3} \d{3}`), adresów e-mail i „WhatsApp”; w Tech brak „paczkomat” poza szablonem `paczkomat` i blokami `uwaga`; w Instalacjach brak „technik w 24”, „w ciągu 24 godzin przyjedziemy”; nigdzie „hasło:” z wartością.
- HTML: parsuje się (np. `parse5`), brak `<style>`, `class=`, `<script>`, zewnętrznych `src` (poza `file:` i `data:`); każda tabela ma `role="presentation"` (poza pozycjami); rozmiar body szablonu < 20 KB.
- Kontrast AA: `ACC_TXT` na białym i na `ACC_SOFT`, biały na `ACC_BTN` i `ACC` (kółko kroku) ≥ 4,5:1 — z wartości `dane.yaml`.
- XML: poprawny (parser), liczba `<text>` = liczba szablonów linii, CDATA nie łamie się na `]]>`.
- `--strict`: błąd przy `[DO UZUPEŁNIENIA]`/`[SZEF]` w danych użytych przez linię; zwykły build przechodzi z ostrzeżeniem.
- Migawka (snapshot) HTML 6 szablonów ze wzorca — zmiana wyglądu wymaga świadomej aktualizacji migawki.

## 9. Sprawdzenie ręczne (Krystian, po buildzie — lista do PR)
- Podgląd vs `probka-wzorzec.png` (te same 6 szablonów).
- Thunderbird: import jednej linii, wstawienie 3 szablonów (z `{S:}`, z przyciskiem `{I:}` w adresie, z powtórzoną etykietą) — czy Quicktext pyta raz o to samo pole i czy adres w przycisku się podstawia. Jeśli pole w `href` się nie podstawia → generator zamienia przycisk z polem na przycisk + adres tekstem pod spodem (opcja `--no-href-input`).
- Wysyłka testowa do Gmaila (web + telefon w ciemnym motywie) i Outlook.com: karta, kroki, przycisk, tabela, podpis z logo.
- mail-tester dla jednej wiadomości z szablonem (≥ 9/10).

## 10. Otwarte (blokują pierwsze użycie, nie budowę)
- **[Krystian]** skrzynka Tech (`MAIL`) i oficjalny znak PRO-KOM TECH (SVG) → `dane.yaml`.
- **[SZEF]** Zakopane (adres, godziny) → `PUNKTY` `published: true`.
- **[SZEF]** zasady kurierskie Tech (`KURIER_ZASADA`, kto płaci za odesłanie po rezygnacji) — szablony `kurier`, `rezygnacja`.
- **[SZEF/regulamin]** zasady przechowywania nieodebranego sprzętu → szablon `nieodebrany` (pole `{M:}`).
- **[SZEF]** ceny opieki Software 149/299/790 przed pierwszym wysłaniem `opieka`.
- **[Krystian]** osoby podpisujące (`PODPISUJE`, `ROLA`) dla Biznesu, Instalacji, PRO-KOM i Tech.
