import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'

// Unknown or inactive domain, or a missing page. Deliberately generic: it must not reveal
// which domains this application serves (no tenant data, no links to other sites).
export default function NotFound() {
  return (
    <main>
      <Container className="py-24">
        <Heading level={1} size="xl">
          Nie znaleziono strony
        </Heading>
        <p className="mt-4 text-lg text-ink-2">
          Adres jest nieprawidłowy albo strona została usunięta.
        </p>
      </Container>
    </main>
  )
}
