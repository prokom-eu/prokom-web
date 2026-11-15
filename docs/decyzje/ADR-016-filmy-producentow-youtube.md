# ADR-016: Filmy producentów z YouTube — fasada, youtube-nocookie, sprawdzanie oEmbed

- **Status:** przyjęta (26.10.2026, sesja KD — rekomendacja D3)
- **Data:** 2026-10-26
- **Decyduje:** Krystian (technika); akapit w polityce cookies — szef/prawnik

## Kontekst
- K3.1 (`docs/design/prokombiznes/K31-ZMIANY.md` §4, §6, §7) dodaje na prokombiznes.pl filmy producentów: na stronie produktu (122 produkty z filmem wg `seed/prokombiznes/k31/wideo-k31.json`), w popupie Planu Twojej firmy, w salonach Lenovo/Dell i na stronach GoPOS/InsERT.
- `CLAUDE.md`: żadnych zewnętrznych usług bez ADR. YouTube to usługa zewnętrzna (ramka, skrypty, cookies Google).
- Wymagania: Lighthouse telefon ≥ 90, bez banera zgód (spec. prokombiznes §1, `AUDYT-PRODUKCJA.md` §5.1–5.2), jedna osoba utrzymuje — bez nowych kontenerów i płatnych usług.
- Filmy znikają z YouTube (usunięte, prywatne) — bez sprawdzania strona pokazywałaby martwe ramki.

## Opcje
| Opcja | Zalety | Wady | Koszt |
|---|---|---|---|
| A. Zwykły `<iframe>` YouTube od razu | najprostsze | skrypty i cookies Google przy każdym wejściu, ciężka strona (Lighthouse), potrzebny baner zgód | 0 zł |
| B. Biblioteka „lite embed” (np. `lite-youtube-embed`) | gotowa fasada | nowa zależność dla kilkunastu linii kodu, własne style do nadpisania pod markę | 0 zł |
| C. Własna fasada + `youtube-nocookie.com` po kliknięciu | zero żądań do Google przed kliknięciem, wygląd z planszy, brak zależności | kilkadziesiąt linii własnego kodu | 0 zł |
| D. Filmy u siebie (pliki MP4) | pełna kontrola | prawa do plików producentów, transfer i miejsce na VPS, kodowanie | ryzyko prawne + dysk |

## Decyzja
Wybieramy **C**, ponieważ daje szybką stronę i brak cookies przed świadomym kliknięciem bez nowej zależności, a wygląd fasady i tak jest z planszy K3.1.
- **Fasada** (komponent serwerowy + mała wyspa kliencka): plakat = zdjęcie produktu na ciemnym tle (nasze `Media`, nie miniatura z YouTube — zero żądań do Google przed kliknięciem), tytuł, kanał, język, przycisk ▶ z `aria-label`.
- **Po kliknięciu:** `<iframe src="https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&playsinline=1" title="…" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy">`. Zmiana urządzenia w popupie planu usuwa ramkę (zatrzymuje film).
- **Dane:** `Products.videos[]` {`youtubeId`, `title`, `channel`, `lang`, `match`: model | seria | marka, `active`}; filmy serii w danych salonu (`Partners`, ADR-012 rozstrz. 15); filmy stron GoPOS/InsERT w ich blokach. Import z `wideo-k31.json` (K31a), dalej edycja w panelu. Tylko oficjalne kanały producentów. `youtubeId` walidowany wzorcem `^[A-Za-z0-9_-]{11}$`.
- **Sprawdzanie dostępności:** zadanie Payload (ADR-011, istniejący `jobs.autoRun` — bez nowego crona systemowego i kontenera) raz w tygodniu woła `https://www.youtube.com/oembed?url=…&format=json` dla każdego aktywnego filmu; 401/404 → `active = false` i jeden zbiorczy mail do administratora (adres z env/panelu, przez istniejący transport poczty). Błąd sieci/5xx — bez zmiany stanu (nie wyłączamy filmów przy chwilowej awarii). Wyłączony film = sekcja filmu znika, w popupie planu zdjęcie.
- **SEO:** `VideoObject` (name, `thumbnailUrl` z `i.ytimg.com`, `embedUrl` youtube-nocookie, `uploadDate` z danych importu/oEmbed) — tylko w JSON-LD, obrazek nie jest ładowany przez przeglądarkę.
- **CSP (sesja PROD):** `frame-src https://www.youtube-nocookie.com`; `img-src` bez `i.ytimg.com` (plakaty z naszych mediów). Nginx/next.config — `AUDYT-PRODUKCJA.md` §9.
- **Polityka cookies:** akapit o YouTube (odtwarzanie dopiero po kliknięciu, tryb youtube-nocookie) — szkic w spec. prokombiznes §6.13, do treści `/cookies` w K31b; akceptacja szefa/prawnika przed produkcją.

## Konsekwencje
- Strona przy wejściu nie łączy się z Google; test e2e (K31b) sprawdza, że przed kliknięciem „▶” nie ma żądań do `youtube.com`, `youtube-nocookie.com`, `ytimg.com`, `googlevideo.com`.
- Po kliknięciu obowiązują zasady Google — opisane w polityce cookies; baneru zgód nie dodajemy, dopóki nie ma innych usług wymagających zgody (wracamy do decyzji przy analityce z cookies albo osadzeniach map).
- Filmy wyłączone przez zadanie trzeba przejrzeć w panelu (raport kwartalny z `AUDYT-PRODUKCJA.md` §8 „filmy nieaktywne”).
- Wracamy do decyzji, gdy: YouTube zmieni zasady trybu nocookie, Lighthouse spadnie przez ramki, albo pojawią się filmy własne PRO-KOM (wtedy rozważyć D na własnym hostingu).
