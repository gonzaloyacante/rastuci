// PWA utilities and service worker management
import { useEffect, useState } from 'react';
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface AppNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    // Check if already installed
    this.checkInstallStatus();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as PWAInstallPrompt;
      this.dispatchEvent('installprompt-available');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.dispatchEvent('app-installed');
    });

    // Register service worker
    await this.registerServiceWorker();

    // Request notification permission
    await this.requestNotificationPermission();
  }

  private checkInstallStatus() {
    // Check if running in standalone mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check if installed via navigator
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as { getInstalledRelatedApps?: () => Promise<unknown[]> }).getInstalledRelatedApps?.().then((apps: unknown[]) => {
        this.isInstalled = apps.length > 0;
      });
    }
  }

  private dispatchEvent(type: string, detail?: unknown) {
    window.dispatchEvent(new CustomEvent(`pwa-${type}`, { detail }));
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.swRegistration = registration;

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.dispatchEvent('update-available');
            }
          });
        }
      });

      console.log('Service worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        this.isInstalled = true;
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      await this.swRegistration.update();
      
      // Skip waiting and activate new service worker
      if (this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async showNotification(options: AppNotificationOptions): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service worker not registered');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    await this.swRegistration.showNotification(options.title, ({
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-72x72.png',
      image: options.image,
      tag: options.tag,
      data: options.data,
      actions: options.actions,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
      vibrate: options.vibrate,
    } as NotificationOptions));
  }

  async scheduleNotification(options: AppNotificationOptions, delay: number): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service worker not registered');
    }

    // Send message to service worker to schedule notification
    this.swRegistration.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      payload: { options, delay },
    });
  }

  // Offline status management
  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Cache management
  async clearCache(cacheName?: string): Promise<void> {
    if (!('caches' in window)) return;

    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  }

  // Share API
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!('share' in navigator)) {
      // Fallback to clipboard
      if ('clipboard' in navigator && data.url) {
        await (navigator as { clipboard: { writeText: (text: string) => Promise<void> } }).clipboard.writeText(data.url);
        return true;
      }
      return false;
    }

    try {
      await (navigator as { share: (data: { title?: string; text?: string; url?: string }) => Promise<void> }).share(data);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }

  // Background sync
  async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      throw new Error('Background sync not supported');
    }

    await (this.swRegistration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
  }

  // Push notifications (requires server setup)
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      throw new Error('Service worker not registered');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      return true;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      return false;
    }
  }
}

// Global PWA manager instance
export const pwaManager = new PWAManager();

// React hooks for PWA features
export function usePWA() {
  const [canInstall, setCanInstall] = useState(pwaManager.canInstall());
  const [isInstalled, setIsInstalled] = useState(pwaManager.isAppInstalled());
  const [isOnline, setIsOnline] = useState(pwaManager.isOnline());

  useEffect(() => {
    const handleInstallPrompt = () => setCanInstall(true);
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('pwa-installprompt-available', handleInstallPrompt);
    window.addEventListener('pwa-app-installed', handleAppInstalled);

    const unsubscribeOnline = pwaManager.onOnlineStatusChange(setIsOnline);

    return () => {
      window.removeEventListener('pwa-installprompt-available', handleInstallPrompt);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
      unsubscribeOnline();
    };
  }, []);

  return {
    canInstall,
    isInstalled,
    isOnline,
    promptInstall: pwaManager.promptInstall.bind(pwaManager),
    showNotification: pwaManager.showNotification.bind(pwaManager),
    share: pwaManager.share.bind(pwaManager),
    subscribeToPush: pwaManager.subscribeToPush.bind(pwaManager),
    unsubscribeFromPush: pwaManager.unsubscribeFromPush.bind(pwaManager),
  };
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const result = await pwaManager.requestNotificationPermission();
    setPermission(result);
    return result;
  };

  return {
    permission,
    requestPermission,
    showNotification: pwaManager.showNotification.bind(pwaManager),
    scheduleNotification: pwaManager.scheduleNotification.bind(pwaManager),
  };
}

// Utility functions
export function formatCacheSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
