'use client';

import React from 'react';
import { Download } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setSupported(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    (navigator as any).getInstalledRelatedApps?.().then((apps: any[]) => {
      if (apps.some((a: any) => a.platform === 'webapp')) {
        setIsInstalled(true);
      }
    }).catch(() => {});

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !supported) return null;

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-colors text-xs sm:text-sm font-bold shadow-lg shadow-cyan-600/20 whitespace-nowrap"
      title="تثبيت التطبيق"
    >
      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      <span>تثبيت التطبيق</span>
    </button>
  );
}
