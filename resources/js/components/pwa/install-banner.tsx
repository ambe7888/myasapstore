import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const DISMISS_KEY = 'pwa-banner-dismissed';
const DISMISS_DAYS = 7;

export function PWAInstallBanner() {
  const { canInstall, install, isInstalled } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Only show on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile || isInstalled) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    // Show banner after 5 seconds
    if (canInstall) {
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    setInstalling(true);
    const result = await install();
    setInstalling(false);
    if (result === 'accepted') {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!visible || !canInstall) return null;

  return (
    <div
      className="fixed bottom-20 left-3 right-3 z-[60] md:hidden"
      style={{ animation: 'slideUpFade 0.4s ease-out' }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #00b87c 0%, #00a36d 100%)',
          boxShadow: '0 8px 32px rgba(0,184,124,0.35)',
        }}
      >
        {/* Icon */}
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone size={24} className="text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">
            Installer l'application
          </p>
          <p className="text-white/80 text-xs mt-0.5 leading-tight">
            Accédez à votre boutique plus rapidement
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex items-center gap-1.5 bg-white text-[#00b87c] font-bold text-xs px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Download size={13} />
            {installing ? '...' : 'Installer'}
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
