# Komponenty prokominstalacje.pl — mapa: prototyp → React

Jak przenosić: ADR-I003 §2. Ścieżki docelowe są propozycją — I0 dopasowuje je do struktury repo (tak jak Biznes/Software).

## 1. Powłoka linii (`src/sites/instalacje/powloka/`) — sesja I3
| Komponent | Źródło w prototypie | Uwagi |
|---|---|---|
| `TopBar` | `zrodlo/header.html` (górny pasek) | godziny na żywo z ustawień firmy w panelu (pn–pt 9–17 tylko jako dane startowe — szef potwierdza godziny i soboty), strefa Europe/Warsaw, liczone na kliencie po hydratacji — na serwerze neutralny tekst; „Tech · naprawy sprzętu”, „Zgłoś awarię”, telefon |
| `Header` + `MegaMenu` | `header.html`, `common.js` (`mg`, `uOpen/uTog/megaClose/megaKeep`) | most nad panelem, opóźnienie 280 ms, klik przełącza, Esc, focus; desktop ≥ 1101 px |
| `MobileHeader` | `header.html` (`mobb`), `common.js` (`hdrHide`, `_onS`) | chowany przy przewijaniu |
| `BottomTabBar` | `footer.html` (`bnav`), `common.js` (`BN`, `bnav`) | 5 kart, aktywna wg `navKey` strony |
| `BottomSheet` + `MenuSheet` | `footer.html` (`msh`), `common.js` (`openSheet`, `mtabs`, `mmore`) | 3 zakładki; MOBILE-APLIKACJA §4; `BottomSheet` wspólny z Software (`src/components`), `TabBar` własny — ADR-I004 |
| `ThemeToggle` | `common.js` (`toggleTheme`, `pk-theme`) | skrypt w `<head>` bez mignięcia |
| `SectionRail` | `Main.body.html` (`railItems`) | tylko strona główna, ≥ 1400 px |
| `AnchorsBar` | `inc/pheroA.html` (`anc`) | przyklejony pod nagłówkiem |
| `CtaBand` + `Footer` | `footer.html` | pas CTA (wyłączany na głównej — `cta:false` w meta), stopka z usługami, obiektami, firmą, stronami PRO-KOM, NIP, linki prawne |

## 2. Sekcje wspólne (`src/sites/instalacje/sekcje/`) — sesja I4
| Komponent | Źródło | Używają |
|---|---|---|
| `PageHero` | `inc/pheroA.html` + `pheroB.html` | wszystkie usługi, obiekty, Serwis, Teletechnika; prawa kolumna = slot na widżet |
| `GuaranteeSection` | `inc/odbsec.html` | usługi i obiekty (3 karty: gwarancja 24 mies., odpowiedź do 24 h w dni robocze, „Masz już instalację?”) |
| `Packages` | `inc/pkgs.html` | usługi i obiekty; cena z przełącznikiem `pokazCeny` |
| `PriceFactors` | `inc/cena.html` | usługi; przycisk z `sx.cena.btn` |
| `Faq` | `inc/faqsec.html` | wszędzie; pierwsza otwarta, `FAQPage` JSON-LD |
| `Related` | `inc/relsec.html` | usługi i obiekty: powiązane usługi + pasek „Podobne obiekty” (`segRel`) |
| `Fold` | `zrodlo/fold.json` (lista sekcji i wysokość; w prototypie zwijanie dodawał skrypt budujący: sekcja dostaje `data-fo` i przycisk na końcu) | telefon: zwinięcie sekcji |
| `Reveal` / `useReveal` | `common.js` (IntersectionObserver, `rv`) | animacja wejścia |

## 3. Strona główna — sesje I5–I6
| Komponent | Źródło | Opis |
|---|---|---|
| `LiveObjectHero` | `Main.body.html` `#start`, `Main.js` (`obj, mode, layers, touched`, sceny `sc`, `pip`, `otabs`, `modes`, `chips`) | scena SVG 6 obiektów × 3 pory, warstwy instalacji, podgląd kamery, panel zdarzeń, autoodtwarzanie; przekazuje wybór do kreatora |
| `ForWhoGrid` | `#dla-kogo` | 12 obiektów (z `wspolne.json → SG`) |
| `ServicesGrid` | `#uslugi` (`us`, `u.*`) | 10 kart z mini-ilustracjami i kolorami usług |
| `Realizations` | `#realizacje` | placeholdery do czasu zdjęć |
| `MountainsSection` | `#gory` | mróz, burze, łącze… |
| `ProcessSteps` | `#proces` | 6 kroków |
| `ServiceTeaser` | `#serwis` | serwis i przeglądy |
| `QuickPlanForm` | `#zaplanuj` (`kSvc, kObj, kTown, kPh, kCons…`) | mini-formularz → zapytanie `inst-glowna` |

## 4. Widżety usług (`src/sites/instalacje/widzety/<usluga>/`) — sesje I7–I9
Stan początkowy = `initState()` z pliku źródła; logika = `page()`; timery = `mountPage()`.
| Strona | Źródło | Widżety (sekcje) |
|---|---|---|
| Monitoring | `Monitoring.*` (`sv, se, mode, sel, ai, mask, deter, typ, res, lens, dist, n, br, tb`) | hero: podgląd kamery z przełącznikami (wykrywanie, maska, odstraszanie) · `#system` schemat wersji instalacji z elementami · `#typy` rodzaje kamer · `#ile-widac` kalkulator ile widać · `#nagrania` kalkulator dni nagrań · `#rodo` · `#sprzet-kamery` |
| Alarmy | `Alarmy.*` (`avs, dday, dmq, amode, sim, vd`) | symulator zdarzeń, tryby czuwania, wideodomofon (2 timery) |
| Kontrola dostępu | `Dostep.*` (`tab, code, res, hist, idI, pw`) | zakładki obiektów, klawiatura z kodem i historią |
| Sieci i Wi-Fi | `Sieci.*` (`wb, ww, cl, cs, ld, lg, ls, fo, wm, vl, wlM, wlB, brD, brL`) | kalkulator punktów, sieci osobne, łącze |
| Teletechnika | `Teletechnika.*` (`tl, stp, el, rTyp, rZak, rLok, rName…`) | warstwy budynku, etapy, **formularz przedmiaru** (w wersji 1 bez uploadu plików — ADR-I002 §4) |
| Anteny | `Anteny.*` (`mode, az, el, mast, ph, q1, q2, flt`) | ustawianie anteny, quiz |
| Smart home | `SmartHome.*` | mapa 12 obszarów Ampio, scenariusze |
| Nagłośnienie | `Naglosnienie.*` (`apk, lm, ann, kv, kr, kc, ia, ih, im, ven, lv, mu, src, pri`) | strefy z głośnością, komunikaty z priorytetem, kalkulatory |
| Ekrany | `Multimedia.*` (`pr, prv, jp, jr, ldp, tab, sl`) | harmonogram treści, kalkulatory |
| Ładowarki | `Ladowarki.*` (`sh, shT, cm, hp, ho, wp, wk, wo, wm, wc, cp, ck, co`, kalkulator `path, bat, rg, pw, obc`) | prezentacja modeli (autoodtwarzanie 4,6 s), karty oferty, konfigurator wersji, tabela porównania, kalkulator czasu ładowania (animacja 0,9 s) |

## 5. Strony „Dla kogo” — sesja I10
| Komponent | Źródło | Opis |
|---|---|---|
| `ObjectPage` (szablon) | `generator-obiektow/build_seg.py` (BODY, JS), `Seg*.body.html` | wszystkie sekcje z danych `InstObjects` |
| `ObjectScene<Klucz>` (12 SVG) | `Seg<Nazwa>.body.html` (scena), `generator-obiektow/scenes.py`, `lib.py` | przekrój z hotspotami (`hs`), legenda warstw (`ly`), autoodtwarzanie (`calm()` — pauza poza ekranem i przy ograniczeniu ruchu) |
| `DayTimeline` | `dy, dyT` | doba z instalacjami |
| `LawCards` | `law` | przepisy (bez źródeł) + zdanie „To nie jest porada prawna” |
| `PrepChecklist` | `ck` | „co przygotować” z odhaczaniem |
| `Noclegowe` | `Noclegowe.*` | rozbudowana strona pensjonatów (ten sam szablon + sekcje dodatkowe) |

## 6. Pozostałe strony — sesje I11–I12
| Strona | Źródło | Kluczowe |
|---|---|---|
| Zaplanuj | `Zaplanuj.*` (`step, svc, uns, pre, obj, size, stage, ans`, `mountPage` czyta `#obiekt=&uslugi=`) | kreator 4 kroków, wynik z numerem |
| Kontakt | `Kontakt.*` (`q, topic, fName, fPh, fMsg, fCons, fErr, fSent`) | formularz z walidacją, salony, mapa dojazdu |
| Serwis | `Serwis.*` (`who, sys, sym, urg, sent, ph, town, err`) | zgłoszenie awarii `#zglos` |
| Oferta | `Oferta.*` (`q, o, open`) | 76 rozwiązań, filtr, wyszukiwarka |
| Realizacje | `Realizacje.*` (`fs, fo, more`) | filtr |
| Poradnik / RODO | `Poradnik.*`, `PoradnikRodo.*` (`cat`, `qz`) | lista wpisów, wpis z quizem |
| O firmie | `OFirmie.*` | statyczna |

## 7. Ikony
`zrodlo/common.js → icons()` — ok. 90 ścieżek SVG (24×24, obrys). Przenieść do `src/sites/instalacje/icons.ts` jako mapę `nazwa → d`; komponent `<Icon name size strokeWidth />`. Ikony w seedzie są zapisane jako `ikona:<nazwa>` (np. `SV[].ic = "ikona:cam"`) — nazwa = klucz w `icons()`. `[svg-path]` zostaje tylko tam, gdzie to geometria rysunku (sceny), nie ikona.
