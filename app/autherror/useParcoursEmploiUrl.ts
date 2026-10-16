'use client'

import { useSyncExternalStore } from 'react'

import { URLS_PARCOURS_EMPLOI, UrlsStoresMobile } from './urlsStores'

type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(ua: string): Platform {
  const userAgent = ua.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'desktop'
}

function usePlatform(): Platform {
  return useSyncExternalStore(
    () => () => {},
    () => detectPlatform(navigator.userAgent),
    () => 'desktop' as Platform
  )
}

export function useMobileStoreUrl(urls: UrlsStoresMobile): string | undefined {
  const platform = usePlatform()
  return platform === 'desktop' ? undefined : urls[platform]
}

export function useParcoursEmploiUrl(): string {
  return URLS_PARCOURS_EMPLOI[usePlatform()]
}
