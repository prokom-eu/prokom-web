# ADR-001: Jedna aplikacja Next.js + Payload CMS 3 (multi-tenant) dla wszystkich nowych stron

- **Status:** przyjęta
- **Data:** 2026-10-09 (potwierdzona 2026-10-12)
- **Decyduje:** Krystian; zaakceptowane przez szefa w dokumencie „PRO-KOM cyfryzacja 2026–2027”

## Kontekst
W 2026 powstają 3–4 nowe strony (Biznes, Instalacje, Software, nowa pro-kom.eu). Buduje i utrzymuje je jedna osoba. Szef chce zmieniać treści sam, w jednym miejscu, a wspólne dane (telefony, adresy, godziny) zmieniać raz dla wszystkich stron.

## Opcje
| Opcja | Zalety | Wady |
|---|---|---|
| A. Osobna aplikacja na każdą stronę | izolacja | 4× utrzymanie, 4× panel, duplikacja kodu |
| B. **Jedna aplikacja Next.js + Payload 3 + plugin Multi-Tenant** | jeden kod, jeden panel, wspólne komponenty, wspólne dane firmy | trzeba pilnować filtra tenanta |
| C. Płatny CMS w chmurze (Storyblok, Sanity) | gotowe UI | koszty abonamentu, dane poza firmą |
| D. Wagtail / Django CMS | ten sam język co serwis | słabsza obsługa wielu stron, gorszy frontend i wydajność stron |

## Decyzja
Opcja B. Payload 3 działa wewnątrz Next.js, ma oficjalny plugin Multi-Tenant, Live Preview, wersje robocze, przekierowania i SEO; jest open source i działa na naszym serwerze z PostgreSQL.

## Konsekwencje
- Każde zapytanie do treści musi filtrować po tenancie — pilnowane w helperach `lib/` i w `/przeglad`.
- Fundament budujemy przy pierwszej stronie (prokombiznes.pl), kolejne strony to nowy tenant + treści + ewentualne nowe bloki.
- Payload służy tylko do treści stron; procesy sprzedaży (zapytania, oferty) docelowo w PRO-KOM System (Django).
