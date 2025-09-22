'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, SUPPORTED_LOCALES } from '@/lib/i18n';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'modal' | 'inline';
  showFlag?: boolean;
  showName?: boolean;
}

export function LanguageSelector({
  className = '',
  variant = 'dropdown',
  showFlag = true,
  showName = true,
}: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = availableLocales.find(l => l.code === locale);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {availableLocales.map((loc) => (
          <Button
            key={loc.code}
            variant={locale === loc.code ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleLocaleChange(loc.code)}
            className="flex items-center gap-2"
          >
            {showFlag && <span>{loc.flag}</span>}
            {showName && <span>{loc.name}</span>}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 ${className}`}
        >
          <Globe className="w-4 h-4" />
          {showFlag && currentLocale && <span>{currentLocale.flag}</span>}
          {showName && currentLocale && <span>{currentLocale.name}</span>}
        </Button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="surface rounded-lg max-w-sm w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('account.language')}</h3>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-2">
                {availableLocales.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => handleLocaleChange(loc.code)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg transition-colors
                      ${locale === loc.code 
                        ? 'bg-primary/10 border border-primary' 
                        : 'hover-surface border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{loc.flag}</span>
                      <span className="font-medium">{loc.name}</span>
                    </div>
                    {locale === loc.code && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        {showFlag && currentLocale && <span>{currentLocale.flag}</span>}
        {showName && currentLocale && <span>{currentLocale.name}</span>}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 surface border border-muted rounded-lg shadow-lg z-50">
          <div className="p-2">
            {availableLocales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => handleLocaleChange(loc.code)}
                className={`
                  w-full flex items-center justify-between p-2 rounded transition-colors
                  ${locale === loc.code 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover-surface'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{loc.flag}</span>
                  <span>{loc.name}</span>
                </div>
                {locale === loc.code && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Compact language selector for mobile
export function CompactLanguageSelector({ className = '' }: { className?: string }) {
  const { locale, setLocale, availableLocales } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = availableLocales.find(l => l.code === locale);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full surface border border-muted flex items-center justify-center hover-surface transition-colors"
      >
        <span className="text-lg">{currentLocale?.flag || '🌐'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 surface border border-muted rounded-lg shadow-lg z-50">
          <div className="p-1">
            {availableLocales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  setLocale(loc.code);
                  setIsOpen(false);
                }}
                className={`
                  w-10 h-10 rounded flex items-center justify-center transition-colors
                  ${locale === loc.code 
                    ? 'bg-primary/10' 
                    : 'hover-surface'
                  }
                `}
                title={loc.name}
              >
                <span className="text-lg">{loc.flag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
