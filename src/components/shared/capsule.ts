/**
 * Class names of the header capsule (NAGLOWEK-KAPSULA §2–6; styles in `src/styles/wspolne.css`).
 * The lines keep their own mega menu logic and put these classes on their trigger and panel, so
 * the capsule looks and behaves the same everywhere:
 *   trigger: `<button className={CAPSULE.link} aria-expanded aria-controls>` (open = `aria-expanded`)
 *   panel:   `<div className={CAPSULE.mega}>` — under the capsule, the same width, a bridge above.
 */
export const CAPSULE = {
  /** Menu link or mega trigger; the current page is `aria-current="page"`. */
  link: 'cap-link',
  /** Mega menu panel, 10 px under the capsule (absolute in the capsule). */
  mega: 'cap-mega',
  /** 44 px button with an icon (theme, phone, menu). */
  iconButton: 'cap-btn',
  /** „Szukaj · Ctrl K” button. */
  searchButton: 'cap-btn cap-btn--search',
  /** Text button with an optional count („Twój projekt”). */
  pillButton: 'cap-btn cap-btn--pill',
  /** Count pill inside a button or the action. */
  count: 'cap-count',
} as const
