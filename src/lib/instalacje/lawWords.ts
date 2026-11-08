/**
 * Runda v6 §1.1 (decision 08.11.2026): words of law that must not appear on the Instalacje pages
 * — the legal pages (`/polityka-prywatnosci`, `/cookies`, `/dostepnosc`) and form consents aside.
 * One list for the data tests (Vitest) and the page content test (e2e).
 * Case-sensitive on purpose: the section id `#rodo` and the slug `monitoring-a-rodo` are not text.
 * „ustawimy / ustawienie” are allowed: only the noun „ustawa” and its forms are caught.
 */
export const LAW_WORDS =
  /[Kk]odeks|(?<!\p{L})[Aa]rt\. ?\d|(?<!\p{L})[Uu]staw(a|y|ie|ą|ę|om|ach|ami)(?!\p{L})|[Uu]stawodaw|[Rr]ozporządz|TSUE|Dz\.\s?U|NIS2|[Pp]orad(a|y) prawn|ZAiKS|STOART|(?<!\p{L})UKE(?!\p{L})|(?<!\p{L})UDT(?!\p{L})|RODO|Prawo budowlane|Prawa budowlanego|[Ww]arunk(i|ów|ach|ami) techniczn|[Kk]oncesj|[Uu]chwał|§|UODO|EROD|(?<!\p{L})Pzp(?!\p{L})|[Pp]rzepis/u
