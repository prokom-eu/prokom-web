/**
 * Runda v6 §2.2 p. 2: phrasings that read like generated copy and must not appear in the texts of
 * the Instalacje pages — „X, a nie Y”, „nie X, tylko Y”, „Twój inteligentny…”, „na żywo”,
 * „kompleksowo” and the empty praise of the list. One list for the data tests (Vitest) and the
 * page test (e2e). „nie …, tylko” is caught within one sentence only. `\s`, not a space: the
 * texts keep a non-breaking space after one-letter words („na żywo”, „a nie”).
 */
export const COPY_WORDS =
  /,\sa\snie(?!\p{L})|(?<!\p{L})[Nn]ie\s[^.!?]*,\stylko(?!\p{L})|[Tt]wój\sinteligentny|(?<!\p{L})[Nn]a\sżywo(?!\p{L})|[Kk]ompleksow|[Bb]ez\skompromisów|[Ii]nnowacyjn|[Nn]ajwyższ(a|ej)\sjakoś/u
