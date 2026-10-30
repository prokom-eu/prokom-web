'use client'

import { useEffect } from 'react'

import { LINE_THEME_COLORS } from '@/lib/brand/themeColor'
import type { Line } from '@/lib/tenant/lines'

import { useTheme } from './useTheme'

/**
 * Keeps the browser bar colour in step with a theme chosen by hand. The layout writes one
 * `<meta name="theme-color">` per system scheme (`lineViewport`); a choice (`html[data-theme]`)
 * wins over both. The same logic as the Instalacje shell (`ShellProvider`).
 */
export function useThemeColor(line: Line) {
  const [theme] = useTheme()
  useEffect(() => {
    const colors = LINE_THEME_COLORS[line]
    if (!colors) return
    const chosen = document.documentElement.getAttribute('data-theme')
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      const scheme = meta.media.includes('dark') ? 'dark' : 'light'
      meta.content = chosen === 'light' || chosen === 'dark' ? colors[chosen] : colors[scheme]
    }
  }, [line, theme])
}
