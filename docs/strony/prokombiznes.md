# Specyfikacja strony: prokombiznes.pl

- **Status:** SZKIC — czeka na akceptację szefa (Asana: „SZEF · Biznes: akceptacja oferty na stronie”, termin 15.10.2026). Nie budować treści finalnych przed akceptacją; strukturę i komponenty można.
- **Tenant:** `biznes` · **Kolor akcentu:** `--accent-biznes`
- **Wygląd i zachowanie:** brief wizualny `docs/strony/prokombiznes-design.md` (szkic). Przy sprzeczności wygrywa ta specyfikacja.
- **Cel biznesowy:** linia z największymi pieniędzmi — klienci firmowi znajdują całą ofertę B2B PRO-KOM w jednym miejscu i wysyłają zapytanie. Miara: liczba zapytań z formularzy (wg kategorii) i kliknięć „Zadzwoń”.
- **Odbiorcy:** firmy B2B, gastronomia, sklepy, hotele i pensjonaty, szkoły, gminy i instytucje, szpitale, uzdrowiska (Podhale i okolice).
- **Wdrożenie:** 26.10.2026.

## Mapa strony
| Adres | Podstrona | Bloki |
|---|---|---|
| `/` | Strona główna | Hero („jeden partner IT dla firmy”), kategorie oferty (kafelki), pasek partnerów, branże, opieka IT, realizacje (jeśli są zdjęcia), CTA + kontakt |
| `/oferta` | Oferta | lista kategorii z opisem, logami partnerów i przyciskiem „Zapytaj o ofertę” |
| `/oferta/<kategoria>` | Kategoria | opis, korzyści, produkty/usługi, partner, formularz zapytania z wybraną kategorią |
| `/uslugi` | Usługi | opieka IT, wdrożenia programów, konfiguracja, serwis u klienta |
| `/dla-kogo` | Branże | blok na każdą branżę: co jej oferujemy |
| `/dofinansowania` | Dofinansowania | jak realizujemy zamówienia sprzętu w projektach z dofinansowaniem, dla kogo, kontakt |
| `/partnerzy` | Partnerzy | loga i krótki opis współpracy |
| `/realizacje` | Realizacje | tylko jeśli szef dostarczy zdjęcia i zgody |
| `/kontakt` | Kontakt | telefon, e-mail, adres, mapa, formularz |
| `/polityka-prywatnosci` | Prawne | RODO |

## Kategorie oferty (propozycja do akceptacji)
1. **Kasy fiskalne** — Posnet, Elzab: sprzedaż, fiskalizacja, serwis i przeglądy.
2. **System dla gastronomii i handlu** — oprogramowanie GoPOS + sprzęt Sunmi; wdrożenie i szkolenie.
3. **Programy dla firm** — InsERT (Subiekty i inne), Microsoft Office (pakiety + konfiguracja), ESET.
4. **Podpis kwalifikowany** — Eurocert.
5. **Sprzęt biznesowy** — komputery i laptopy Lenovo (tylko najpopularniejsze modele), monitory, projektory, tablice multimedialne.
6. **Opieka IT i wdrożenia** — stała opieka, wdrożenia programów, konfiguracja.
7. **Dofinansowania** — zamówienia sprzętu w projektach z dofinansowaniem.
8. **Serwery i sieć** — TYLKO jeśli szef zdecyduje „Biznes”, nie „Instalacje”.

Do decyzji szefa (mogą dojść): KSeF, terminale płatnicze, akcesoria POS (drukarki paragonów/etykiet, czytniki kodów, szuflady, wagi), drukarki i urządzenia wielofunkcyjne, Microsoft 365, kopie zapasowe i NAS, UPS, inne programy InsERT, leasing/raty, przetargi, umowy serwisowe.

## Formularze
| Formularz | Pola | Gdzie trafia |
|---|---|---|
| Zapytaj o ofertę | firma, NIP (opcjonalnie), imię i nazwisko, telefon, e-mail, kategoria (wstępnie wybrana), wiadomość, zgoda RODO | skrzynka zapytań (ADR-003) + e-mail do osoby wskazanej przez szefa |
| Kontakt | imię, telefon/e-mail, wiadomość, zgoda RODO | jw. |

## Ceny
Domyślnie bez cen — „Zapytaj o ofertę” (do potwierdzenia przez szefa).

## Materiały (od szefa)
- Lista oficjalnych partnerów + oficjalne pliki log.
- Zdjęcia z wdrożeń GoPOS, kas, sprzętu — i zgody klientów.
- Telefon, e-mail, osoba odbierająca zapytania.
- Najpopularniejsze modele Lenovo (3–5).

## SEO (wstępnie)
Frazy lokalne: kasy fiskalne Nowy Targ / Rabka / Zakopane / Podhale, GoPOS Podhale, system dla restauracji Podhale, opieka IT dla firm Nowy Targ, InsERT Subiekt wdrożenie, podpis kwalifikowany Rabka.

## Przekierowania 301
Ze starej pro-kom.pl i pro-kom.eu (sekcje B2B) — lista powstaje w zadaniu „Instalacje: mapa przekierowań pro-kom.pl” (eksport z Search Console).

## Poza zakresem (świadomie)
- Sklep B2B z koszykiem i płatnościami — faza 2.
- Logowanie klientów — Strefa Biznes w lutym 2027.
