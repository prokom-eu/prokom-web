/** Colours of the home page tiles (need tiles, industries) — tokens `--tone-*`, Biznes only. */
export type Tone = 'green' | 'red' | 'blue' | 'violet'

// Whole class names, so Tailwind finds them.
export const TONE_ICON: Record<Tone, string> = {
  green: 'from-tone-green to-tone-green-2 shadow-[0_12px_22px_-10px_var(--tone-green)]',
  red: 'from-tone-red to-tone-red-2 shadow-[0_12px_22px_-10px_var(--tone-red)]',
  blue: 'from-tone-blue to-tone-blue-2 shadow-[0_12px_22px_-10px_var(--tone-blue)]',
  violet: 'from-tone-violet to-tone-violet-2 shadow-[0_12px_22px_-10px_var(--tone-violet)]',
}
