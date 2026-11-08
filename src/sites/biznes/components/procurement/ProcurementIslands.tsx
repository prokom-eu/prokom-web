'use client'

import dynamic from 'next/dynamic'

// ADR-023: the client islands of the procurement pages get their own chunks, loaded only on
// pages that render them (SSR stays on). No `loading` — see `forms/ContactFormLazy.tsx`.
export const BrandMarquee = dynamic(() => import('./BrandMarquee').then((m) => m.BrandMarquee))
export const PageNav = dynamic(() => import('./PageNav').then((m) => m.PageNav))
export const WhoTabs = dynamic(() => import('./WhoTabs').then((m) => m.WhoTabs))
export const FaqSearch = dynamic(() => import('./FaqSearch').then((m) => m.FaqSearch))
export const SceneParallax = dynamic(() => import('./SceneParallax').then((m) => m.SceneParallax))
