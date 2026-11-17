import type { IconName } from '@/lib/shared/icons'

/*
 * The story of the company on pro-kom.eu/o-firmie (Krystian 16.11: „rozbudować, kilka zdań o
 * naszej firmie, teksty ze starej strony, konkretnie i marketingowo”). Written anew from the old
 * pro-kom.eu „Firma” page — its themes (since 2004, a solid base, gear chosen for the job, people
 * who know their trade, a client treated as a guest, work for years), not its jokes. No figures but
 * the founding year, no prices, no contact data (those come from the panel), promises only from
 * the agreed list (spec §3).
 */

export type AboutValue = { icon: IconName; title: string; text: string }
export type AboutStep = { mark: string; title: string; text: string }

export type HubAbout = {
  eyebrow: string
  title: string
  paragraphs: readonly string[]
  quote: string
  quoteBy: string
  steps: readonly AboutStep[]
  valuesEyebrow: string
  valuesTitle: string
  values: readonly AboutValue[]
  authorizationsTitle: string
}

export const HUB_ABOUT: HubAbout = {
  eyebrow: 'Nasza historia',
  title: 'Od 2004 roku robimy technikę, która po prostu działa.',
  paragraphs: [
    'Zaczynaliśmy w Rabce-Zdroju od komputerów, kas fiskalnych i serwisu elektroniki. Z czasem doszły programy dla firm, instalacje, oprogramowanie i komputery do gier — dziś to pięć linii pod jednym szyldem PRO-KOM.',
    'Wiemy, że ładnie wyglądający projekt to za mało: liczy się, czy działa na co dzień. Dlatego najpierw pytamy, do czego coś ma służyć, dobieramy sprzęt do zadania, a nie zadanie do sprzętu — i bierzemy odpowiedzialność za całość: od doradztwa, przez montaż, po serwis.',
  ],
  quote: 'Klient to dla nas nie numer zlecenia, tylko ktoś, z kim chcemy pracować latami.',
  quoteBy: 'Zespół PRO-KOM, Rabka-Zdrój',
  steps: [
    {
      mark: '2004',
      title: 'Start w Rabce-Zdroju',
      text: 'Komputery, kasy fiskalne i serwis elektroniki.',
    },
    {
      mark: 'Firmy',
      title: 'Programy i opieka IT',
      text: 'Kasy, programy sprzedażowe i stała opieka nad sprzętem firm.',
    },
    {
      mark: 'Obiekty',
      title: 'Instalacje na Podhalu',
      text: 'Monitoring, alarmy, sieci i nagłośnienie — od projektu po montaż.',
    },
    {
      mark: 'Dziś',
      title: 'Pięć linii, jeden telefon',
      text: 'Biznes, Instalacje, Software, Tech i Gaming — każda ze swoim zespołem.',
    },
  ],
  valuesEyebrow: 'Co nas wyróżnia',
  valuesTitle: 'Solidne zaplecze, ludzie, którzy znają się na rzeczy.',
  values: [
    {
      icon: 'users',
      title: 'Fachowcy od swojej działki',
      text: 'Kasy, sieci, kod czy naprawy — sprawę prowadzi ta linia, która zna się na niej najlepiej.',
    },
    {
      icon: 'sliders',
      title: 'Sprzęt dobrany do zadania',
      text: 'Najpierw pytamy, do czego ma służyć, potem dobieramy. Bez przepłacania za funkcje, których nie użyjesz.',
    },
    {
      icon: 'heart',
      title: 'Klient, nie numer zlecenia',
      text: 'Jeden numer do całej firmy. Pokierujemy do właściwej osoby i powiemy wprost, co da się zrobić.',
    },
    {
      icon: 'refresh',
      title: 'Na lata, nie na raz',
      text: 'Wdrażamy, serwisujemy i zostajemy pod telefonem — także po montażu i wdrożeniu.',
    },
  ],
  authorizationsTitle: 'Autoryzacje i partnerstwa',
}
