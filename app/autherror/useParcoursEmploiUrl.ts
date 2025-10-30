'use client'

import { useEffect, useMemo, useState } from 'react'

const URLS = {
  ios: 'https://apps.apple.com/app/apple-store/id563863597?pt=1432235&ct=migration-cej&mt=8',
  android:
    'https://play.google.com/store/apps/details?id=com.poleemploi.pemobile&referrer=utm_source=cej&utm_medium=cta&utm_campaign=migration_cej',
  desktop:
    'https://www.francetravail.fr/candidat/vos-services-en-ligne/applications-mobiles/appli-mopbile--smartphone-mes-of.html',
} as const

type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(ua: string): Platform {
  const userAgent = ua.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'desktop'
}

export function useParcoursEmploiUrl(): string {
  const [platform, setPlatform] = useState<Platform>('desktop')

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const platform = detectPlatform(navigator.userAgent)
      setPlatform(platform)
    }
  }, [])

  return useMemo(() => URLS[platform], [platform])
}
