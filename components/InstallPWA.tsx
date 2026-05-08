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
      className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-colors text-sm font-bold shadow-lg shadow-cyan-600/20"
      title="تثبيت التطبيق"
    >
      <Download className="w-4 h-4" />
      <span className="hidden md:inline">تثبيت التطبيق</span>
    </button>
  );
}
