export type UrlsStoresMobile = {
  ios: string
  android: string
}

export const URLS_PARCOURS_EMPLOI: UrlsStoresMobile & { desktop: string } = {
  ios: 'https://apps.apple.com/app/apple-store/id563863597?pt=1432235&ct=migration-cej&mt=8',
  android:
    'https://play.google.com/store/apps/details?id=com.poleemploi.pemobile&referrer=utm_source=cej&utm_medium=cta&utm_campaign=migration_cej',
  desktop:
    'https://www.francetravail.fr/candidat/vos-services-en-ligne/applications-mobiles/appli-mopbile--smartphone-mes-of.html',
}

// L’application 1 jeune 1 solution est publiée sous le bundle de l’application CEJ (fr.fabrique.social.gouv.passemploi), pas sous celui de pass emploi (….passemploi.rsa)
export const URLS_1J1S: UrlsStoresMobile = {
  ios: 'https://apps.apple.com/app/apple-store/id1581603519',
  android:
    'https://play.google.com/store/apps/details?id=fr.fabrique.social.gouv.passemploi',
}
