export function navigateTo(url: string): void {
  // Navigation complète voulue (route API qui redirige vers l'IdP), pas une navigation client Next.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(url)
}
