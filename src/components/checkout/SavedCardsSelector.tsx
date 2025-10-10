"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Check, CreditCard, Plus, Loader2 } from 'lucide-react';
import { SavedCard, MercadoPagoUser, initializeMercadoPagoSDK } from '@/lib/mercadopago-sdk';

interface SavedCardsSelectorProps {
  onCardSelect: (cardId: string | null) => void;
  onNewCardSelect: () => void;
  selectedCardId: string | null;
}

export function SavedCardsSelector({ onCardSelect, onNewCardSelect, selectedCardId }: SavedCardsSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MercadoPagoUser | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndCards();
  }, []);

  const loadUserAndCards = async () => {
    try {
      setLoading(true);
      setError(null);

      // Inicializar SDK de MercadoPago
      const sdk = await initializeMercadoPagoSDK(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || 'TEST-key');
      
      // Verificar si el usuario está logueado
      const userInfo = await sdk.getUserInfo();
      setUser(userInfo);

      if (userInfo) {
        // Obtener tarjetas guardadas
        const cards = await sdk.getSavedCards();
        setSavedCards(cards);
      }
    } catch (err) {
      console.error('Error loading user cards:', err);
      setError('Error cargando tarjetas guardadas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-sm muted">Cargando tarjetas guardadas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 surface rounded-lg border border-error text-error text-center">
        <p className="text-sm">{error}</p>
        <Button 
          onClick={loadUserAndCards}
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 surface rounded-xl border border-muted text-center relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-primary">¿Tienes cuenta en MercadoPago?</h3>
          <p className="text-sm muted mb-6 leading-relaxed">
            Inicia sesión para usar tus tarjetas guardadas y pagar más rápido
          </p>
          
          {/* Beneficios */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 surface-secondary rounded-full flex items-center justify-center">
                <span className="text-success font-bold">✓</span>
              </div>
              <span className="muted">Pago rápido</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 surface-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">🔒</span>
              </div>
              <span className="muted">Seguro</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 surface-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">💳</span>
              </div>
              <span className="muted">Sin salir</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => {
                // Simular login exitoso después de un delay
                setLoading(true);
                setTimeout(() => {
                  loadUserAndCards();
                }, 1500);
              }}
              className="w-full btn-hero relative overflow-hidden group"
            >
              <span className="relative z-10">Iniciar sesión en MercadoPago</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
            <Button 
              onClick={onNewCardSelect}
              variant="outline"
              className="w-full hover:bg-primary/5 transition-colors"
            >
              Continuar sin cuenta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Información del usuario */}
      <div className="p-4 surface-secondary rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium">{user.first_name} {user.last_name}</p>
            <p className="text-sm muted">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tarjetas guardadas */}
      {savedCards.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Tus tarjetas guardadas</h4>
          <div className="space-y-2">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCardId === card.id
                    ? 'border-primary surface-primary'
                    : 'border-muted surface hover:border-primary/50'
                }`}
                onClick={() => onCardSelect(card.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={card.payment_method.thumbnail}
                      alt={card.payment_method.name}
                      width={32}
                      height={20}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">
                        {card.payment_method.name} •••• {card.last_four_digits}
                      </p>
                      <p className="text-sm muted">
                        {card.issuer.name} • Vence {card.expiration_month.toString().padStart(2, '0')}/{card.expiration_year}
                      </p>
                    </div>
                  </div>
                  {selectedCardId === card.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opción para agregar nueva tarjeta */}
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          selectedCardId === null
            ? 'border-primary surface-primary'
            : 'border-muted surface hover:border-primary/50'
        }`}
        onClick={onNewCardSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border-2 border-dashed border-muted flex items-center justify-center">
              <Plus size={16} className="muted" />
            </div>
            <div>
              <p className="font-medium">Usar nueva tarjeta</p>
              <p className="text-sm muted">Ingresa los datos de una tarjeta nueva</p>
            </div>
          </div>
          {selectedCardId === null && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
