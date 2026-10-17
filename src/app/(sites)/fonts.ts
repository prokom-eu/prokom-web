import { Archivo, Manrope } from 'next/font/google'

// Downloaded at build time and served from our own domain: the visitor's browser never
// contacts Google (ADR-007, GDPR). `latin-ext` carries the Polish letters.

/** Headings, numbers — with the width axis (the brand book sets Archivo at 110–118 %). */
export const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
})

/** Body text. */
export const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-manrope',
})
