import { parseCount } from '@/lib/motion/countUp'

/**
 * A figure of an Instalacje fact split for the count-up (I-M): words before the number stay
 * still („od 2004” → „od ” + „2004”), the rest is the shared `CountUp` text. `null` when there is
 * nothing to count („1 200+”, „Rabka”) — the text is then shown as it is.
 */
export function splitCount(text: string): { prefix: string; count: string } | null {
  const match = /^(\D*?)(\d.*)$/.exec(text.trim())
  if (!match) return null
  const [, prefix = '', count = ''] = match
  // A prefix of words only (not „-5”, „~3”, „nr 2”).
  if (prefix && !/^[\p{L} ]+ $/u.test(prefix)) return null
  return parseCount(count) ? { prefix, count } : null
}
