import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Periodically checks for service worker updates (every 60s).
 * Shows a toast banner when a new version is available,
 * then reloads the page to activate the update.
 */
export function PWAUpdatePrompt() {
  const { t } = useTranslation();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Check for SW updates every 60 seconds
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-lg">
        <RefreshCw className="h-4 w-4 text-[var(--primary)] animate-spin" />
        <span className="text-sm">{t('pwa.updateAvailable')}</span>
        <Button size="sm" onClick={() => updateServiceWorker()}>
          {t('pwa.reload')}
        </Button>
      </div>
    </div>
  );
}
