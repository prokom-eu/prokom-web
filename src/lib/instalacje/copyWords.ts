/**
 * Runda v6 §2.2 p. 2: phrasings that read like generated copy and must not appear in the texts of
 * the Instalacje pages — „X, a nie Y”, „nie X, tylko Y”, „Twój inteligentny…”, „na żywo”,
 * „kompleksowo” and the empty praise of the list. One list for the data tests (Vitest) and the
 * page test (e2e). „nie …, tylko” is caught within one sentence only.
 */
export const COPY_WORDS =
  /, a nie(?!\p{L})|(?<!\p{L})[Nn]ie [^.!?]*, tylko(?!\p{L})|[Tt]wój inteligentny|(?<!\p{L})[Nn]a żywo(?!\p{L})|[Kk]ompleksow|[Bb]ez kompromisów|[Ii]nnowacyjn|[Nn]ajwyższ(a|ej) jakoś/u
