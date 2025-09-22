"use client";

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RetryButton() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <Button 
      onClick={handleRetry} 
      className="flex items-center justify-center gap-2"
    >
      <RefreshCw className="w-4 h-4" />
      Reintentar
    </Button>
  );
}
