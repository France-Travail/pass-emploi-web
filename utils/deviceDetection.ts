export function detectMobilePlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  const userAgent = window.navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios'
  }

  if (/android/.test(userAgent)) {
    return 'android'
  }

  return 'desktop'
}

export function getParcoursEmploiStoreUrl(): string {
  const platform = detectMobilePlatform()

  switch (platform) {
    case 'ios':
      return 'https://apps.apple.com/app/apple-store/id563863597?pt=1432235&ct=migration-cej&mt=8'
    case 'android':
      return 'https://play.google.com/store/apps/details?id=com.poleemploi.pemobile&referrer=utm_source=cej&utm_medium=cta&utm_campaign=migration_cej'
    default:
      return 'https://www.francetravail.fr/candidat/vos-services-en-ligne/applications-mobiles/appli-mopbile--smartphone-mes-of.html'
  }
}
