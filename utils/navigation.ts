export function navigateTo(url: string): void {
  // Navigation complète voulue (route API qui redirige vers l'IdP), pas une navigation client Next.
  window.location.assign(url)
}
