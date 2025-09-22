import { Metadata } from 'next';
import { WifiOff, RefreshCw, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sin Conexión - Rastuci',
  description: 'Página mostrada cuando no hay conexión a internet',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen surface flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Sin Conexión</h1>
        <p className="text-muted mb-6">
          No tienes conexión a internet en este momento. Algunas funciones pueden no estar disponibles.
        </p>

        <div className="space-y-4 mb-8">
          <div className="surface border border-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Funciones Disponibles Offline:</h3>
            <ul className="text-sm text-muted space-y-1 text-left">
              <li>• Ver productos guardados en caché</li>
              <li>• Navegar por categorías</li>
              <li>• Gestionar carrito local</li>
              <li>• Ver favoritos guardados</li>
            </ul>
          </div>

          <div className="surface border border-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Requieren Conexión:</h3>
            <ul className="text-sm text-muted space-y-1 text-left">
              <li>• Realizar pedidos</li>
              <li>• Actualizar información de cuenta</li>
              <li>• Ver ofertas en tiempo real</li>
              <li>• Sincronizar datos</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
          
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir al Inicio
            </Button>
          </Link>
          
          <Link href="/productos" className="flex-1">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Ver Productos
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-xs text-muted">
          <p>Los datos se sincronizarán automáticamente cuando se restaure la conexión.</p>
        </div>
      </div>
    </div>
  );
}
