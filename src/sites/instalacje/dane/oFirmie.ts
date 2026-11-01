import type { InstIconName } from '../icons'

/*
 * Texts of `/o-firmie` (`zrodlo/pages/OFirmie.body.html` + `OFirmie.js`), 1:1 with the prototype
 * except (boss 01.11.2026): one salon — no Zakopane salon in the map, the lead and „Blisko”; the
 * company data and the salon's address and hours come from `CompanyData`. Without the history
 * axis (the prototype: „Daty poza rokiem 2004 do uzupełnienia… Jeśli ich nie będzie, oś usuwamy”
 * — only 2004 is known; it stays in the hero facts) and without „Zespół instalacji” (no people,
 * photos and licences yet — `TODO(krystian)` below). The hero and the band from the panel.
 */

export type LineCard = {
  icon: InstIconName
  title: string
  text: string
  link: string
  href: string
  current?: boolean
}

export const oFirmie = {
  map: {
    label: 'Mapa: salon PRO-KOM w Rabce-Zdroju, obszar dojazdu Nowy Targ i Zakopane',
    salon: 'salon · ul. Orkana 16B',
  },
  lines: {
    eyebrow: 'Linie PRO-KOM',
    heading: 'Jedna firma, kilka specjalizacji.',
    lead: 'Instalacje to jedna z linii PRO-KOM. Gdy obiekt potrzebuje kasy, komputera, strony internetowej albo naprawy sprzętu, robimy to w tej samej firmie.',
    items: [
      {
        icon: 'cpu',
        title: 'Biznes',
        text: 'Kasy fiskalne, systemy sprzedaży, komputery, programy i opieka IT dla firm.',
        link: 'prokombiznes.pl →',
        href: 'https://prokombiznes.pl',
      },
      {
        icon: 'globe',
        title: 'Software',
        text: 'Strony internetowe, panele i aplikacje dla firm i obiektów.',
        link: 'prokomsoftware.pl →',
        href: 'https://prokomsoftware.pl',
      },
      {
        icon: 'wrench',
        title: 'Tech · serwis',
        text: 'Naprawy komputerów, laptopów i telefonów w salonie.',
        link: 'prokomserwis.pl →',
        href: 'https://prokomserwis.pl',
      },
      {
        icon: 'net',
        title: 'Instalacje',
        text: 'Monitoring, alarmy, dostęp, sieci, smart home, nagłośnienie, ekrany, ładowarki, teletechnika.',
        link: 'Jesteś tutaj',
        href: '/',
        current: true,
      },
    ] satisfies LineCard[],
  },
  principles: {
    eyebrow: 'Jak pracujemy',
    heading: 'Zasady, których się trzymamy.',
    items: [
      {
        icon: 'eye',
        title: 'Najpierw wizja lokalna',
        text: 'Nie wyceniamy w ciemno. Oglądamy obiekt i dopiero wtedy proponujemy rozwiązanie.',
      },
      {
        icon: 'doc',
        title: 'Wycena na piśmie',
        text: 'Zakres, sprzęt i cena czarno na białym, zwykle w wariantach do wyboru.',
      },
      {
        icon: 'layers',
        title: 'Projekt całości',
        text: 'Kamery, sieć, alarm i reszta zaprojektowane razem, żeby do siebie pasowały.',
      },
      {
        icon: 'check',
        title: 'Odbiór przy Tobie',
        text: 'Sprawdzamy działanie razem z Tobą i pokazujemy, jak korzystać z systemu.',
      },
      {
        icon: 'wrench',
        title: 'Serwis po montażu',
        text: 'Przeglądy przed sezonem i jeden numer do serwisu.',
      },
      { icon: 'pin', title: 'Blisko', text: 'Salon w Rabce-Zdroju, blisko obiektów na Podhalu.' },
    ] satisfies { icon: InstIconName; title: string; text: string }[],
  },
  data: {
    company: 'Dane firmy',
    salons: 'Salon',
    nip: 'NIP',
    // TODO(krystian): szef — „Zespół instalacji”: 2–3 osoby, zdjęcia, uprawnienia SEP,
    // certyfikaty producentów (prototyp: trzecia kolumna karty `#dane`).
  },
} as const
