import Kontakt from '../../../seed/prokominstalacje/strony-zrzut/Kontakt.json'
import type { Page } from '../../payload-types'

type Block = NonNullable<Page['layout']>[number]

/**
 * Pages built in code (I11 forms, I12 offer, realizations, about, guide): the seed gives their
 * page its block once — an empty page or
 * the sample page of `pnpm seed` (`kontakt`), never one with a block of the line — with the hero
 * texts of the prototype (`zrodlo/pages/<Strona>.body.html` — the package has no hero texts for
 * them), and publishes it. No band texts for `zaplanuj`: the page has no CTA band (prototype
 * meta `cta: false`). Changing this file also refreshes
 * the seeded database CI caches by a hash of `src/seed/**` (see `servicePages.ts`).
 */
export const FORM_PAGE_BLOCKS: Record<string, () => Block> = {
  zaplanuj: () => ({
    blockType: 'instPlanner',
    hero: {
      crumb: 'Zaplanuj instalację',
      // INST-6 PR4 (runda v6 §2): H1 = the topic and the region, a 2-sentence lead.
      eyebrow: 'Kreator wyceny',
      h1a: 'Zaplanuj instalację w domu, pensjonacie albo firmie',
      h1b: 'na Podhalu',
      lead: 'Zaznacz, co chcesz zamontować, opisz obiekt i zostaw numer telefonu. Oddzwonimy do 24 h w dni robocze i umówimy wizję lokalną.',
    },
  }),
  kontakt: () => ({
    blockType: 'instContact',
    hero: {
      crumb: 'Kontakt',
      eyebrow: 'Kontakt · PRO-KOM Instalacje',
      h1a: 'Kontakt:',
      h1b: 'salon w Rabce-Zdroju.',
      lead: 'Zadzwoń, napisz albo wpadnij do salonu. Działamy na Podhalu i w okolicach, dalej w Małopolsce dojazd ustalamy indywidualnie. Sprawdź, w jakiej strefie jest Twój obiekt.',
    },
    cta: { eyebrow: Kontakt.dane.ctaEye, heading: Kontakt.dane.ctaH, text: Kontakt.dane.ctaP },
  }),
  serwis: () => ({
    blockType: 'instServiceDesk',
    hero: {
      crumb: 'Serwis i przeglądy',
      eyebrow: 'Serwis i przeglądy',
      h1a: 'Serwis kamer, alarmów i sieci',
      h1b: 'na Podhalu',
      lead: 'Naprawiamy i przeglądamy kamery, alarmy, Wi-Fi, zamki, smart home, nagłośnienie, ekrany i ładowarki, także po innej firmie. Wiele usterek sprawdzamy zdalnie, a przed sezonem robimy przeglądy, żeby awarie nie trafiały się w pełnym obłożeniu.',
      facts: [
        { value: 'Rabka-Zdrój', label: 'salon i serwis' },
        { value: 'zdalnie', label: 'diagnoza wielu usterek' },
        { value: 'od 2004', label: 'PRO-KOM na Podhalu' },
      ],
      tags: ['Awarie', 'Przeglądy sezonowe', 'Przejęcie instalacji', 'Umowy serwisowe'],
      cta: { text: 'Umów przegląd', href: '#plany' },
    },
    // Written here, not from the package (`Serwis.dane` would skip the INST-6 dictionary).
    cta: {
      eyebrow: 'Serwis',
      heading: 'Zgłoś usterkę albo umów przegląd przed sezonem',
      text: 'Opisz w formularzu, co nie działa. Odpowiadamy do 24 h w dni robocze: oddzwonimy albo odpiszemy.',
    },
  }),
  // The architects' page (I16a, ADR-I005): hero of `Architekci.body.html`; no band (meta `cta: false`).
  'dla-architektow': () => ({
    blockType: 'instArchitects',
    hero: {
      crumb: 'Dla architektów',
      eyebrow: 'Dla architektów',
      h1a: 'Instalacje w projekcie domu i inwestycji',
      h1b: 'na Podhalu',
      lead: 'Nanosimy monitoring, sieć, smart home Ampio, dźwięk, ekrany i ładowarki na Twoje rzuty i dajemy wytyczne do projektu. Pracujemy z architektami, projektantami wnętrz i deweloperami na Podhalu i w Małopolsce.',
      facts: [
        { value: 'od 2004', label: 'instalacje na Podhalu' },
        { value: '10 instalacji', label: 'jeden wykonawca, jeden opiekun' },
        { value: '17 punktów', label: 'do zaplanowania w typowym domu' },
        { value: '24 miesiące', label: 'gwarancji na montaż' },
      ],
    },
  }),
  // I12: `Oferta.body.html` — the eyebrow with the counts is built by the block when empty; the
  // lead without „ekrany w dwóch salonach naraz” (one salon, boss 01.11.2026).
  uslugi: () => ({
    blockType: 'instOffer',
    hero: {
      crumb: 'Pełna oferta',
      // INST-6 PR3 (runda v6 §2): the H1 says the offer and the region.
      h1a: 'Instalacje dla domu, pensjonatu i firmy',
      h1b: 'na Podhalu',
      lead: 'Montujemy monitoring, alarmy, Wi-Fi, smart home, nagłośnienie, ekrany, anteny i ładowarki. Wybierz rodzaj obiektu albo wpisz, czego szukasz, a pokażemy pasujące rozwiązania.',
    },
    cta: {
      eyebrow: 'Pełna oferta',
      heading: 'Pomożemy ułożyć zestaw pod Twój obiekt',
      text: 'Opisz obiekt, a zaproponujemy, od czego zacząć, i przygotujemy wycenę na piśmie.',
    },
  }),
  realizacje: () => ({
    blockType: 'instRealizations',
    hero: {
      crumb: 'Realizacje',
      eyebrow: 'Realizacje',
      h1a: 'Realizacje: nagłośnienie, ekrany i projekcja',
      h1b: 'w Małopolsce i okolicach',
      lead: 'Pokazujemy obiekty, w których montowaliśmy nagłośnienie, ekrany, projekcję, sieci i anteny: firmy, parafie, szkoły i lokale. Wybierz rodzaj instalacji albo obiektu, żeby zawęzić listę.',
    },
    cta: {
      eyebrow: 'Podobny obiekt',
      heading: 'Zaplanuj podobną instalację w swoim obiekcie',
      text: 'Opisz obiekt, a zaproponujemy rozwiązanie. Po montażu, jeśli się zgodzisz, pokażemy go tutaj.',
    },
  }),
  // `OFirmie.body.html` with one salon (boss 01.11.2026).
  'o-firmie': () => ({
    blockType: 'instAbout',
    hero: {
      crumb: 'O firmie',
      eyebrow: 'PRO-KOM · Rabka-Zdrój · od 2004 roku',
      h1a: 'Firma z Podhala,',
      h1b: 'która zostaje po montażu.',
      lead: 'PRO-KOM z Rabki-Zdroju montuje monitoring, alarmy, sieci i smart home, a w tej samej firmie dostarcza kasy, komputery, serwis i oprogramowanie. Od 2004 roku obsługujemy domy, firmy i obiekty turystyczne na Podhalu. Salon mamy w Rabce-Zdroju.',
      facts: [
        { value: 'od 2004', label: 'na Podhalu' },
        { value: '1 salon', label: 'Rabka-Zdrój, ul. Orkana 16B' },
        { value: '4 linie', label: 'Biznes, Software, Tech, Instalacje' },
      ],
    },
    cta: {
      eyebrow: 'Poznajmy się',
      heading: 'Wpadnij do salonu albo zaproś nas do siebie.',
      text: 'Rabka-Zdrój, ul. Orkana 16B. Albo wizja lokalna w Twoim obiekcie.',
    },
  }),
  // `Poradnik.body.html`; spec §2: no source lists — the lead says „z datą aktualizacji” only.
  poradnik: () => ({
    blockType: 'instGuide',
    hero: {
      crumb: 'Poradnik',
      eyebrow: 'Poradnik · technika i praktyka',
      h1a: 'Poradnik:',
      // Audit 09.11: a heading without a full stop (runda v6 §2.2).
      h1b: 'monitoring, Wi-Fi i instalacje w obiektach na Podhalu',
      lead: 'Odpowiedzi, zanim zadasz pytanie. Krótkie poradniki dla właścicieli domów, pensjonatów i firm. Piszemy tak, jak tłumaczymy klientom na wizji lokalnej.',
    },
    cta: {
      eyebrow: 'Poradnik',
      heading: 'Nie znalazłeś odpowiedzi? Zapytaj nas wprost.',
      text: 'Opisz sytuację w kilku zdaniach. Odpowiemy po ludzku, bez lania wody.',
    },
  }),
}

// Blocks of the sample `kontakt` page of `pnpm seed` (`src/seed/sample.ts`).
const SAMPLE_BLOCKS = new Set(['contact', 'inquiryForm'])

/**
 * A page the seed may fill: empty, or exactly the sample page of `pnpm seed`. A page laid out
 * in the panel — with the line's block or with other blocks — is left alone.
 */
export const needsFormBlock = (layout: readonly { blockType: string }[] | null | undefined) =>
  (layout ?? []).every((block) => SAMPLE_BLOCKS.has(block.blockType))
