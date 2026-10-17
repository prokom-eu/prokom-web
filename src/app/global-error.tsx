'use client'

import './(sites)/globals.css'

type Props = { error: Error & { digest?: string }; retry: () => void }

// Error in a root layout: replaces the whole document (Next docs), so no header, no tenant,
// no line colour — the main PRO-KOM tokens. Kept minimal on purpose; nothing here can fail.
export default function GlobalError({ error, retry }: Props) {
  return (
    <html lang="pl">
      <body>
        <title>Błąd — PRO-KOM</title>
        <main className="mx-auto max-w-2xl px-4 py-24">
          <h1 className="font-display text-3xl font-bold text-ink">Coś poszło nie tak</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            Nie udało się wyświetlić strony. Spróbuj ponownie za chwilę.
          </p>
          {error.digest && <p className="mt-2 text-sm text-ink-2">Kod błędu: {error.digest}</p>}
          <button
            type="button"
            onClick={() => retry()}
            className="mt-8 min-h-11 rounded-xl bg-accent-text px-6 py-2.5 font-bold text-accent-ink"
          >
            Spróbuj ponownie
          </button>
        </main>
      </body>
    </html>
  )
}
