// The heavy part of the Software search window — loaded with the window's data, never in a
// page's first JS (review 16.11, AUDYT-WYDAJNOSC-1111 #6): the provider over the offer (catalog,
// prices) and the preview with the drawn post covers.
export { softwareSearchProvider } from '@/lib/software/searchEntries'
export { SearchPreview } from './SearchPreview'
