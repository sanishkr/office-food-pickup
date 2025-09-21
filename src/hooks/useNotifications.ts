import { useState, useEffect } from "react";

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // Update permission status
    setNotificationPermission(Notification.permission);

    // Register service worker for better cross-platform support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSwRegistration(registration);
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return "denied";
    }

    try {
      // Request permission and handle iOS/Safari specific behavior
      let permission: NotificationPermission;
      
      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        // For iOS, we need to check if we can request permissions
        if (window.Notification && Notification.permission === "default") {
          permission = await Notification.requestPermission();
        } else {
          permission = Notification.permission;
        }
      } else {
        permission = await Notification.requestPermission();
      }

      console.log("Notification permission:", permission); // Debug log
      setNotificationPermission(permission);
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  const sendNotification = async (title: string, options?: NotificationOptions) => {
    console.log("Attempting to send notification:", {
      title,
      permission: notificationPermission,
      hasServiceWorker: !!swRegistration,
      platform: navigator.platform,
      userAgent: navigator.userAgent
    });

    if (notificationPermission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    try {
      // Try using service worker first for better mobile support
      if (swRegistration) {
        const notificationOptions: NotificationOptions = {
          requireInteraction: true, // Keep notification visible until user interacts
          silent: false, // Ensure sound plays
          tag: options?.tag || "food-pickup", // Group notifications
          badge: "/pwa-192x192.png", // Show badge on mobile
          icon: "/pwa-192x192.png", // Show icon in notification
          ...options,
        };

        // Add vibration for mobile devices
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }

        await swRegistration.showNotification(title, notificationOptions);
        console.log("Notification sent successfully via Service Worker");
        return;
      }

      // Fallback to regular notifications with sound
      const playNotificationSound = async () => {
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2); // Short beep
          } catch (err) {
            console.log('Could not play notification sound:', err);
          }
        }
      };

      const notification = new Notification(title, {
        requireInteraction: true,
        icon: "/pwa-192x192.png",
        ...options,
      });

      await playNotificationSound();

      // Add click handler
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        notification.close();
      };

      console.log("Notification sent successfully via native API");
    } catch (error) {
      console.error("Error sending notification:", error);
      // Try one last time with basic notification
      try {
        new Notification(title, { icon: '/pwa-192x192.png' });
        console.log("Basic notification sent as fallback");
      } catch (e) {
        console.error("Failed to send even basic notification:", e);
      }
    }
  };

  return {
    notificationPermission,
    requestPermission,
    sendNotification,
  };
}
