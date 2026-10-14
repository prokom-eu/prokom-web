# ADR-002: Jeden dostawca — serwer, domeny, poczta

- **Status:** przyjęta wstępnie — Seohost (ostateczna akceptacja kosztów: szef)
- **Data:** 2026-10-12, aktualizacja 2026-10-14
- **Decyduje:** szef (koszty), Krystian (rekomendacja techniczna)

## Kontekst
Domeny i poczta są w nazwa.pl (drogo), prokomserwis.pl na Hetznerze. Cel: jeden polski dostawca na pocztę, domeny, strony i systemy. Na jednym VPS mają stanąć: Next.js + Payload (wiele domen), PostgreSQL, staging i produkcja, później prokomserwis.pl, PRO-KOM System, Strefa Klienta.

## Decyzja
**Seohost:**
- **VPS 4 vCPU / 8 GB RAM / 150 GB** + backup 250 GB (rozliczenie miesięczne; zmiana pakietu bez reinstalacji, z zachowaniem danych i IP).
- **Poczta:** hosting SH4 100 GB (25 zostających skrzynek, ok. 30,5 GB danych). Migracja poczty — bezpłatnie, przez Seohost.
- **Domeny:** transfer pro-kom.eu, pro-kom24.pl, sklepdlafirm.pl/.com; rejestracja prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl.
- Konto u dostawcy na firmę (NIP, e-mail firmowy z dostępem szefa).

Wcześniejsza uwaga „Seohost max 2 vCPU / 4 GB” była błędna — Seohost oferuje VPS do 8 vCPU / 32 GB.

## Konsekwencje
- System: zamawiany Ubuntu 22.04 → na czystym serwerze snapshot i `do-release-upgrade` do 24.04 → dopiero potem Docker (zapas: 22.04 + Ubuntu Pro).
- Obrazy Dockera budujemy w GitHub Actions, nie na serwerze (build Next.js zużywa dużo RAM). Swap 2–4 GB, limity pamięci kontenerów.
- Kolejność migracji poczty i domen: skrzynki i strefa DNS u Seohost → kopia IMAP → przełączenie MX/SPF/DKIM/DMARC → transfer domen → dopiero na końcu zamknięcie nazwa.pl. Obecna pro-kom.eu zostaje na nazwa.pl do grudnia.
- prokomserwis.pl przenosimy osobnym zadaniem (backup poza serwerem, test odtworzenia przed przełączeniem domeny).
- Kopie zapasowe bazy także **poza** tym serwerem (inna lokalizacja/dostawca).
