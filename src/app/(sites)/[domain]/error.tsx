'use client'

import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'

type Props = { error: Error & { digest?: string }; retry: () => void }

// Unexpected error while rendering a page (e.g. the database is down). The header and footer
// of the line stay; no error details for visitors — the server log has them (by `digest`).
export default function SiteError({ error, retry }: Props) {
  return (
    <Section className="py-24">
      <Heading level={1} size="xl">
        Coś poszło nie tak
      </Heading>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
        Nie udało się wyświetlić tej strony. Spróbuj ponownie za chwilę.
      </p>
      {error.digest && <p className="mt-2 text-sm text-ink-2">Kod błędu: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button onClick={() => retry()}>Spróbuj ponownie</Button>
        <Button href="/" variant="secondary">
          Strona główna
        </Button>
      </div>
    </Section>
  )
}
