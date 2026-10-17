type RuleSource = { get(host: string): Promise<ReadonlyMap<string, string> | null> }

const NO_RULES: ReadonlyMap<string, string> = new Map()

/**
 * Rules of a host for the proxy. A redirect is an extra: when the rules cannot be read
 * (database down, Payload starting), the request goes on to the page instead of failing —
 * the page then shows its own error page if the database is really gone.
 */
export function createRedirectLookup(
  source: RuleSource,
  onError: (host: string, error: unknown) => void,
) {
  return async (host: string): Promise<ReadonlyMap<string, string>> => {
    try {
      return (await source.get(host)) ?? NO_RULES
    } catch (error) {
      onError(host, error)
      return NO_RULES
    }
  }
}
