/**
 * Texts of the Software industry pages that the package keeps only on the board `Branza` v22
 * (`branze.json` has the problems, modules, offline steps, cards and questions). Keyed by the
 * package content (`pagesAtStart[].content`); only „budowlanka” has a page at start.
 * TODO(krystian): treści pozostałych 11 branż (pisane w czacie, spec. §6.2) — do tego czasu
 * `active=false`.
 */
export const INDUSTRY_PAGE_TEXTS = {
  budowlanka: {
    hero: {
      title: 'Oprogramowanie dla firm, które pracują',
      lead: 'Zlecenia idą SMS-em, godziny są na kartkach, protokoły giną w aucie, a wieczorem wszystko trzeba przepisać. Znamy to z własnych ekip instalacyjnych PRO-KOM.',
      ctaLabel: 'Złóż system dla swojej firmy',
    },
    page: {
      heroAccent: 'w terenie, nie przy biurku.',
      hubTitle: '3 ekipy',
      hubCaption: 'jeden system',
      problemsEyebrow: 'Co zabiera czas w budowlance',
      problemsLead:
        'Cztery rzeczy, które słyszymy od właścicieli firm remontowych i instalacyjnych. Do każdej mamy gotowe rozwiązanie.',
      solutionsEyebrow: 'Najczęściej w budowlance',
      faqEyebrow: 'Pytania z budowlanki',
      offlineBox: {
        eyebrow: 'Działa bez zasięgu',
        title: 'Na budowie w górach zasięg bywa słaby.',
        accent: 'Aplikacja o tym wie',
        lead: 'Pracownik robi swoje: odhacza, fotografuje, zbiera podpis. Telefon zapisuje wszystko u siebie i wysyła, gdy złapie sieć. Nikt nie musi o tym pamiętać.',
        noteLabel: 'Aplikacja ekipy może mówić',
        noteValue: 'PL · UA · EN',
        noteCaption: 'języki ustalamy w wycenie',
      },
      contact: {
        eyebrow: 'Porozmawiajmy o Twojej firmie',
        title: 'Pokaż, jak dziś pracują Twoje ekipy',
        lead: '30 minut rozmowy u Ciebie, w salonie w Rabce albo online. Potem szkic do klikania i wycena, bez zobowiązań.',
        points: [
          'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]',
          'Cena i termin w umowie, raty po etapach',
          'Kod, dane i dostępy należą do Ciebie',
        ],
      },
    },
  },
} as const
