# prokombiznes.pl — SEO lokalne i widoczność w czatach AI (plan, 13.11.2026)

**Cel (Krystian, 13.11):** na frazy „<usługa/produkt> + Rabka / Rabka-Zdrój / Podhale / Małopolska” (kasy fiskalne, komputery, GoPOS, InsERT, opieka IT, dostawy IT, drukarki, sieci, monitoring kas, terminale…) PRO-KOM Biznes ma być na pierwszym miejscu w Google i polecany przez czaty AI (ChatGPT, Gemini, Perplexity, Copilot).

**Uczciwie:** pozycji nie da się zagwarantować — decyduje Google. Da się zrobić wszystko, co od nas zależy, lepiej niż lokalna konkurencja. Na frazy lokalne o małej konkurencji (Rabka, Podhale) to realnie daje TOP 1–3 w kilka tygodni–miesięcy po starcie produkcji.

## Co dziś jest (audyt 13.11, lokalnie)
| Obszar | Stan |
|---|---|
| Główna, GoPOS, InsERT, Opieka IT, salony marek | tytuł i opis z miejscowością ✅ („… — Rabka”, „na Podhalu”) |
| Strony kategorii `/oferta/<kategoria>` (kasy fiskalne, komputery, …) | **tytuł bez miejscowości** („Kasy fiskalne \| PRO-KOM Biznes”), H1 bez regionu ❌ |
| Karty produktów | opisy i FAQ unikalne (#560, PR FAQ), JSON-LD Product ✅; brak frazy regionu w tytule — celowo (karta = model) |
| JSON-LD `LocalBusiness` Biznesu | jest, ale **bez `areaServed`, `geo`, `image`, `sameAs`** (ma je tylko Software) ❌ |
| `llms.txt` (sygnał dla czatów AI) | **brak** (Instalacje ma, `src/lib/instalacje/llms.ts`) ❌ |
| Strony miejscowości (Nowy Targ, Zakopane, Jordanów, Mszana Dolna, Myślenice…) | **brak** (Software ma `/miejscowosci/[miasto]` z zakazem stron-wydmuszek) ❌ |
| Produkcja | **Biznes nie jest jeszcze w internecie**, domena od 31.10 — Google nie oceni strony, której nie widzi ⛔ |

## Plan — kod (moja robota, 3 PR-y)
1. **`feat/biznes-seo-lokalne-1` — sygnały na stronie (mały, szybki):**
   - tytuły i opisy stron kategorii z regionem: „Kasy fiskalne w Rabce-Zdroju i na Podhalu — sprzedaż i serwis”, H1 bez upychania (fraza raz, naturalnie); lead kategorii ze zdaniem o obszarze;
   - `LocalBusiness` Biznesu: `areaServed` (Rabka-Zdrój, Nowy Targ, Zakopane, Jordanów, Mszana Dolna, Myślenice, Limanowa, Podhale, Małopolska — lista do potwierdzenia), `geo` salonu, `image`, `sameAs` (profil Google, Facebook — gdy będą), `hasOfferCatalog` z kategoriami;
   - `Service` JSON-LD na stronach usług (Opieka IT, fiskalizacja, serwis) z `areaServed`;
   - test: każda strona kategorii i usługi ma region w tytule lub opisie; `LocalBusiness` ma `areaServed`.
2. **`feat/biznes-llms` — czaty AI:** `llms.txt` Biznesu (wzór Instalacji): kim jesteśmy, co robimy, gdzie (Rabka-Zdrój + obszar), statusy wg K4-FINAL §1, kontakt z panelu, lista kategorii, usług i marek z linkami. Strona „O firmie” z faktami, które AI chętnie cytuje (od kiedy, ilu klientów — **[SZEF]: „100+ klientów” do potwierdzenia**, autoryzacje, obszar).
3. **`feat/biznes-miejscowosci` — strony miejscowości (wzór Software):** `/obszar/<miasto>` tylko z **własnym tekstem** (dojazd, czas reakcji, co robimy dla firm z tej miejscowości, realne przykłady branż) — bez tekstu = 404, żeby nie robić wydmuszek (kara Google). Start: Nowy Targ, Zakopane, Jordanów, Mszana Dolna, Myślenice. Linki z mapy obszaru i stopki.

## Plan — poza kodem (Krystian / szef — bez tego TOP 1 lokalnie się nie da)
1. **Produkcja Biznesu** (decyzja „Biznes gotowy” → staging → akceptacja szefa w Asanie → `deploy.sh prod`).
2. **Profil Firmy w Google (Google Business Profile)** dla salonu w Rabce: kategoria główna „Sklep komputerowy” / „Serwis kas fiskalnych”, dodatkowe kategorie, obszar obsługi (Podhale), godziny, zdjęcia salonu (bez ludzi), link do prokombiznes.pl. To on decyduje o mapce („3-pack”) na frazy z „Rabka”.
3. **Opinie w Google** — prośba o opinię po każdym wdrożeniu (kod QR na fakturze / mail po zgłoszeniu). Liczba i świeżość opinii to główny czynnik lokalny.
4. **Bing Places + Apple Maps** (ChatGPT i Copilot korzystają z Binga) — te same dane co w Google.
5. **Search Console + Bing Webmaster Tools** z `sitemap.xml` (TXT najpierw w `docs/dns.md`).
6. **Linki:** z pro-kom.eu (stara domena z historią) do prokombiznes.pl na każdej podstronie oferty; wpisy partnerskie u producentów (Posnet, Elzab, GoPOS, InsERT — „znajdź partnera”), katalogi lokalne (Rabka-Zdrój, izba gospodarcza), spójne NAP (nazwa, adres, telefon) wszędzie.

## Stan (noc 14.11)

- ✅ PR FAQ (#565), opisy bez powtórzeń (#560).
- ✅ PR 1 — sygnały na stronie: #567 + #570 (poprawki), #574 (oferta, marki, salony, zestawy, strony usług i zaopatrzenia; `brandMetaTitle`, `salonMetaTitle`, `localPageMeta`). Skan: 43/44 tytuły kategorii i wszystkie opisy z regionem; `LocalBusiness` z `geo` i `areaServed` z panelu.
- ✅ PR 2 — `/llms.txt` Biznesu i `Service` na stronach usług i zaopatrzenia: #571 (+ #574).
- ⏳ PR 3 — strony miejscowości: czeka na [SZEF] listę miejscowości i dojazdy/czas reakcji (bez tego wydmuszki).
- ⏳ Poza kodem: produkcja, Profil Firmy w Google + opinie, Bing Places, Search Console, linki z pro-kom.eu i od producentów.

## Kolejność (rekomendacja)
PR FAQ (w toku) → PR 1 (sygnały) → PR 2 (`llms.txt`) → decyzja o produkcji → równolegle profil Google i opinie → PR 3 (miejscowości, gdy szef potwierdzi listę i dojazdy).

## Do decyzji
- [SZEF] lista miejscowości obsługiwanych i czasy dojazdu/reakcji (do stron miejscowości i `areaServed`).
- [SZEF] „100+ klientów”, rok założenia — fakty do „O firmie” i `llms.txt`.
- Krystian: kiedy „Biznes gotowy” (bez produkcji nie ma pozycji).
