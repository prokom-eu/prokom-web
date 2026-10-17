type Level = 'info' | 'warn' | 'error'

/**
 * Structured fields of a log line: ids, the tenant, counts, error classes — never form data
 * (e-mail, phone, name, message; ADR-003). An `Error` value is logged as its class only, because
 * database and SMTP messages quote query parameters and recipients.
 */
export type LogFields = Record<string, unknown>

export type Logger = Record<Level, (fields: LogFields, msg: string) => void> & {
  /** A logger that adds `bound` (e.g. `requestId`, `tenant`) to every line. */
  child: (bound: LogFields) => Logger
}

type LoggerOptions = {
  write?: (line: string) => void
  now?: () => Date
}

// Written last, so a field named like them cannot fake the level, time or message.
const FIXED = new Set(['level', 'time', 'msg'])

function serialize(fields: LogFields): LogFields {
  const out: LogFields = {}
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || FIXED.has(key)) continue
    out[key] = value instanceof Error ? value.name : value
  }
  return out
}

/**
 * One JSON line per entry on stdout (Docker collects and rotates it): `level`, `time`, `msg` and
 * fields such as `tenant` and `requestId`. Own code instead of a library: a few lines cover it.
 */
export function createLogger(options: LoggerOptions = {}, bound: LogFields = {}): Logger {
  const write = options.write ?? ((line: string) => process.stdout.write(`${line}\n`))
  const now = options.now ?? (() => new Date())

  const entry = (level: Level) => (fields: LogFields, msg: string) => {
    write(
      JSON.stringify({
        level,
        time: now().toISOString(),
        ...serialize({ ...bound, ...fields }),
        msg,
      }),
    )
  }

  return {
    info: entry('info'),
    warn: entry('warn'),
    error: entry('error'),
    child: (more) => createLogger(options, { ...bound, ...more }),
  }
}

/** The app's logger (stdout). */
export const log = createLogger()
