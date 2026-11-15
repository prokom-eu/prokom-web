import type { SoftwareHome } from './home'

/** A stage of „Jak pracujemy i jak powstaje cena” ready to render (spec. §4 pkt 6). */
export type ProcessStage = {
  num: string
  name: string
  /** „30 min”, „5–7 dni”; `null` while its fact is missing on production. */
  duration: string | null
  heading: string
  text: string | null
  get: string[]
  you: string[]
  pay: string | null
  payNote: string | null
}

/** `fillText` with the page's context: `null` = do not render (missing fact on production). */
export type Fill = (text: string) => string | null

/**
 * Stages of the process with their facts filled (`[DNI]`, `[TYGODNIE]`, `[ZALICZKA]`, …). On
 * production a text with a missing fact is left out, not shown with its placeholder: a list
 * loses that point, a single text becomes empty, and a stage without its name or heading is
 * skipped — the tabs would make no sense without them.
 */
export function processStages(stages: SoftwareHome['process'], fill: Fill): ProcessStage[] {
  return stages.flatMap((stage) => {
    const name = fill(stage.n)
    const heading = fill(stage.h)
    if (!name || !heading) return []
    return [
      {
        num: stage.num,
        name,
        duration: fill(stage.t),
        heading,
        text: fill(stage.p),
        get: list(stage.get, fill),
        you: list(stage.you, fill),
        pay: fill(stage.pay),
        payNote: fill(stage.payd),
      },
    ]
  })
}

function list(items: readonly string[], fill: Fill): string[] {
  return items.flatMap((item) => fill(item) ?? [])
}

/**
 * „Etap {num} · {t}” of the stage panel. Without a duration the part from the last separator
 * before `{t}` goes too, so no „Etap 02 · ” is left.
 */
export function stageEyebrow(
  template: string,
  stage: Pick<ProcessStage, 'num' | 'duration'>,
): string {
  const withNum = template.replaceAll('{num}', stage.num)
  if (stage.duration) return withNum.replaceAll('{t}', stage.duration)
  return withNum.replace(/\s*[·–—-]?\s*\{t\}/g, '').trim()
}
