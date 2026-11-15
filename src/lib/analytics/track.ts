import {
  isSafeEventData,
  type AnalyticsData,
  type AnalyticsEvent,
  type AnalyticsEvents,
  type AnalyticsForm,
} from './events'

type Umami = { track: (name: string, data?: AnalyticsData) => void }

declare global {
  interface Window {
    /** The Umami script (ADR-020); absent when analytics is off or blocked. */
    umami?: Umami
  }
}

type DataArgs<N extends AnalyticsEvent> = AnalyticsEvents[N] extends undefined
  ? []
  : [data: AnalyticsEvents[N]]

/**
 * Sends an analytics event (ADR-020). A no-op on the server, without the script (analytics off,
 * a blocker) and when the data does not look like identifiers — statistics never break a page
 * and never carry what a visitor typed.
 */
export function track<N extends AnalyticsEvent>(name: N, ...[data]: DataArgs<N>): void {
  if (typeof window === 'undefined') return
  const payload = data as AnalyticsData | undefined
  if (!isSafeEventData(payload)) return
  try {
    window.umami?.track(name, payload)
  } catch {
    // A blocked or failing script is not the visitor's problem.
  }
}

/**
 * `formularz_blad` for every rejected field of a form — names only, never the messages. The `form`
 * key (network error, inquiry limit, server error) is a failure, not a field, so it is left out.
 */
export function trackFormErrors(form: AnalyticsForm, errors: Readonly<Record<string, unknown>>) {
  for (const [field, message] of Object.entries(errors)) {
    if (message && field !== 'form') track('formularz_blad', { formularz: form, pole: field })
  }
}
