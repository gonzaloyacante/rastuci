'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, X, Smartphone, Monitor, Zap, Wifi, Bell } from 'lucide-react';
import { usePWA } from '@/lib/pwa';
import { useTranslation } from '@/lib/i18n';

interface PWAInstallPromptProps {
  className?: string;
  variant?: 'banner' | 'modal' | 'card';
  autoShow?: boolean;
  showFeatures?: boolean;
}

export function PWAInstallPrompt({
  className = '',
  variant = 'banner',
  autoShow = true,
  showFeatures = true,
}: PWAInstallPromptProps) {
  const { canInstall, promptInstall } = usePWA();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (autoShow && canInstall && !isDismissed) {
      // Show after a delay to avoid being intrusive
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, autoShow, isDismissed]);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!canInstall || isDismissed || !isVisible) {
    return null;
  }

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: t('pwa.features.faster'),
      description: t('pwa.features.fasterDesc'),
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: t('pwa.features.offline'),
      description: t('pwa.features.offlineDesc'),
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: t('pwa.features.notifications'),
      description: t('pwa.features.notificationsDesc'),
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: t('pwa.features.native'),
      description: t('pwa.features.nativeDesc'),
    },
  ];

  if (variant === 'banner') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${className}`}>
        <div className="surface border-t border-muted p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{t('pwa.install.title')}</h3>
                <p className="text-sm text-muted">{t('pwa.install.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleInstall} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('pwa.install.button')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${className}`}>
        <div className="surface rounded-lg max-w-md w-full p-6 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('pwa.install.title')}</h2>
            <p className="text-muted">{t('pwa.install.description')}</p>
          </div>

          {showFeatures && (
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-primary mt-0.5">{feature.icon}</div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDismiss} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleInstall} className="flex-1 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              {t('pwa.install.button')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className={`surface border border-muted rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold">{t('pwa.install.title')}</h3>
            <p className="text-sm text-muted">{t('pwa.install.subtitle')}</p>
          </div>
        </div>
        <Badge variant="secondary">{t('pwa.install.recommended')}</Badge>
      </div>

      {showFeatures && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="text-primary">{feature.icon}</div>
              <span className="text-sm font-medium">{feature.title}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleDismiss} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleInstall} className="flex-1 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          {t('pwa.install.button')}
        </Button>
      </div>
    </div>
  );
}

// Compact install button for header/navigation
export function PWAInstallButton({ className = '' }: { className?: string }) {
  const { canInstall, promptInstall } = usePWA();
  const { t } = useTranslation();

  if (!canInstall) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={promptInstall}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">{t('pwa.install.button')}</span>
    </Button>
  );
}

// Install status indicator
export function PWAStatus({ className = '' }: { className?: string }) {
  const { isInstalled, canInstall } = usePWA();
  const { t } = useTranslation();

  if (isInstalled) {
    return (
      <Badge variant="success" className={className}>
        <Monitor className="w-3 h-3 mr-1" />
        {t('pwa.status.installed')}
      </Badge>
    );
  }

  if (canInstall) {
    return (
      <Badge variant="secondary" className={className}>
        <Download className="w-3 h-3 mr-1" />
        {t('pwa.status.installable')}
      </Badge>
    );
  }

  return null;
}
