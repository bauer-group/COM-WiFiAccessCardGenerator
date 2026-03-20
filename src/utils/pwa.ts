export function isPWAStandalone(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if ('standalone' in navigator && (navigator as Record<string, unknown>).standalone === true) return true;
  if (document.referrer.includes('android-app://')) return true;
  return false;
}

export function isSecureContext(): boolean {
  return (
    window.isSecureContext ||
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

export function getPWAEnvironment() {
  return {
    isStandalone: isPWAStandalone(),
    isSecure: isSecureContext(),
    isOnline: navigator.onLine,
  };
}
