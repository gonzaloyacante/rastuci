"use client";

import { useState, useEffect } from 'react';
import { WifiOff, Home, ShoppingBag, RefreshCw, Database, Signal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function OfflinePageClient() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  // Detectar cambios en el estado de conexión
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setLastSyncTime(new Date());
      }
    };

    // Estado inicial
    updateOnlineStatus();

    // Event listeners para cambios de conexión
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Simular verificación de conexión
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setIsRetrying(false);
    }
  };

  const goToCache = () => {
    // Intentar navegar a productos en modo offline
    window.location.href = '/productos?offline=true';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen surface">
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="max-w-lg w-full text-center">
          {/* Estado de conexión */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-6 ${
            isOnline 
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-error/10 text-error border border-error/20'
          }`}>
            {isOnline ? <Signal className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? 'Conectado' : 'Sin conexión'}
          </div>

          {/* Ícono principal */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isOnline 
              ? 'bg-success/10 text-success' 
              : 'bg-error/10 text-error'
          }`}>
            {isOnline ? <Signal className="w-12 h-12" /> : <WifiOff className="w-12 h-12" />}
          </div>

          {/* Título y descripción */}
          <h1 className="text-3xl font-bold text-primary mb-4">
            {isOnline ? '¡Conexión Restaurada!' : 'Sin Conexión'}
          </h1>
          
          <p className="text-muted mb-8 leading-relaxed">
            {isOnline 
              ? 'Tu conexión a internet se ha restaurado. Puedes usar todas las funcionalidades de la aplicación.'
              : 'No tienes conexión a internet. Puedes seguir usando algunas funciones mientras trabajamos en modo offline.'
            }
          </p>

          {/* Información de datos locales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="surface border border-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Carrito Local</h3>
              </div>
              <p className="text-2xl font-bold text-primary mb-1">{cartItems.length}</p>
              <p className="text-sm muted">
                {cartItems.length === 1 ? 'producto guardado' : 'productos guardados'}
              </p>
            </div>

            <div className="surface border border-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Favoritos</h3>
              </div>
              <p className="text-2xl font-bold text-primary mb-1">{wishlistItems.length}</p>
              <p className="text-sm muted">
                {wishlistItems.length === 1 ? 'favorito guardado' : 'favoritos guardados'}
              </p>
            </div>
          </div>

          {/* Funcionalidades disponibles */}
          <div className="space-y-4 mb-8">
            <div className="surface border border-muted rounded-lg p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <h3 className="font-semibold text-primary">Disponible Offline</h3>
              </div>
              <ul className="text-sm muted space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted rounded-full"></div>
                  Ver productos en caché local
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted rounded-full"></div>
                  Gestionar carrito de compras
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted rounded-full"></div>
                  Administrar lista de favoritos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted rounded-full"></div>
                  Navegar por categorías guardadas
                </li>
              </ul>
            </div>

            {!isOnline && (
              <div className="surface border border-warning/20 bg-warning/5 rounded-lg p-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <h3 className="font-semibold text-warning">Requiere Conexión</h3>
                </div>
                <ul className="text-sm text-warning/80 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-warning/60 rounded-full"></div>
                    Finalizar pedidos y pagos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-warning/60 rounded-full"></div>
                    Sincronizar datos con el servidor
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-warning/60 rounded-full"></div>
                    Ver ofertas y precios actualizados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-warning/60 rounded-full"></div>
                    Acceder a la cuenta de usuario
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {!isOnline && (
              <Button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Verificando...' : 'Reintentar Conexión'}
              </Button>
            )}
            
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Ir al Inicio
              </Button>
            </Link>
            
            <Button 
              onClick={goToCache}
              variant="outline" 
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Ver Productos
            </Button>
          </div>

          {/* Información de sincronización */}
          <div className="text-xs muted space-y-2">
            {lastSyncTime && (
              <p>
                Última sincronización: {formatTime(lastSyncTime)}
              </p>
            )}
            <p>
              {isOnline 
                ? 'Todos los datos se sincronizarán automáticamente.' 
                : 'Los datos se sincronizarán cuando se restaure la conexión.'
              }
            </p>
          </div>

          {/* Auto-redirect si está online */}
          {isOnline && (
            <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm text-success mb-3">
                ✅ Conexión restaurada. Redirigiendo en unos segundos...
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="hero"
                size="sm"
              >
                Continuar Ahora
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}