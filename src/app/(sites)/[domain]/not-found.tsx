import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'

// Missing page on a known domain: inside the line's header and footer, with a way back.
// An unknown domain never gets here — `requireTenant` in the layout falls back to the generic
// `(sites)/not-found.tsx`, which reveals nothing about the sites we serve.
export default function SiteNotFound() {
  return (
    <Section className="py-24">
      <Heading level={1} size="xl">
        Nie znaleziono strony
      </Heading>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
        Adres jest nieprawidłowy albo strona została przeniesiona lub usunięta.
      </p>
      <div className="mt-8">
        <Button href="/">Przejdź na stronę główną</Button>
      </div>
    </Section>
  )
}
