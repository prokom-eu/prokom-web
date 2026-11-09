# Zdjęcia kart do ponownego wycięcia

Wygenerowane: `node scripts/zdjecia-tlo.mjs` (NAPRAWA-0911 §3b, audyt stagingu 09.11). Sprawdzono 1797 zdjęć z paczek seeda; na liście 407.

- **białe tło** — brzeg zdjęcia nieprzezroczysty i prawie biały (produkt na białym prostokącie). Od NAPRAWA-0911 karty stoją na białej płycie, więc to już nie razi, ale przezroczyste zdjęcie wygląda lepiej w hero i galerii.
- **otoczka** — tło przezroczyste, ale kontur produktu w większości bardzo jasny: biały „obłok” po wycinaniu. Do poprawy w pierwszej kolejności.

Poprawka: ponowne wycięcie do przezroczystego WebP/PNG (Krystian) albo zdjęcie producenta z przezroczystością — ten sam plik w paczce, potem `pnpm seed:biznes` i import na staging. Na górze zdjęcia ze zrzutów z audytu (Sunmi D3 PRO, PolCard).

To lista do przejrzenia, nie do ślepej poprawki: czysto wycięty biały produkt (drukarka, terminal) też ma jasny kontur i trafia do „otoczki”.

| slug | plik | problem |
|---|---|---|
| d3 | `seed/prokombiznes/media/produkty/d3/d3-03.webp` | białe tło (100%) |
| d3 | `seed/prokombiznes/media/produkty/d3/d3-04.webp` | białe tło (100%) |
| aio | `seed/prokombiznes/media/produkty/aio/aio-01.webp` | białe tło (100%) |
| avtek | `seed/prokombiznes/media/produkty/avtek/avtek-01.webp` | białe tło (100%) |
| avtek | `seed/prokombiznes/media/produkty/avtek/avtek-02.webp` | białe tło (100%) |
| bingo | `seed/prokombiznes/media/produkty/bingo/bingo-01.webp` | białe tło (100%) |
| bingo | `seed/prokombiznes/media/produkty/bingo/bingo-02.webp` | białe tło (100%) |
| cube | `seed/prokombiznes/media/produkty/cube/cube-01.webp` | białe tło (100%) |
| cube | `seed/prokombiznes/media/produkty/cube/cube-02.webp` | białe tło (100%) |
| cube | `seed/prokombiznes/media/produkty/cube/cube-03.webp` | białe tło (100%) |
| d2s | `seed/prokombiznes/media/produkty/d2s/d2s-02.webp` | białe tło (100%) |
| dibal-d-545-s-545 | `seed/prokombiznes/media/produkty/dibal-d-545-s-545/dibal-d-545-s-545-06.webp` | białe tło (100%) |
| dibal-d-955 | `seed/prokombiznes/media/produkty/dibal-d-955/dibal-d-955-01.webp` | białe tło (100%) |
| dibal-d-955 | `seed/prokombiznes/media/produkty/dibal-d-955/dibal-d-955-02.webp` | białe tło (100%) |
| dibal-d-955 | `seed/prokombiznes/media/produkty/dibal-d-955/dibal-d-955-03.webp` | białe tło (100%) |
| dibal-d-955 | `seed/prokombiznes/media/produkty/dibal-d-955/dibal-d-955-04.webp` | białe tło (100%) |
| dibal-dmi-610 | `seed/prokombiznes/media/produkty/dibal-dmi-610/dibal-dmi-610-03.webp` | białe tło (100%) |
| dibal-m-525 | `seed/prokombiznes/media/produkty/dibal-m-525/dibal-m-525-01.webp` | białe tło (100%) |
| dibal-m-525 | `seed/prokombiznes/media/produkty/dibal-m-525/dibal-m-525-02.webp` | białe tło (100%) |
| dibal-spc | `seed/prokombiznes/media/produkty/dibal-spc/dibal-spc-01.webp` | białe tło (100%) |
| dibal-spc | `seed/prokombiznes/media/produkty/dibal-spc/dibal-spc-02.webp` | białe tło (100%) |
| dibal-spc | `seed/prokombiznes/media/produkty/dibal-spc/dibal-spc-03.webp` | białe tło (100%) |
| dibal-spc | `seed/prokombiznes/media/produkty/dibal-spc/dibal-spc-04.webp` | białe tło (100%) |
| dibal-vc-pvc-ps-wagi-kontrolne | `seed/prokombiznes/media/produkty/dibal-vc-pvc-ps-wagi-kontrolne/dibal-vc-pvc-ps-wagi-kontrolne-01.webp` | białe tło (100%) |
| dibal-vc-pvc-ps-wagi-kontrolne | `seed/prokombiznes/media/produkty/dibal-vc-pvc-ps-wagi-kontrolne/dibal-vc-pvc-ps-wagi-kontrolne-02.webp` | białe tło (100%) |
| dibal-vc-pvc-ps-wagi-kontrolne | `seed/prokombiznes/media/produkty/dibal-vc-pvc-ps-wagi-kontrolne/dibal-vc-pvc-ps-wagi-kontrolne-03.webp` | białe tło (100%) |
| dibal-vc-pvc-ps-wagi-kontrolne | `seed/prokombiznes/media/produkty/dibal-vc-pvc-ps-wagi-kontrolne/dibal-vc-pvc-ps-wagi-kontrolne-04.webp` | białe tło (100%) |
| dibal-vc-pvc-ps-wagi-kontrolne | `seed/prokombiznes/media/produkty/dibal-vc-pvc-ps-wagi-kontrolne/dibal-vc-pvc-ps-wagi-kontrolne-05.webp` | białe tło (100%) |
| dibal-w-025 | `seed/prokombiznes/media/produkty/dibal-w-025/dibal-w-025-01.webp` | białe tło (100%) |
| dibal-w-025 | `seed/prokombiznes/media/produkty/dibal-w-025/dibal-w-025-02.webp` | białe tło (100%) |
| dibal-waga-g-325 | `seed/prokombiznes/media/produkty/dibal-waga-g-325/dibal-waga-g-325-01.webp` | białe tło (100%) |
| druks | `seed/prokombiznes/media/produkty/druks/druks-01.webp` | białe tło (100%) |
| ds | `seed/prokombiznes/media/produkty/ds/ds-01.webp` | białe tło (100%) |
| ds | `seed/prokombiznes/media/produkty/ds/ds-02.webp` | białe tło (100%) |
| ds | `seed/prokombiznes/media/produkty/ds/ds-03.webp` | białe tło (100%) |
| ds | `seed/prokombiznes/media/produkty/ds/ds-07.webp` | białe tło (100%) |
| elzab-adapter-szuflady | `seed/prokombiznes/media/produkty/elzab-adapter-szuflady/elzab-adapter-szuflady-01.webp` | białe tło (100%) |
| elzab-czytnik-kodow-bs80-2d-usb-kit-z-podstawka | `seed/prokombiznes/media/produkty/elzab-czytnik-kodow-bs80-2d-usb-kit-z-podstawka/elzab-czytnik-kodow-bs80-2d-usb-kit-z-podstawka-01.webp` | białe tło (100%) |
| elzab-drukarka-paragonowa-elz-rp332a | `seed/prokombiznes/media/produkty/elzab-drukarka-paragonowa-elz-rp332a/elzab-drukarka-paragonowa-elz-rp332a-01.webp` | białe tło (100%) |
| elzab-drukarka-paragonowa-elz-rp332a | `seed/prokombiznes/media/produkty/elzab-drukarka-paragonowa-elz-rp332a/elzab-drukarka-paragonowa-elz-rp332a-02.webp` | białe tło (100%) |
| elzab-drukarka-stacji-paliw-df-6-online | `seed/prokombiznes/media/produkty/elzab-drukarka-stacji-paliw-df-6-online/elzab-drukarka-stacji-paliw-df-6-online-01.webp` | białe tło (100%) |
| elzab-konwerter-usb-rs232 | `seed/prokombiznes/media/produkty/elzab-konwerter-usb-rs232/elzab-konwerter-usb-rs232-01.webp` | białe tło (100%) |
| elzab-modul-wifi-do-drukarki-d10 | `seed/prokombiznes/media/produkty/elzab-modul-wifi-do-drukarki-d10/elzab-modul-wifi-do-drukarki-d10-01.webp` | białe tło (100%) |
| elzab-modul-zasilania-mzas-do-sieci-lan | `seed/prokombiznes/media/produkty/elzab-modul-zasilania-mzas-do-sieci-lan/elzab-modul-zasilania-mzas-do-sieci-lan-01.webp` | białe tło (100%) |
| elzab-nakladki-na-klawiature | `seed/prokombiznes/media/produkty/elzab-nakladki-na-klawiature/elzab-nakladki-na-klawiature-01.webp` | białe tło (100%) |
| elzab-przejsciowka-szuflady-gamma-z-interfejsem | `seed/prokombiznes/media/produkty/elzab-przejsciowka-szuflady-gamma-z-interfejsem/elzab-przejsciowka-szuflady-gamma-z-interfejsem-01.webp` | białe tło (100%) |
| elzab-sprawdzarki-cen-llt-lwt-lft-2d | `seed/prokombiznes/media/produkty/elzab-sprawdzarki-cen-llt-lwt-lft-2d/elzab-sprawdzarki-cen-llt-lwt-lft-2d-01.webp` | białe tło (100%) |
| elzab-sprawdzarki-cen-llt-lwt-lft-2d | `seed/prokombiznes/media/produkty/elzab-sprawdzarki-cen-llt-lwt-lft-2d/elzab-sprawdzarki-cen-llt-lwt-lft-2d-02.webp` | białe tło (100%) |
| elzab-sprawdzarki-cen-llt-lwt-lft-2d | `seed/prokombiznes/media/produkty/elzab-sprawdzarki-cen-llt-lwt-lft-2d/elzab-sprawdzarki-cen-llt-lwt-lft-2d-03.webp` | białe tło (100%) |
| elzab-sprawdzarki-cen-llt-lwt-lft-2d | `seed/prokombiznes/media/produkty/elzab-sprawdzarki-cen-llt-lwt-lft-2d/elzab-sprawdzarki-cen-llt-lwt-lft-2d-04.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-01.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-02.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-03.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-04.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-05.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-06.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-07.webp` | białe tło (100%) |
| elzab-stojak-ramie-i-uchwyty | `seed/prokombiznes/media/produkty/elzab-stojak-ramie-i-uchwyty/elzab-stojak-ramie-i-uchwyty-08.webp` | białe tło (100%) |
| elzab-szuflada-aktywna-elz-350-elz-410 | `seed/prokombiznes/media/produkty/elzab-szuflada-aktywna-elz-350-elz-410/elzab-szuflada-aktywna-elz-350-elz-410-01.webp` | białe tło (100%) |
| elzab-szuflada-aktywna-elz-350-elz-410 | `seed/prokombiznes/media/produkty/elzab-szuflada-aktywna-elz-350-elz-410/elzab-szuflada-aktywna-elz-350-elz-410-02.webp` | białe tło (100%) |
| elzab-szuflada-aktywna-elz-350-elz-410 | `seed/prokombiznes/media/produkty/elzab-szuflada-aktywna-elz-350-elz-410/elzab-szuflada-aktywna-elz-350-elz-410-03.webp` | białe tło (100%) |
| elzab-szuflada-aktywna-elz-350-elz-410 | `seed/prokombiznes/media/produkty/elzab-szuflada-aktywna-elz-350-elz-410/elzab-szuflada-aktywna-elz-350-elz-410-04.webp` | białe tło (100%) |
| elzab-szuflada-flip-top-elz-ft460 | `seed/prokombiznes/media/produkty/elzab-szuflada-flip-top-elz-ft460/elzab-szuflada-flip-top-elz-ft460-01.webp` | białe tło (100%) |
| elzab-szuflada-flip-top-elz-ft460 | `seed/prokombiznes/media/produkty/elzab-szuflada-flip-top-elz-ft460/elzab-szuflada-flip-top-elz-ft460-02.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-duza-elz-410-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-duza-elz-410-rj-pro/elzab-szuflada-kasowa-duza-elz-410-rj-pro-01.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-duza-elz-410-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-duza-elz-410-rj-pro/elzab-szuflada-kasowa-duza-elz-410-rj-pro-02.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-duza-elz-410-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-duza-elz-410-rj-pro/elzab-szuflada-kasowa-duza-elz-410-rj-pro-03.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-duza-elz-410-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-duza-elz-410-rj-pro/elzab-szuflada-kasowa-duza-elz-410-rj-pro-04.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-elz-240-elz-350-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro-01.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-elz-240-elz-350-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro-02.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-elz-240-elz-350-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro-03.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-elz-240-elz-350-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro-04.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-elz-240-elz-350-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro-05.webp` | białe tło (100%) |
| elzab-szuflada-kasowa-elz-240-elz-350-rj-pro | `seed/prokombiznes/media/produkty/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro/elzab-szuflada-kasowa-elz-240-elz-350-rj-pro-06.webp` | białe tło (100%) |
| elzab-torby-i-etui-na-kasy | `seed/prokombiznes/media/produkty/elzab-torby-i-etui-na-kasy/elzab-torby-i-etui-na-kasy-03.webp` | białe tło (100%) |
| elzab-torby-i-etui-na-kasy | `seed/prokombiznes/media/produkty/elzab-torby-i-etui-na-kasy/elzab-torby-i-etui-na-kasy-04.webp` | białe tło (100%) |
| elzab-torby-i-etui-na-kasy | `seed/prokombiznes/media/produkty/elzab-torby-i-etui-na-kasy/elzab-torby-i-etui-na-kasy-05.webp` | białe tło (100%) |
| elzab-waga-neptun-2 | `seed/prokombiznes/media/produkty/elzab-waga-neptun-2/elzab-waga-neptun-2-01.webp` | białe tło (100%) |
| elzab-waga-prima-2 | `seed/prokombiznes/media/produkty/elzab-waga-prima-2/elzab-waga-prima-2-01.webp` | białe tło (100%) |
| elzab-waga-prima-2 | `seed/prokombiznes/media/produkty/elzab-waga-prima-2/elzab-waga-prima-2-02.webp` | białe tło (100%) |
| elzab-waga-saturn-2-2m | `seed/prokombiznes/media/produkty/elzab-waga-saturn-2-2m/elzab-waga-saturn-2-2m-01.webp` | białe tło (100%) |
| elzab-waga-saturn-2-2m | `seed/prokombiznes/media/produkty/elzab-waga-saturn-2-2m/elzab-waga-saturn-2-2m-02.webp` | białe tło (100%) |
| elzab-waga-saturn-2-2m | `seed/prokombiznes/media/produkty/elzab-waga-saturn-2-2m/elzab-waga-saturn-2-2m-03.webp` | białe tło (100%) |
| elzab-wago-skaner-neptun-2-mgl-9550i-9900i | `seed/prokombiznes/media/produkty/elzab-wago-skaner-neptun-2-mgl-9550i-9900i/elzab-wago-skaner-neptun-2-mgl-9550i-9900i-01.webp` | białe tło (100%) |
| elzab-wago-skaner-neptun-2-mgl-9550i-9900i | `seed/prokombiznes/media/produkty/elzab-wago-skaner-neptun-2-mgl-9550i-9900i/elzab-wago-skaner-neptun-2-mgl-9550i-9900i-02.webp` | białe tło (100%) |
| elzab-wago-skaner-neptun-2-mgl-9550i-9900i | `seed/prokombiznes/media/produkty/elzab-wago-skaner-neptun-2-mgl-9550i-9900i/elzab-wago-skaner-neptun-2-mgl-9550i-9900i-03.webp` | białe tło (100%) |
| elzab-wago-skaner-neptun-2-mgl-9550i-9900i | `seed/prokombiznes/media/produkty/elzab-wago-skaner-neptun-2-mgl-9550i-9900i/elzab-wago-skaner-neptun-2-mgl-9550i-9900i-04.webp` | białe tło (100%) |
| elzab-wago-skaner-saturn-2-mgl-3510-3550 | `seed/prokombiznes/media/produkty/elzab-wago-skaner-saturn-2-mgl-3510-3550/elzab-wago-skaner-saturn-2-mgl-3510-3550-01.webp` | białe tło (100%) |
| elzab-wago-skaner-saturn-2-mgl-3510-3550 | `seed/prokombiznes/media/produkty/elzab-wago-skaner-saturn-2-mgl-3510-3550/elzab-wago-skaner-saturn-2-mgl-3510-3550-02.webp` | białe tło (100%) |
| elzab-zewnetrzny-wyswietlacz-klienta | `seed/prokombiznes/media/produkty/elzab-zewnetrzny-wyswietlacz-klienta/elzab-zewnetrzny-wyswietlacz-klienta-01.webp` | białe tło (100%) |
| elzab-zewnetrzny-wyswietlacz-klienta | `seed/prokombiznes/media/produkty/elzab-zewnetrzny-wyswietlacz-klienta/elzab-zewnetrzny-wyswietlacz-klienta-02.webp` | białe tło (100%) |
| elzkiosk | `seed/prokombiznes/media/produkty/elzkiosk/elzkiosk-01.webp` | białe tło (100%) |
| elzkiosk | `seed/prokombiznes/media/produkty/elzkiosk/elzkiosk-02.webp` | białe tło (100%) |
| emenu | `seed/prokombiznes/media/produkty/emenu/emenu-01.webp` | białe tło (100%) |
| ergo | `seed/prokombiznes/media/produkty/ergo/ergo-01.webp` | białe tło (100%) |
| ergo | `seed/prokombiznes/media/produkty/ergo/ergo-02.webp` | białe tło (100%) |
| evo | `seed/prokombiznes/media/produkty/evo/evo-01.webp` | białe tło (100%) |
| evo | `seed/prokombiznes/media/produkty/evo/evo-02.webp` | białe tło (100%) |
| evo | `seed/prokombiznes/media/produkty/evo/evo-03.webp` | białe tło (100%) |
| evo | `seed/prokombiznes/media/produkty/evo/evo-04.webp` | białe tło (100%) |
| fbox | `seed/prokombiznes/media/produkty/fbox/fbox-01.webp` | białe tło (100%) |
| fbox | `seed/prokombiznes/media/produkty/fbox/fbox-02.webp` | białe tło (100%) |
| fbox | `seed/prokombiznes/media/produkty/fbox/fbox-03.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-01.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-02.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-03.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-04.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-05.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-06.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-07.webp` | białe tło (100%) |
| fw | `seed/prokombiznes/media/produkty/fw/fw-08.webp` | białe tło (100%) |
| godex-drukarka-etykiet-ez6200-plus | `seed/prokombiznes/media/produkty/godex-drukarka-etykiet-ez6200-plus/godex-drukarka-etykiet-ez6200-plus-01.webp` | białe tło (100%) |
| godex-drukarka-etykiet-rt863i | `seed/prokombiznes/media/produkty/godex-drukarka-etykiet-rt863i/godex-drukarka-etykiet-rt863i-01.webp` | białe tło (100%) |
| godex-drukarka-etykiet-rt863i | `seed/prokombiznes/media/produkty/godex-drukarka-etykiet-rt863i/godex-drukarka-etykiet-rt863i-02.webp` | białe tło (100%) |
| godex-dt2x-dt4x-dt200 | `seed/prokombiznes/media/produkty/godex-dt2x-dt4x-dt200/godex-dt2x-dt4x-dt200-01.webp` | białe tło (100%) |
| godex-dt2x-dt4x-dt200 | `seed/prokombiznes/media/produkty/godex-dt2x-dt4x-dt200/godex-dt2x-dt4x-dt200-02.webp` | białe tło (100%) |
| godex-dt2x-dt4x-dt200 | `seed/prokombiznes/media/produkty/godex-dt2x-dt4x-dt200/godex-dt2x-dt4x-dt200-03.webp` | białe tło (100%) |
| godex-ez2250i-ez2350i | `seed/prokombiznes/media/produkty/godex-ez2250i-ez2350i/godex-ez2250i-ez2350i-01.webp` | białe tło (100%) |
| godex-g500-g530 | `seed/prokombiznes/media/produkty/godex-g500-g530/godex-g500-g530-01.webp` | białe tło (100%) |
| godex-g500-g530 | `seed/prokombiznes/media/produkty/godex-g500-g530/godex-g500-g530-02.webp` | białe tło (100%) |
| godex-mx30-mx30i | `seed/prokombiznes/media/produkty/godex-mx30-mx30i/godex-mx30-mx30i-01.webp` | białe tło (100%) |
| godex-mx30-mx30i | `seed/prokombiznes/media/produkty/godex-mx30-mx30i/godex-mx30-mx30i-02.webp` | białe tło (100%) |
| godex-nawijaki-odwijak-i-obcinarka | `seed/prokombiznes/media/produkty/godex-nawijaki-odwijak-i-obcinarka/godex-nawijaki-odwijak-i-obcinarka-01.webp` | białe tło (100%) |
| godex-nawijaki-odwijak-i-obcinarka | `seed/prokombiznes/media/produkty/godex-nawijaki-odwijak-i-obcinarka/godex-nawijaki-odwijak-i-obcinarka-03.webp` | białe tło (100%) |
| godex-nawijaki-odwijak-i-obcinarka | `seed/prokombiznes/media/produkty/godex-nawijaki-odwijak-i-obcinarka/godex-nawijaki-odwijak-i-obcinarka-05.webp` | białe tło (100%) |
| godex-rt200-rt200i | `seed/prokombiznes/media/produkty/godex-rt200-rt200i/godex-rt200-rt200i-01.webp` | białe tło (100%) |
| godex-rt200-rt200i | `seed/prokombiznes/media/produkty/godex-rt200-rt200i/godex-rt200-rt200i-02.webp` | białe tło (100%) |
| godex-rt200-rt200i | `seed/prokombiznes/media/produkty/godex-rt200-rt200i/godex-rt200-rt200i-03.webp` | białe tło (100%) |
| godex-rt200-rt200i | `seed/prokombiznes/media/produkty/godex-rt200-rt200i/godex-rt200-rt200i-04.webp` | białe tło (100%) |
| godex-rt200-rt200i | `seed/prokombiznes/media/produkty/godex-rt200-rt200i/godex-rt200-rt200i-05.webp` | białe tło (100%) |
| godex-rt200-rt200i | `seed/prokombiznes/media/produkty/godex-rt200-rt200i/godex-rt200-rt200i-06.webp` | białe tło (100%) |
| godex-rt230-rt230i | `seed/prokombiznes/media/produkty/godex-rt230-rt230i/godex-rt230-rt230i-01.webp` | białe tło (100%) |
| godex-rt230-rt230i | `seed/prokombiznes/media/produkty/godex-rt230-rt230i/godex-rt230-rt230i-02.webp` | białe tło (100%) |
| godex-rt230-rt230i | `seed/prokombiznes/media/produkty/godex-rt230-rt230i/godex-rt230-rt230i-03.webp` | białe tło (100%) |
| godex-rt230-rt230i | `seed/prokombiznes/media/produkty/godex-rt230-rt230i/godex-rt230-rt230i-04.webp` | białe tło (100%) |
| godex-rt700-rt700i | `seed/prokombiznes/media/produkty/godex-rt700-rt700i/godex-rt700-rt700i-01.webp` | białe tło (100%) |
| godex-rt700-rt700i | `seed/prokombiznes/media/produkty/godex-rt700-rt700i/godex-rt700-rt700i-02.webp` | białe tło (100%) |
| godex-rt700-rt700i | `seed/prokombiznes/media/produkty/godex-rt700-rt700i/godex-rt700-rt700i-03.webp` | białe tło (100%) |
| godex-rt700-rt700i | `seed/prokombiznes/media/produkty/godex-rt700-rt700i/godex-rt700-rt700i-04.webp` | białe tło (100%) |
| godex-rt730-rt730i | `seed/prokombiznes/media/produkty/godex-rt730-rt730i/godex-rt730-rt730i-01.webp` | białe tło (100%) |
| godex-rt730-rt730i | `seed/prokombiznes/media/produkty/godex-rt730-rt730i/godex-rt730-rt730i-02.webp` | białe tło (100%) |
| godex-rt730-rt730i | `seed/prokombiznes/media/produkty/godex-rt730-rt730i/godex-rt730-rt730i-03.webp` | białe tło (100%) |
| godex-rt730-rt730i | `seed/prokombiznes/media/produkty/godex-rt730-rt730i/godex-rt730-rt730i-04.webp` | białe tło (100%) |
| godex-zx1200i-zx1300i-zx1600i | `seed/prokombiznes/media/produkty/godex-zx1200i-zx1300i-zx1600i/godex-zx1200i-zx1300i-zx1600i-01.webp` | białe tło (100%) |
| godex-zx1200i-zx1300i-zx1600i | `seed/prokombiznes/media/produkty/godex-zx1200i-zx1300i-zx1600i/godex-zx1200i-zx1300i-zx1600i-02.webp` | białe tło (100%) |
| gohub | `seed/prokombiznes/media/produkty/gohub/gohub-01.webp` | białe tło (100%) |
| gokds | `seed/prokombiznes/media/produkty/gokds/gokds-01.webp` | białe tło (100%) |
| gokiosk | `seed/prokombiznes/media/produkty/gokiosk/gokiosk-01.webp` | białe tło (100%) |
| goorder | `seed/prokombiznes/media/produkty/goorder/goorder-01.webp` | białe tło (100%) |
| goorder | `seed/prokombiznes/media/produkty/goorder/goorder-03.webp` | białe tło (100%) |
| gopos | `seed/prokombiznes/media/produkty/gopos/gopos-01.webp` | białe tło (100%) |
| gostock | `seed/prokombiznes/media/produkty/gostock/gostock-01.webp` | białe tło (100%) |
| hd | `seed/prokombiznes/media/produkty/hd/hd-01.webp` | białe tło (100%) |
| hd | `seed/prokombiznes/media/produkty/hd/hd-02.webp` | białe tło (100%) |
| hd | `seed/prokombiznes/media/produkty/hd/hd-03.webp` | białe tło (100%) |
| honeywell-8680i | `seed/prokombiznes/media/produkty/honeywell-8680i/honeywell-8680i-01.webp` | białe tło (100%) |
| honeywell-8680i | `seed/prokombiznes/media/produkty/honeywell-8680i/honeywell-8680i-02.webp` | białe tło (100%) |
| honeywell-ck62 | `seed/prokombiznes/media/produkty/honeywell-ck62/honeywell-ck62-01.webp` | białe tło (100%) |
| honeywell-ck62 | `seed/prokombiznes/media/produkty/honeywell-ck62/honeywell-ck62-02.webp` | białe tło (100%) |
| honeywell-ck65 | `seed/prokombiznes/media/produkty/honeywell-ck65/honeywell-ck65-01.webp` | białe tło (100%) |
| honeywell-ck65 | `seed/prokombiznes/media/produkty/honeywell-ck65/honeywell-ck65-02.webp` | białe tło (100%) |
| honeywell-ck67 | `seed/prokombiznes/media/produkty/honeywell-ck67/honeywell-ck67-01.webp` | białe tło (100%) |
| honeywell-ck67 | `seed/prokombiznes/media/produkty/honeywell-ck67/honeywell-ck67-02.webp` | białe tło (100%) |
| honeywell-ct30-xp | `seed/prokombiznes/media/produkty/honeywell-ct30-xp/honeywell-ct30-xp-01.webp` | białe tło (100%) |
| honeywell-ct30-xp | `seed/prokombiznes/media/produkty/honeywell-ct30-xp/honeywell-ct30-xp-02.webp` | białe tło (100%) |
| honeywell-ct32 | `seed/prokombiznes/media/produkty/honeywell-ct32/honeywell-ct32-01.webp` | białe tło (100%) |
| honeywell-ct32 | `seed/prokombiznes/media/produkty/honeywell-ct32/honeywell-ct32-02.webp` | białe tło (100%) |
| honeywell-ct37 | `seed/prokombiznes/media/produkty/honeywell-ct37/honeywell-ct37-02.webp` | białe tło (100%) |
| honeywell-ct45 | `seed/prokombiznes/media/produkty/honeywell-ct45/honeywell-ct45-01.webp` | białe tło (100%) |
| honeywell-ct45 | `seed/prokombiznes/media/produkty/honeywell-ct45/honeywell-ct45-02.webp` | białe tło (100%) |
| honeywell-ct70 | `seed/prokombiznes/media/produkty/honeywell-ct70/honeywell-ct70-01.webp` | białe tło (100%) |
| honeywell-ct70 | `seed/prokombiznes/media/produkty/honeywell-ct70/honeywell-ct70-02.webp` | białe tło (100%) |
| honeywell-genesis-xp-7680 | `seed/prokombiznes/media/produkty/honeywell-genesis-xp-7680/honeywell-genesis-xp-7680-01.webp` | białe tło (100%) |
| honeywell-granit-ultra-2100i-2105i | `seed/prokombiznes/media/produkty/honeywell-granit-ultra-2100i-2105i/honeywell-granit-ultra-2100i-2105i-01.webp` | białe tło (100%) |
| honeywell-granit-ultra-2100i-2105i | `seed/prokombiznes/media/produkty/honeywell-granit-ultra-2100i-2105i/honeywell-granit-ultra-2100i-2105i-02.webp` | białe tło (100%) |
| honeywell-granit-ultra-2100i-2105i | `seed/prokombiznes/media/produkty/honeywell-granit-ultra-2100i-2105i/honeywell-granit-ultra-2100i-2105i-03.webp` | białe tło (100%) |
| honeywell-granit-ultra-2100i-2105i | `seed/prokombiznes/media/produkty/honeywell-granit-ultra-2100i-2105i/honeywell-granit-ultra-2100i-2105i-04.webp` | białe tło (100%) |
| honeywell-granit-xp-1990i-1991i | `seed/prokombiznes/media/produkty/honeywell-granit-xp-1990i-1991i/honeywell-granit-xp-1990i-1991i-01.webp` | białe tło (100%) |
| honeywell-granit-xp-1990i-1991i | `seed/prokombiznes/media/produkty/honeywell-granit-xp-1990i-1991i/honeywell-granit-xp-1990i-1991i-02.webp` | białe tło (100%) |
| honeywell-granit-xp-1990i-1991i | `seed/prokombiznes/media/produkty/honeywell-granit-xp-1990i-1991i/honeywell-granit-xp-1990i-1991i-03.webp` | białe tło (100%) |
| honeywell-granit-xp-1990i-1991i | `seed/prokombiznes/media/produkty/honeywell-granit-xp-1990i-1991i/honeywell-granit-xp-1990i-1991i-04.webp` | białe tło (100%) |
| honeywell-granit-xp-1990i-1991i | `seed/prokombiznes/media/produkty/honeywell-granit-xp-1990i-1991i/honeywell-granit-xp-1990i-1991i-05.webp` | białe tło (100%) |
| honeywell-granit-xp-1990i-1991i | `seed/prokombiznes/media/produkty/honeywell-granit-xp-1990i-1991i/honeywell-granit-xp-1990i-1991i-06.webp` | białe tło (100%) |
| honeywell-hf810-hf811 | `seed/prokombiznes/media/produkty/honeywell-hf810-hf811/honeywell-hf810-hf811-01.webp` | białe tło (100%) |
| honeywell-hf810-hf811 | `seed/prokombiznes/media/produkty/honeywell-hf810-hf811/honeywell-hf810-hf811-02.webp` | białe tło (100%) |
| honeywell-lnx3 | `seed/prokombiznes/media/produkty/honeywell-lnx3/honeywell-lnx3-01.webp` | białe tło (100%) |
| honeywell-lnx3 | `seed/prokombiznes/media/produkty/honeywell-lnx3/honeywell-lnx3-02.webp` | białe tło (100%) |
| honeywell-mpd31d | `seed/prokombiznes/media/produkty/honeywell-mpd31d/honeywell-mpd31d-01.webp` | białe tło (100%) |
| honeywell-mpd31d | `seed/prokombiznes/media/produkty/honeywell-mpd31d/honeywell-mpd31d-02.webp` | białe tło (100%) |
| honeywell-orbit-7190 | `seed/prokombiznes/media/produkty/honeywell-orbit-7190/honeywell-orbit-7190-01.webp` | białe tło (100%) |
| honeywell-orbit-7190 | `seed/prokombiznes/media/produkty/honeywell-orbit-7190/honeywell-orbit-7190-02.webp` | białe tło (100%) |
| honeywell-pc41e-d | `seed/prokombiznes/media/produkty/honeywell-pc41e-d/honeywell-pc41e-d-01.webp` | białe tło (100%) |
| honeywell-pc41e-d | `seed/prokombiznes/media/produkty/honeywell-pc41e-d/honeywell-pc41e-d-02.webp` | białe tło (100%) |
| honeywell-pc42e-d-pc42e-t | `seed/prokombiznes/media/produkty/honeywell-pc42e-d-pc42e-t/honeywell-pc42e-d-pc42e-t-01.webp` | białe tło (100%) |
| honeywell-pc42e-d-pc42e-t | `seed/prokombiznes/media/produkty/honeywell-pc42e-d-pc42e-t/honeywell-pc42e-d-pc42e-t-02.webp` | białe tło (100%) |
| honeywell-pc42e-d-pc42e-t | `seed/prokombiznes/media/produkty/honeywell-pc42e-d-pc42e-t/honeywell-pc42e-d-pc42e-t-03.webp` | białe tło (100%) |
| honeywell-pc42e-d-pc42e-t | `seed/prokombiznes/media/produkty/honeywell-pc42e-d-pc42e-t/honeywell-pc42e-d-pc42e-t-04.webp` | białe tło (100%) |
| honeywell-pc45d-pc45t | `seed/prokombiznes/media/produkty/honeywell-pc45d-pc45t/honeywell-pc45d-pc45t-01.webp` | białe tło (100%) |
| honeywell-pc45d-pc45t | `seed/prokombiznes/media/produkty/honeywell-pc45d-pc45t/honeywell-pc45d-pc45t-02.webp` | białe tło (100%) |
| honeywell-pc45d-pc45t | `seed/prokombiznes/media/produkty/honeywell-pc45d-pc45t/honeywell-pc45d-pc45t-03.webp` | białe tło (100%) |
| honeywell-pc45d-pc45t | `seed/prokombiznes/media/produkty/honeywell-pc45d-pc45t/honeywell-pc45d-pc45t-04.webp` | białe tło (100%) |
| honeywell-pc45d-pc45t | `seed/prokombiznes/media/produkty/honeywell-pc45d-pc45t/honeywell-pc45d-pc45t-05.webp` | białe tło (100%) |
| honeywell-pc45d-pc45t | `seed/prokombiznes/media/produkty/honeywell-pc45d-pc45t/honeywell-pc45d-pc45t-06.webp` | białe tło (100%) |
| honeywell-pd45s | `seed/prokombiznes/media/produkty/honeywell-pd45s/honeywell-pd45s-01.webp` | białe tło (100%) |
| honeywell-pd45s | `seed/prokombiznes/media/produkty/honeywell-pd45s/honeywell-pd45s-02.webp` | białe tło (100%) |
| honeywell-pm45 | `seed/prokombiznes/media/produkty/honeywell-pm45/honeywell-pm45-01.webp` | białe tło (100%) |
| honeywell-pm45 | `seed/prokombiznes/media/produkty/honeywell-pm45/honeywell-pm45-02.webp` | białe tło (100%) |
| honeywell-pm65 | `seed/prokombiznes/media/produkty/honeywell-pm65/honeywell-pm65-01.webp` | białe tło (100%) |
| honeywell-pm65 | `seed/prokombiznes/media/produkty/honeywell-pm65/honeywell-pm65-02.webp` | białe tło (100%) |
| honeywell-px45 | `seed/prokombiznes/media/produkty/honeywell-px45/honeywell-px45-01.webp` | białe tło (100%) |
| honeywell-px45 | `seed/prokombiznes/media/produkty/honeywell-px45/honeywell-px45-02.webp` | białe tło (100%) |
| honeywell-px65 | `seed/prokombiznes/media/produkty/honeywell-px65/honeywell-px65-01.webp` | białe tło (100%) |
| honeywell-px65 | `seed/prokombiznes/media/produkty/honeywell-px65/honeywell-px65-02.webp` | białe tło (100%) |
| honeywell-px940-ze-zintegrowana-weryfikacja-etyk | `seed/prokombiznes/media/produkty/honeywell-px940-ze-zintegrowana-weryfikacja-etyk/honeywell-px940-ze-zintegrowana-weryfikacja-etyk-01.webp` | białe tło (100%) |
| honeywell-px940-ze-zintegrowana-weryfikacja-etyk | `seed/prokombiznes/media/produkty/honeywell-px940-ze-zintegrowana-weryfikacja-etyk/honeywell-px940-ze-zintegrowana-weryfikacja-etyk-02.webp` | białe tło (100%) |
| honeywell-quantumt-3580 | `seed/prokombiznes/media/produkty/honeywell-quantumt-3580/honeywell-quantumt-3580-01.webp` | białe tło (100%) |
| honeywell-quantumt-3580 | `seed/prokombiznes/media/produkty/honeywell-quantumt-3580/honeywell-quantumt-3580-02.webp` | białe tło (100%) |
| honeywell-rp | `seed/prokombiznes/media/produkty/honeywell-rp/honeywell-rp-01.webp` | białe tło (100%) |
| honeywell-rp | `seed/prokombiznes/media/produkty/honeywell-rp/honeywell-rp-02.webp` | białe tło (100%) |
| honeywell-rt10a-rt10w | `seed/prokombiznes/media/produkty/honeywell-rt10a-rt10w/honeywell-rt10a-rt10w-01.webp` | białe tło (100%) |
| honeywell-rt10a-rt10w | `seed/prokombiznes/media/produkty/honeywell-rt10a-rt10w/honeywell-rt10a-rt10w-02.webp` | białe tło (100%) |
| honeywell-scanpal-eda10a | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda10a/honeywell-scanpal-eda10a-01.webp` | białe tło (100%) |
| honeywell-scanpal-eda10a | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda10a/honeywell-scanpal-eda10a-02.webp` | białe tło (100%) |
| honeywell-scanpal-eda52 | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda52/honeywell-scanpal-eda52-01.webp` | białe tło (100%) |
| honeywell-scanpal-eda52 | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda52/honeywell-scanpal-eda52-02.webp` | białe tło (100%) |
| honeywell-scanpal-eda56 | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda56/honeywell-scanpal-eda56-01.webp` | białe tło (100%) |
| honeywell-scanpal-eda56 | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda56/honeywell-scanpal-eda56-02.webp` | białe tło (100%) |
| honeywell-scanpal-eda57 | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda57/honeywell-scanpal-eda57-01.webp` | białe tło (100%) |
| honeywell-scanpal-eda57 | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda57/honeywell-scanpal-eda57-02.webp` | białe tło (100%) |
| honeywell-scanpal-eda61k | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda61k/honeywell-scanpal-eda61k-01.webp` | białe tło (100%) |
| honeywell-scanpal-eda61k | `seed/prokombiznes/media/produkty/honeywell-scanpal-eda61k/honeywell-scanpal-eda61k-02.webp` | białe tło (100%) |
| honeywell-solaris-xp-7990g | `seed/prokombiznes/media/produkty/honeywell-solaris-xp-7990g/honeywell-solaris-xp-7990g-01.webp` | białe tło (100%) |
| honeywell-solaris-xp-7990g | `seed/prokombiznes/media/produkty/honeywell-solaris-xp-7990g/honeywell-solaris-xp-7990g-02.webp` | białe tło (100%) |
| honeywell-thor-vm1a | `seed/prokombiznes/media/produkty/honeywell-thor-vm1a/honeywell-thor-vm1a-01.webp` | białe tło (100%) |
| honeywell-thor-vm1a | `seed/prokombiznes/media/produkty/honeywell-thor-vm1a/honeywell-thor-vm1a-02.webp` | białe tło (100%) |
| honeywell-thor-vm3 | `seed/prokombiznes/media/produkty/honeywell-thor-vm3/honeywell-thor-vm3-01.webp` | białe tło (100%) |
| honeywell-thor-vm3 | `seed/prokombiznes/media/produkty/honeywell-thor-vm3/honeywell-thor-vm3-02.webp` | białe tło (100%) |
| honeywell-voyager-1200g-1202g | `seed/prokombiznes/media/produkty/honeywell-voyager-1200g-1202g/honeywell-voyager-1200g-1202g-01.webp` | białe tło (100%) |
| honeywell-voyager-1200g-1202g | `seed/prokombiznes/media/produkty/honeywell-voyager-1200g-1202g/honeywell-voyager-1200g-1202g-02.webp` | białe tło (100%) |
| honeywell-voyager-1200g-1202g | `seed/prokombiznes/media/produkty/honeywell-voyager-1200g-1202g/honeywell-voyager-1200g-1202g-03.webp` | białe tło (100%) |
| honeywell-voyager-1200g-1202g | `seed/prokombiznes/media/produkty/honeywell-voyager-1200g-1202g/honeywell-voyager-1200g-1202g-04.webp` | białe tło (100%) |
| honeywell-voyager-1250g | `seed/prokombiznes/media/produkty/honeywell-voyager-1250g/honeywell-voyager-1250g-01.webp` | białe tło (100%) |
| honeywell-voyager-1250g | `seed/prokombiznes/media/produkty/honeywell-voyager-1250g/honeywell-voyager-1250g-02.webp` | białe tło (100%) |
| honeywell-voyager-1350g | `seed/prokombiznes/media/produkty/honeywell-voyager-1350g/honeywell-voyager-1350g-01.webp` | białe tło (100%) |
| honeywell-voyager-1350g | `seed/prokombiznes/media/produkty/honeywell-voyager-1350g/honeywell-voyager-1350g-02.webp` | białe tło (100%) |
| honeywell-voyager-1470g-1472g | `seed/prokombiznes/media/produkty/honeywell-voyager-1470g-1472g/honeywell-voyager-1470g-1472g-01.webp` | białe tło (100%) |
| honeywell-voyager-1470g-1472g | `seed/prokombiznes/media/produkty/honeywell-voyager-1470g-1472g/honeywell-voyager-1470g-1472g-02.webp` | białe tło (100%) |
| honeywell-voyager-1470g-1472g | `seed/prokombiznes/media/produkty/honeywell-voyager-1470g-1472g/honeywell-voyager-1470g-1472g-03.webp` | białe tło (100%) |
| honeywell-voyager-1470g-1472g | `seed/prokombiznes/media/produkty/honeywell-voyager-1470g-1472g/honeywell-voyager-1470g-1472g-04.webp` | białe tło (100%) |
| honeywell-voyager-1602g | `seed/prokombiznes/media/produkty/honeywell-voyager-1602g/honeywell-voyager-1602g-01.webp` | białe tło (100%) |
| honeywell-voyager-1602g | `seed/prokombiznes/media/produkty/honeywell-voyager-1602g/honeywell-voyager-1602g-02.webp` | białe tło (100%) |
| honeywell-voyager-xp-1400g | `seed/prokombiznes/media/produkty/honeywell-voyager-xp-1400g/honeywell-voyager-xp-1400g-01.webp` | białe tło (100%) |
| honeywell-voyager-xp-1400g | `seed/prokombiznes/media/produkty/honeywell-voyager-xp-1400g/honeywell-voyager-xp-1400g-02.webp` | białe tło (100%) |
| honeywell-vuqest-3320g | `seed/prokombiznes/media/produkty/honeywell-vuqest-3320g/honeywell-vuqest-3320g-01.webp` | białe tło (100%) |
| honeywell-vuqest-3320g | `seed/prokombiznes/media/produkty/honeywell-vuqest-3320g/honeywell-vuqest-3320g-02.webp` | białe tło (100%) |
| honeywell-xenon-xp-1950g-1952g | `seed/prokombiznes/media/produkty/honeywell-xenon-xp-1950g-1952g/honeywell-xenon-xp-1950g-1952g-01.webp` | białe tło (100%) |
| k1 | `seed/prokombiznes/media/produkty/k1/k1-03.webp` | białe tło (100%) |
| k10 | `seed/prokombiznes/media/produkty/k10/k10-01.webp` | białe tło (100%) |
| k10 | `seed/prokombiznes/media/produkty/k10/k10-02.webp` | białe tło (100%) |
| k10 | `seed/prokombiznes/media/produkty/k10/k10-03.webp` | białe tło (100%) |
| k10 | `seed/prokombiznes/media/produkty/k10/k10-04.webp` | białe tło (100%) |
| k10 | `seed/prokombiznes/media/produkty/k10/k10-06.webp` | białe tło (100%) |
| k10 | `seed/prokombiznes/media/produkty/k10/k10-07.webp` | białe tło (100%) |
| k10 | `seed/prokombiznes/media/produkty/k10/k10-08.webp` | białe tło (100%) |
| k2pay | `seed/prokombiznes/media/produkty/k2pay/k2pay-03.webp` | białe tło (100%) |
| kds | `seed/prokombiznes/media/produkty/kds/kds-02.webp` | białe tło (100%) |
| kyo | `seed/prokombiznes/media/produkty/kyo/kyo-03.webp` | białe tło (100%) |
| lite | `seed/prokombiznes/media/produkty/lite/lite-01.webp` | białe tło (100%) |
| lite | `seed/prokombiznes/media/produkty/lite/lite-02.webp` | białe tło (100%) |
| lite | `seed/prokombiznes/media/produkty/lite/lite-03.webp` | białe tło (100%) |
| mera | `seed/prokombiznes/media/produkty/mera/mera-02.webp` | białe tło (100%) |
| mfp | `seed/prokombiznes/media/produkty/mfp/mfp-01.webp` | białe tło (100%) |
| mfp | `seed/prokombiznes/media/produkty/mfp/mfp-02.webp` | białe tło (100%) |
| mfp | `seed/prokombiznes/media/produkty/mfp/mfp-03.webp` | białe tło (100%) |
| mfp | `seed/prokombiznes/media/produkty/mfp/mfp-04.webp` | białe tło (100%) |
| mfp | `seed/prokombiznes/media/produkty/mfp/mfp-05.webp` | białe tło (100%) |
| mfp | `seed/prokombiznes/media/produkty/mfp/mfp-06.webp` | białe tło (100%) |
| minimarket | `seed/prokombiznes/media/produkty/minimarket/minimarket-01.webp` | białe tło (100%) |
| minimarket | `seed/prokombiznes/media/produkty/minimarket/minimarket-02.webp` | białe tło (100%) |
| mobile | `seed/prokombiznes/media/produkty/mobile/mobile-01.webp` | białe tło (100%) |
| mobile2 | `seed/prokombiznes/media/produkty/mobile2/mobile2-01.webp` | białe tło (100%) |
| mobile2 | `seed/prokombiznes/media/produkty/mobile2/mobile2-02.webp` | białe tło (100%) |
| mobile2 | `seed/prokombiznes/media/produkty/mobile2/mobile2-03.webp` | białe tło (100%) |
| mslic | `seed/prokombiznes/media/produkty/mslic/mslic-01.webp` | białe tło (100%) |
| nas | `seed/prokombiznes/media/produkty/nas/nas-04.webp` | białe tło (100%) |
| nas | `seed/prokombiznes/media/produkty/nas/nas-05.webp` | białe tło (100%) |
| nas | `seed/prokombiznes/media/produkty/nas/nas-06.webp` | białe tło (100%) |
| nas | `seed/prokombiznes/media/produkty/nas/nas-07.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-01.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-02.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-03.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-04.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-05.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-06.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-07.webp` | białe tło (100%) |
| nec | `seed/prokombiznes/media/produkty/nec/nec-08.webp` | białe tło (100%) |
| neo | `seed/prokombiznes/media/produkty/neo/neo-01.webp` | białe tło (100%) |
| nfh | `seed/prokombiznes/media/produkty/nfh/nfh-01.webp` | białe tło (100%) |
| numerki | `seed/prokombiznes/media/produkty/numerki/numerki-01.webp` | białe tło (100%) |
| optima | `seed/prokombiznes/media/produkty/optima/optima-01.webp` | białe tło (100%) |
| optima | `seed/prokombiznes/media/produkty/optima/optima-02.webp` | białe tło (100%) |
| pcgastro | `seed/prokombiznes/media/produkty/pcgastro/pcgastro-01.webp` | białe tło (100%) |
| pcm | `seed/prokombiznes/media/produkty/pcm/pcm-01.webp` | białe tło (100%) |
| pcm | `seed/prokombiznes/media/produkty/pcm/pcm-02.webp` | białe tło (100%) |
| pcm | `seed/prokombiznes/media/produkty/pcm/pcm-03.webp` | białe tło (100%) |
| pcpos | `seed/prokombiznes/media/produkty/pcpos/pcpos-01.webp` | białe tło (100%) |
| pcpos | `seed/prokombiznes/media/produkty/pcpos/pcpos-02.webp` | białe tło (100%) |
| pol | `seed/prokombiznes/media/produkty/pol/pol-01.webp` | białe tło (100%) |
| pol | `seed/prokombiznes/media/produkty/pol/pol-02.webp` | białe tło (100%) |
| pol | `seed/prokombiznes/media/produkty/pol/pol-04.webp` | białe tło (100%) |
| pol | `seed/prokombiznes/media/produkty/pol/pol-05.webp` | białe tło (100%) |
| pol | `seed/prokombiznes/media/produkty/pol/pol-06.webp` | białe tło (100%) |
| posnet-bileterka-e-podroznik | `seed/prokombiznes/media/produkty/posnet-bileterka-e-podroznik/posnet-bileterka-e-podroznik-01.webp` | białe tło (100%) |
| posnet-klawiatura-bb10s-rs-usb | `seed/prokombiznes/media/produkty/posnet-klawiatura-bb10s-rs-usb/posnet-klawiatura-bb10s-rs-usb-02.webp` | białe tło (100%) |
| posnet-szuflada-flip-top-ft460 | `seed/prokombiznes/media/produkty/posnet-szuflada-flip-top-ft460/posnet-szuflada-flip-top-ft460-01.webp` | białe tło (100%) |
| posnet-szuflada-flip-top-ft460 | `seed/prokombiznes/media/produkty/posnet-szuflada-flip-top-ft460/posnet-szuflada-flip-top-ft460-02.webp` | białe tło (100%) |
| posnet-szuflada-mk330-mk350 | `seed/prokombiznes/media/produkty/posnet-szuflada-mk330-mk350/posnet-szuflada-mk330-mk350-02.webp` | białe tło (100%) |
| posnet-szuflada-mk330-mk350 | `seed/prokombiznes/media/produkty/posnet-szuflada-mk330-mk350/posnet-szuflada-mk330-mk350-04.webp` | białe tło (100%) |
| posnet-werion | `seed/prokombiznes/media/produkty/posnet-werion/posnet-werion-01.webp` | białe tło (100%) |
| posnet-wyswietlacz-pos | `seed/prokombiznes/media/produkty/posnet-wyswietlacz-pos/posnet-wyswietlacz-pos-02.webp` | białe tło (100%) |
| pospay2 | `seed/prokombiznes/media/produkty/pospay2/pospay2-06.webp` | białe tło (100%) |
| pospay2 | `seed/prokombiznes/media/produkty/pospay2/pospay2-07.webp` | białe tło (100%) |
| qnap | `seed/prokombiznes/media/produkty/qnap/qnap-03.webp` | białe tło (100%) |
| qnap | `seed/prokombiznes/media/produkty/qnap/qnap-04.webp` | białe tło (100%) |
| sato-metkownice-judo-kendo | `seed/prokombiznes/media/produkty/sato-metkownice-judo-kendo/sato-metkownice-judo-kendo-01.webp` | białe tło (100%) |
| sato-metkownice-judo-kendo | `seed/prokombiznes/media/produkty/sato-metkownice-judo-kendo/sato-metkownice-judo-kendo-02.webp` | białe tło (100%) |
| sato-metkownice-judo-kendo | `seed/prokombiznes/media/produkty/sato-metkownice-judo-kendo/sato-metkownice-judo-kendo-03.webp` | białe tło (100%) |
| srvr | `seed/prokombiznes/media/produkty/srvr/srvr-01.webp` | białe tło (100%) |
| srvr | `seed/prokombiznes/media/produkty/srvr/srvr-02.webp` | białe tło (100%) |
| srvt | `seed/prokombiznes/media/produkty/srvt/srvt-01.webp` | białe tło (100%) |
| srvt | `seed/prokombiznes/media/produkty/srvt/srvt-02.webp` | białe tło (100%) |
| sunmi-blink-blink-2 | `seed/prokombiznes/media/produkty/sunmi-blink-blink-2/sunmi-blink-blink-2-03.webp` | białe tło (100%) |
| sunmi-blink-blink-2 | `seed/prokombiznes/media/produkty/sunmi-blink-blink-2/sunmi-blink-blink-2-04.webp` | białe tło (100%) |
| szuf | `seed/prokombiznes/media/produkty/szuf/szuf-02.webp` | białe tło (100%) |
| t10 | `seed/prokombiznes/media/produkty/t10/t10-03.webp` | białe tło (100%) |
| t10 | `seed/prokombiznes/media/produkty/t10/t10-04.webp` | białe tło (100%) |
| t2s | `seed/prokombiznes/media/produkty/t2s/t2s-01.webp` | białe tło (100%) |
| t2s | `seed/prokombiznes/media/produkty/t2s/t2s-02.webp` | białe tło (100%) |
| t2s | `seed/prokombiznes/media/produkty/t2s/t2s-03.webp` | białe tło (100%) |
| t2s | `seed/prokombiznes/media/produkty/t2s/t2s-04.webp` | białe tło (100%) |
| tc | `seed/prokombiznes/media/produkty/tc/tc-02.webp` | białe tło (100%) |
| tc | `seed/prokombiznes/media/produkty/tc/tc-03.webp` | białe tło (100%) |
| temo | `seed/prokombiznes/media/produkty/temo/temo-02.webp` | białe tło (100%) |
| trio | `seed/prokombiznes/media/produkty/trio/trio-01.webp` | białe tło (100%) |
| trio | `seed/prokombiznes/media/produkty/trio/trio-02.webp` | białe tło (100%) |
| trio | `seed/prokombiznes/media/produkty/trio/trio-03.webp` | białe tło (100%) |
| trio | `seed/prokombiznes/media/produkty/trio/trio-04.webp` | białe tło (100%) |
| triotab | `seed/prokombiznes/media/produkty/triotab/triotab-01.webp` | białe tło (100%) |
| triotab | `seed/prokombiznes/media/produkty/triotab/triotab-03.webp` | białe tło (100%) |
| v2s | `seed/prokombiznes/media/produkty/v2s/v2s-02.webp` | białe tło (100%) |
| v3 | `seed/prokombiznes/media/produkty/v3/v3-02.webp` | białe tło (100%) |
| v3 | `seed/prokombiznes/media/produkty/v3/v3-03.webp` | białe tło (100%) |
| v3mix | `seed/prokombiznes/media/produkty/v3mix/v3mix-01.webp` | białe tło (100%) |
| v3mix | `seed/prokombiznes/media/produkty/v3mix/v3mix-02.webp` | białe tło (100%) |
| waga | `seed/prokombiznes/media/produkty/waga/waga-02.webp` | białe tło (100%) |
| xl2 | `seed/prokombiznes/media/produkty/xl2/xl2-02.webp` | białe tło (100%) |
| xl2 | `seed/prokombiznes/media/produkty/xl2/xl2-04.webp` | białe tło (100%) |
| xl2 | `seed/prokombiznes/media/produkty/xl2/xl2-05.webp` | białe tło (100%) |
| zebra-drukarka-biurkowa-zd230 | `seed/prokombiznes/media/produkty/zebra-drukarka-biurkowa-zd230/zebra-drukarka-biurkowa-zd230-01.webp` | białe tło (100%) |
| zebra-drukarka-biurkowa-zd230 | `seed/prokombiznes/media/produkty/zebra-drukarka-biurkowa-zd230/zebra-drukarka-biurkowa-zd230-02.webp` | białe tło (100%) |
| zebra-drukarka-etykiet-zd421 | `seed/prokombiznes/media/produkty/zebra-drukarka-etykiet-zd421/zebra-drukarka-etykiet-zd421-01.webp` | białe tło (100%) |
| zebra-drukarka-etykiet-zd421 | `seed/prokombiznes/media/produkty/zebra-drukarka-etykiet-zd421/zebra-drukarka-etykiet-zd421-02.webp` | białe tło (100%) |
| zebra-drukarka-kart-plastikowych-zxp-series-7 | `seed/prokombiznes/media/produkty/zebra-drukarka-kart-plastikowych-zxp-series-7/zebra-drukarka-kart-plastikowych-zxp-series-7-01.webp` | białe tło (100%) |
| zebra-ds2208-ds2278 | `seed/prokombiznes/media/produkty/zebra-ds2208-ds2278/zebra-ds2208-ds2278-01.webp` | białe tło (100%) |
| zebra-ds2208-ds2278 | `seed/prokombiznes/media/produkty/zebra-ds2208-ds2278/zebra-ds2208-ds2278-02.webp` | białe tło (100%) |
| zebra-ds2208-ds2278 | `seed/prokombiznes/media/produkty/zebra-ds2208-ds2278/zebra-ds2208-ds2278-03.webp` | białe tło (100%) |
| zebra-tc22-tc27 | `seed/prokombiznes/media/produkty/zebra-tc22-tc27/zebra-tc22-tc27-01.webp` | białe tło (100%) |
| zebra-tc22-tc27 | `seed/prokombiznes/media/produkty/zebra-tc22-tc27/zebra-tc22-tc27-02.webp` | białe tło (100%) |
| zebra-zc100-zc300 | `seed/prokombiznes/media/produkty/zebra-zc100-zc300/zebra-zc100-zc300-01.webp` | białe tło (100%) |
| zebra-zc100-zc300 | `seed/prokombiznes/media/produkty/zebra-zc100-zc300/zebra-zc100-zc300-02.webp` | białe tło (100%) |
| zebra-zc100-zc300 | `seed/prokombiznes/media/produkty/zebra-zc100-zc300/zebra-zc100-zc300-03.webp` | białe tło (100%) |
| zebra-zc100-zc300 | `seed/prokombiznes/media/produkty/zebra-zc100-zc300/zebra-zc100-zc300-04.webp` | białe tło (100%) |
| biuro | `seed/prokombiznes/k3/media/produkty/biuro/biuro-02.webp` | otoczka (98%) |
| biuro | `seed/prokombiznes/k3/media/produkty/biuro/biuro-04.webp` | otoczka (62%) |
| biuro | `seed/prokombiznes/media/produkty/biuro/biuro-01.webp` | otoczka (62%) |
| gestor | `seed/prokombiznes/k3/media/produkty/gestor/gestor-02.webp` | otoczka (78%) |
| gestor | `seed/prokombiznes/media/produkty/gestor/gestor-01.webp` | otoczka (62%) |
| gestor | `seed/prokombiznes/media/produkty/gestor/gestor-02.webp` | otoczka (62%) |
| gratyfikant | `seed/prokombiznes/k3/media/produkty/gratyfikant/gratyfikant-02.webp` | otoczka (97%) |
| gratyfikant | `seed/prokombiznes/media/produkty/gratyfikant/gratyfikant-01.webp` | otoczka (62%) |
| gratyfikant | `seed/prokombiznes/media/produkty/gratyfikant/gratyfikant-02.webp` | otoczka (67%) |
| hp-officejet-pro-9132e | `seed/prokombiznes/k4/media/produkty/hp-officejet-pro-9132e.webp` | otoczka (48%) |
| insert-subiekt-123 | `docs/design/prokombiznes/boards/media/p-insert-subiekt-123.webp` | otoczka (59%) |
| lenovo-ideapad-slim-3-16-17 | `seed/prokombiznes/k3/media/produkty/lenovo-ideapad-slim-3-16-17/lenovo-ideapad-slim-3-16-17-06.webp` | otoczka (66%) |
| lenovo-thinkpad-e14-gen8-e16-gen4 | `seed/prokombiznes/k3/media/produkty/lenovo-thinkpad-e14-gen8-e16-gen4/lenovo-thinkpad-e14-gen8-e16-gen4-01.webp` | otoczka (81%) |
| m365 | `seed/prokombiznes/media/produkty/m365/m365-01.webp` | otoczka (100%) |
| nexo | `seed/prokombiznes/k3/media/produkty/nexo/nexo-03.webp` | otoczka (72%) |
| nexo | `seed/prokombiznes/media/produkty/nexo/nexo-01.webp` | otoczka (70%) |
| nexo | `seed/prokombiznes/media/produkty/nexo/nexo-02.webp` | otoczka (67%) |
| nfh | `seed/prokombiznes/k3/media/produkty/nfh/nfh-04.webp` | otoczka (49%) |
| nfh | `seed/prokombiznes/k3/media/produkty/nfh/nfh-05.webp` | otoczka (55%) |
| nfh | `seed/prokombiznes/k3/media/produkty/nfh/nfh-06.webp` | otoczka (68%) |
| rachmistrz | `seed/prokombiznes/k3/media/produkty/rachmistrz/rachmistrz-03.webp` | otoczka (73%) |
| rachmistrz | `seed/prokombiznes/media/produkty/rachmistrz/rachmistrz-01.webp` | otoczka (67%) |
| rachmistrz | `seed/prokombiznes/media/produkty/rachmistrz/rachmistrz-02.webp` | otoczka (67%) |
| rewizor | `seed/prokombiznes/k3/media/produkty/rewizor/rewizor-02.webp` | otoczka (83%) |
| rewizor | `seed/prokombiznes/k3/media/produkty/rewizor/rewizor-03.webp` | otoczka (98%) |
| rewizor | `seed/prokombiznes/media/produkty/rewizor/rewizor-01.webp` | otoczka (68%) |
| rewizor | `seed/prokombiznes/media/produkty/rewizor/rewizor-02.webp` | otoczka (67%) |
| tc | `seed/prokombiznes/media/produkty/tc/tc-01.webp` | otoczka (100%) |
| u7 | `seed/prokombiznes/media/produkty/u7/u7-01.webp` | otoczka (63%) |
| ubiquiti-u7 | `docs/design/prokombiznes/boards/media/p-ubiquiti-u7.webp` | otoczka (58%) |
| ubiquiti-unifi | `docs/design/prokombiznes/boards/media/p-ubiquiti-unifi.webp` | otoczka (59%) |
| ucgmax | `seed/prokombiznes/k3/media/produkty/ucgmax/ucgmax-02.webp` | otoczka (56%) |
| ucgmax | `seed/prokombiznes/media/produkty/ucgmax/ucgmax-01.webp` | otoczka (60%) |
| ucgmax | `seed/prokombiznes/media/produkty/ucgmax/ucgmax-03.webp` | otoczka (91%) |
| udr7 | `seed/prokombiznes/k3/media/produkty/udr7/udr7-03.webp` | otoczka (51%) |
