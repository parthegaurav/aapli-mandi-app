import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { t } from '../data/i18n.js';

export default function PwaInstallPrompt({ lang = 'mr' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('aapliMandi_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if app is already running in standalone mode (already installed PWA)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Capture the beforeinstallprompt event on Android Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Detect when app was successfully installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      // Manual instruction for Chrome on Android if beforeinstallprompt not yet triggered
      alert(
        lang === 'mr'
          ? 'ॲप इन्स्टॉल करण्यासाठी:\n१. Chrome ब्राऊझरच्या वरील उजव्या कोपऱ्यातील तीन ठिपक्यांवर (⋮) टॅप करा.\n२. "Install app" किंवा "Add to Home screen" निवडा.'
          : 'To install on your phone:\n1. Tap the 3 dots (⋮) in Chrome menu.\n2. Tap "Install app" or "Add to Home screen".'
      );
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('aapliMandi_pwa_dismissed', 'true');
  };

  // Do not show if already installed or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="no-print bg-gradient-to-r from-agri-700 via-agri-800 to-agri-900 text-white px-3 sm:px-4 py-2.5 shadow-md flex items-center justify-between gap-3 border-b border-agri-600/60 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
          <Smartphone className="w-5 h-5 text-agri-300" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold leading-tight truncate">
            <span>{lang === 'mr' ? 'आपली मंडी ॲप फोनवर इन्स्टॉल करा' : 'Install Aapli Mandi on your Phone'}</span>
            <span className="hidden sm:inline-block bg-highway-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-agri-200 truncate">
            {lang === 'mr'
              ? 'जलद गती, ऑफलाइन सपोर्ट व थेट होम स्क्रीन ॲप'
              : 'Fast loading, offline ready, one-tap home screen access'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="bg-white hover:bg-agri-50 active:scale-95 text-agri-800 font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation"
        >
          <Download className="w-3.5 h-3.5 text-agri-700 stroke-[2.5]" />
          <span>{lang === 'mr' ? 'इन्स्टॉल करा' : 'Install App'}</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-lg text-agri-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
