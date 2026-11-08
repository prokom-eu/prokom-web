'use client'

import dynamic from 'next/dynamic'

// ADR-023: the client islands of the procurement pages get their own chunks, loaded only on
// pages that render them (SSR stays on). No `loading` — see `forms/ContactFormLazy.tsx`.
export const BrandMarquee = dynamic(() => import('./BrandMarquee').then((m) => m.BrandMarquee))
export const PageNav = dynamic(() => import('./PageNav').then((m) => m.PageNav))
export const WhoTabs = dynamic(() => import('./WhoTabs').then((m) => m.WhoTabs))
export const FaqSearch = dynamic(() => import('./FaqSearch').then((m) => m.FaqSearch))
export const SceneParallax = dynamic(() => import('./SceneParallax').then((m) => m.SceneParallax))
// B2-1c: one state for the page (`ProcurementConfigurator`) and the islands that read it.
export const ProcurementConfigurator = dynamic(() =>
  import('./ProcurementConfigurator').then((m) => m.ProcurementConfigurator),
)
export const ConfiguratorPanel = dynamic(() =>
  import('./Configurator').then((m) => m.ConfiguratorPanel),
)
export const OfferPreview = dynamic(() => import('./OfferPreview').then((m) => m.OfferPreview))
export const Schedule = dynamic(() => import('./Schedule').then((m) => m.Schedule))
export const ProcurementForm = dynamic(() =>
  import('./ProcurementForm').then((m) => m.ProcurementForm),
)
export const LiveChipText = dynamic(() => import('./Pickers').then((m) => m.LiveChipText))
export const ClassPick = dynamic(() => import('./Pickers').then((m) => m.ClassPick))
