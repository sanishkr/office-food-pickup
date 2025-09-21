import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    }
  };

  if (isInstalled) {
    return (
      <div className="p-3 mb-4 border border-green-200 rounded-lg mobile-hide-in-pwa bg-green-50">
        <div className="flex items-center">
          <div className="w-5 h-5 mr-2 text-green-600">✓</div>
          <p className="text-sm font-medium text-green-800">
            App installed! You can access it from your home screen.
          </p>
        </div>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="p-4 border border-blue-200 rounded-lg md:w-2/5 md:mx-auto bg-blue-50 dark:bg-blue-800">
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="w-6 h-6 text-blue-600 mr-3 mt-0.5">📱</div>
          <div>
            <h3 className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-100">
              Install ZomaNext
            </h3>
            <p className="mb-3 text-sm text-blue-700 dark:text-blue-400">
              Install this app on your device for quick access and offline
              functionality.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-200 dark:text-blue-900"
              >
                Install App
              </button>
              <button
                onClick={() => setIsInstallable(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
