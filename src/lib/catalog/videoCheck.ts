/**
 * Weekly check of producers' films (ADR-016): YouTube's oEmbed answers 401 for a private film
 * or one that can no longer be embedded and 404 for a removed one — such a film is switched off
 * (`active = false`) and the administrators get one mail. Any other answer or a network error
 * changes nothing: a short YouTube outage must not hide the films.
 */

export type VideoStatus = 'available' | 'unavailable' | 'unknown'

type VideoRow = { youtubeId: string; active?: boolean | null }

export function oembedStatus(httpStatus: number | null): VideoStatus {
  if (httpStatus === 200) return 'available'
  if (httpStatus === 401 || httpStatus === 404) return 'unavailable'
  return 'unknown'
}

export function oembedUrl(youtubeId: string): string {
  const watch = `https://www.youtube.com/watch?v=${youtubeId}`
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`
}

/** HTTP status of the oEmbed answer, `null` when there was none (network, timeout). */
export type FetchStatus = (url: string) => Promise<number | null>

/** Asks once per active film, one after another (a few hundred a week at most). */
export async function checkVideos(
  videos: VideoRow[],
  fetchStatus: FetchStatus,
): Promise<{ checked: number; unknown: number; unavailable: Set<string> }> {
  const ids = [...new Set(videos.filter((video) => video.active !== false).map((v) => v.youtubeId))]
  const unavailable = new Set<string>()
  let unknown = 0
  for (const id of ids) {
    const status = oembedStatus(await fetchStatus(oembedUrl(id)))
    if (status === 'unavailable') unavailable.add(id)
    if (status === 'unknown') unknown += 1
  }
  return { checked: ids.length, unknown, unavailable }
}

/** The record's films with the unavailable ones off; `switched` = those that were on. */
export function switchOff<T extends VideoRow>(
  videos: T[],
  unavailable: ReadonlySet<string>,
): { videos: T[]; switched: T[] } {
  const switched: T[] = []
  const next = videos.map((video) => {
    if (video.active === false || !unavailable.has(video.youtubeId)) return video
    switched.push(video)
    return { ...video, active: false }
  })
  return { videos: next, switched }
}

export type CheckedRecord = {
  /** Where the film was, as the panel names it („Produkt „Posnet Ergo””, „Salon Lenovo”). */
  where: string
  films: { youtubeId: string; title: string }[]
  /** Not switched off: the product has an unpublished draft the job must not overwrite. */
  manual?: boolean
}

const lineOf = (record: CheckedRecord) =>
  record.films.map((film) => `- ${record.where}: ${film.title} (${film.youtubeId})`)

export function switchedOffMail(records: CheckedRecord[]): { subject: string; text: string } {
  const switched = records.filter((record) => !record.manual).flatMap(lineOf)
  const manual = records.filter((record) => record.manual).flatMap(lineOf)
  return {
    subject: `Filmy YouTube niedostępne: ${switched.length + manual.length}`,
    text: [
      'Cotygodniowe sprawdzenie filmów (YouTube oEmbed) znalazło filmy, których nie da się już osadzić — usunięte albo prywatne.',
      ...(switched.length ? ['', 'Wyłączone (zniknęły ze strony):', ...switched] : []),
      ...(manual.length
        ? [
            '',
            'Do wyłączenia ręcznie — produkt ma nieopublikowany szkic, zadanie go nie nadpisuje:',
            ...manual,
          ]
        : []),
      '',
      'Panel → Produkty / Partnerzy → Filmy: wstaw nowy film producenta albo zostaw wyłączony.',
    ].join('\n'),
  }
}
