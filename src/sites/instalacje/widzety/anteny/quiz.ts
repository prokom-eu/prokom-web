/** Answer index of a quiz question; `-1` = not answered yet (the prototype's state). */
export type Answer = -1 | 0 | 1 | 2

export type QuizKey = 'start' | 'receives' | 'noSignal' | 'newTv' | 'olderTv' | 'unknown'

/**
 * Result of „Czy mój telewizor jest gotowy?” (`Anteny.js`): the reception test wins over the
 * purchase date, „nie wiem / nie sprawdzałem” asks for the one test.
 */
export function quizResult(q1: Answer, q2: Answer): QuizKey {
  if (q2 === 0) return 'receives'
  if (q2 === 1) return 'noSignal'
  if (q1 === 0) return 'newTv'
  if (q1 === 1) return 'olderTv'
  if (q1 === 2 || q2 === 2) return 'unknown'
  return 'start'
}
