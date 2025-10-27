import {
  detectMobilePlatform,
  getParcoursEmploiStoreUrl,
} from 'utils/deviceDetection'

// Mock de window.navigator.userAgent
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  })
}

describe('deviceDetection', () => {
  describe('detectMobilePlatform', () => {
    it('retourne desktop quand window est undefined', () => {
      // Given
      const originalWindow = global.window
      // @ts-expect-error window is not defined in the test environment
      delete global.window

      // When
      const result = detectMobilePlatform()

      // Then
      expect(result).toBe('desktop')

      // Cleanup
      global.window = originalWindow
    })

    it('retourne ios pour iPhone', () => {
      // Given
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')

      // When
      const result = detectMobilePlatform()

      // Then
      expect(result).toBe('ios')
    })

    it('retourne ios pour iPad', () => {
      // Given
      mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')

      // When
      const result = detectMobilePlatform()

      // Then
      expect(result).toBe('ios')
    })

    it('retourne ios pour iPod', () => {
      // Given
      mockUserAgent('Mozilla/5.0 (iPod; CPU iPhone OS 14_0 like Mac OS X)')

      // When
      const result = detectMobilePlatform()

      // Then
      expect(result).toBe('ios')
    })

    it('retourne android pour Android', () => {
      // Given
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G973F)')

      // When
      const result = detectMobilePlatform()

      // Then
      expect(result).toBe('android')
    })

    it('retourne desktop pour un navigateur desktop', () => {
      // Given
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      )

      // When
      const result = detectMobilePlatform()

      // Then
      expect(result).toBe('desktop')
    })
  })

  describe('getParcoursEmploiStoreUrl', () => {
    it("retourne l'URL App Store pour iOS", () => {
      // Given
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')

      // When
      const result = getParcoursEmploiStoreUrl()

      // Then
      expect(result).toBe(
        'https://apps.apple.com/app/apple-store/id563863597?pt=1432235&ct=migration-cej&mt=8'
      )
    })

    it("retourne l'URL Google Play pour Android", () => {
      // Given
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G973F)')

      // When
      const result = getParcoursEmploiStoreUrl()

      // Then
      expect(result).toBe(
        'https://play.google.com/store/apps/details?id=com.poleemploi.pemobile&referrer=utm_source=cej&utm_medium=cta&utm_campaign=migration_cej'
      )
    })

    it("retourne l'URL web pour desktop", () => {
      // Given
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      )

      // When
      const result = getParcoursEmploiStoreUrl()

      // Then
      expect(result).toBe(
        'https://www.francetravail.fr/candidat/vos-services-en-ligne/applications-mobiles/appli-mopbile--smartphone-mes-of.html'
      )
    })
  })
})
