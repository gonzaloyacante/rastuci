"use client";

import { Button } from "./Button";
import { X } from "lucide-react";
import * as Icons from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

// Mapeo de iconos a nombres en español
const ICON_LABELS: Record<string, string> = {
  Truck: "Camión",
  Package: "Paquete",
  Shield: "Escudo",
  CheckCircle: "Verificado",
  CreditCard: "Tarjeta",
  Wallet: "Billetera",
  Clock: "Reloj",
  Phone: "Teléfono",
  Mail: "Email",
  MapPin: "Ubicación",
  Gift: "Regalo",
  Heart: "Corazón",
  Star: "Estrella",
  ThumbsUp: "Me gusta",
  Award: "Premio",
  BadgeCheck: "Insignia",
  Verified: "Verificado 2",
  Lock: "Candado",
  Unlock: "Desbloqueado",
  Eye: "Ojo",
  Users: "Usuarios",
  User: "Usuario",
  Home: "Casa",
  Store: "Tienda",
  ShoppingBag: "Bolsa",
  ShoppingCart: "Carrito",
  Tag: "Etiqueta",
  DollarSign: "Dólar",
  Percent: "Porcentaje",
  TrendingUp: "Tendencia",
  Zap: "Rayo",
  Flame: "Fuego",
  Sparkles: "Destellos",
  Sun: "Sol",
  Moon: "Luna",
  Cloud: "Nube",
  Umbrella: "Paraguas",
  Droplet: "Gota",
  Wind: "Viento",
  Leaf: "Hoja",
  Feather: "Pluma",
  Box: "Caja",
  Archive: "Archivo",
  Inbox: "Bandeja",
  Send: "Enviar",
  MessageCircle: "Mensaje",
  MessageSquare: "Chat",
  Bell: "Campana",
  BellRing: "Campana 2",
  Volume2: "Volumen",
  Radio: "Radio",
  Wifi: "Wifi",
  Bluetooth: "Bluetooth",
  Battery: "Batería",
  Power: "Encendido",
  Settings: "Ajustes",
  Tool: "Herramienta",
  Wrench: "Llave",
  Hammer: "Martillo",
  Scissors: "Tijeras",
  Paintbrush: "Pincel",
  PenTool: "Pluma 2",
  Palette: "Paleta",
  Image: "Imagen",
  Camera: "Cámara",
  Video: "Video",
  Film: "Película",
  Music: "Música",
  Headphones: "Auriculares",
  Mic: "Micrófono",
  Book: "Libro",
  BookOpen: "Libro Abierto",
  FileText: "Texto",
  File: "Archivo 2",
  Folder: "Carpeta",
  Download: "Descargar",
  Upload: "Subir",
  Share2: "Compartir",
  Link: "Enlace",
  ExternalLink: "Link Externo",
  Bookmark: "Marcador",
  Flag: "Bandera",
  Pin: "Pin",
  Target: "Objetivo",
  Compass: "Brújula",
  Map: "Mapa",
  Navigation: "Navegación",
  Route: "Ruta",
  Plane: "Avión",
  Car: "Auto",
  Bus: "Bus",
  Train: "Tren",
  Bike: "Bici",
  Ship: "Barco",
  Rocket: "Cohete",
  Trophy: "Trofeo",
  Medal: "Medalla",
  Crown: "Corona",
  Diamond: "Diamante",
  Gem: "Gema",
  Coffee: "Café",
  Pizza: "Pizza",
  Beer: "Cerveza",
  Wine: "Vino",
  IceCream: "Helado",
  Apple: "Manzana",
  Cherry: "Cereza",
  Banana: "Banana",
  Candy: "Dulce",
  Cake: "Pastel",
};

const COMMON_ICONS = Object.keys(ICON_LABELS);

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Bloquear scroll del body cuando el modal está abierto
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const filteredIcons = COMMON_ICONS.filter((name) => {
    const label = ICON_LABELS[name].toLowerCase();
    const searchTerm = search.toLowerCase();
    return (
      label.includes(searchTerm) || name.toLowerCase().includes(searchTerm)
    );
  });

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 w-screen h-screen">
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 transition-colors">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Selecciona un Icono
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Elige el icono que mejor represente el beneficio
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-900/50 transition-colors">
          <input
            type="text"
            placeholder="Buscar icono (ej. camión, tarjeta, regalo...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
            autoFocus
          />
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-zinc-900 custom-scrollbar transition-colors">
          {filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <span className="text-4xl mb-3 opacity-50">🔍</span>
              <p>No se encontraron iconos para "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4">
              {filteredIcons.map((iconName) => {
                const IconComponent = (
                  Icons as unknown as Record<string, React.ElementType>
                )[iconName];
                if (!IconComponent) return null;

                const isSelected = value === iconName;

                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onChange(iconName);
                      onClose();
                    }}
                    className={`
                      group flex flex-col items-center justify-center p-3 rounded-xl aspect-square
                      transition-all duration-200 border
                      ${
                        isSelected
                          ? "bg-primary text-white border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-900 scale-105 shadow-md"
                          : "bg-white dark:bg-zinc-950 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary/50 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-sm"
                      }
                    `}
                    title={ICON_LABELS[iconName]}
                  >
                    <IconComponent
                      size={24}
                      strokeWidth={1.5}
                      className={`transition-transform duration-300 ${!isSelected && "group-hover:scale-110"}`}
                    />
                    <span
                      className={`text-[10px] mt-2 truncate w-full text-center font-medium ${isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                    >
                      {ICON_LABELS[iconName]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center bg-gray-50/50 dark:bg-zinc-900/50 transition-colors">
          {filteredIcons.length} iconos disponibles
        </div>
      </div>
    </div>,
    document.body
  );
}
