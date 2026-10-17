import localFont from 'next/font/local'

// Files from the brand package (`04_zrodlo/fonty`, OFL licences next to them), served from our
// own domain; the build needs no network (ADR-007, S9a). Each file is one subset, and
// `next/font/local` cannot give a file its own `unicode-range`, so every subset is its own family
// and `globals.css` chains them: the browser takes each character from the first family that has
// it — Polish letters come from `latin-ext`. The `Fallback` metrics (less layout shift) sit on the
// last family of each chain. All four are preloaded, as before with Google: Polish text needs
// `latin-ext` on almost every page.

// Archivo: headings, numbers — with the width axis (the brand book sets it at 110–118 %), hence
// the `font-stretch` range. Font loader options must be literals (Next), so it is repeated.
export const archivoLatin = localFont({
  src: './fonts/archivo-latin-wdth-normal.woff2',
  weight: '100 900',
  display: 'swap',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
  adjustFontFallback: false,
  variable: '--font-archivo-latin',
})

export const archivoLatinExt = localFont({
  src: './fonts/archivo-latin-ext-wdth-normal.woff2',
  weight: '100 900',
  display: 'swap',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
  variable: '--font-archivo-latin-ext',
})

// Manrope: body text.
export const manropeLatin = localFont({
  src: './fonts/manrope-latin-wght-normal.woff2',
  weight: '200 800',
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-manrope-latin',
})

export const manropeLatinExt = localFont({
  src: './fonts/manrope-latin-ext-wght-normal.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-manrope-latin-ext',
})

/** Classes for `<html>` that declare all the font variables. */
export const fontVariables = [archivoLatin, archivoLatinExt, manropeLatin, manropeLatinExt]
  .map((font) => font.variable)
  .join(' ')
