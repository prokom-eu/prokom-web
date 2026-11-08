/**
 * Content container of the shared page templates (Kontakt, O firmie, their FAQ): 1344 px, 20 px
 * gutter on a phone, 32 px from 768 px. From 1400 px the left gutter grows by `--rail-offset`
 * (`wspolne.css`, set only when the side rail is on the page), as the header capsule does — the
 * rail never covers the content (audit 08.11 §2 pkt 1). Without the rail the offset is 0.
 */
export const PAGE_CONTAINER =
  'mx-auto max-w-[1344px] px-5 min-[768px]:pr-8 min-[768px]:pl-[calc(32px+var(--rail-offset,0px))]'
