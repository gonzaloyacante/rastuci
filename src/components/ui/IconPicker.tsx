"use client";

import { Button } from "./Button";
import { X } from "lucide-react";
import * as Icons from "lucide-react";
import { useState } from "react";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

// Lista de iconos comunes para beneficios
const COMMON_ICONS = [
  "Truck", "Package", "Shield", "CheckCircle", "CreditCard",
  "Wallet", "Clock", "Phone", "Mail", "MapPin",
  "Gift", "Heart", "Star", "ThumbsUp", "Award",
  "BadgeCheck", "Verified", "Lock", "Unlock", "Eye",
  "Users", "User", "Home", "Store", "ShoppingBag",
  "ShoppingCart", "Tag", "DollarSign", "Percent", "TrendingUp",
  "Zap", "Flame", "Sparkles", "Sun", "Moon",
  "Cloud", "Umbrella", "Droplet", "Wind", "Leaf",
  "Feather", "Box", "Archive", "Inbox", "Send",
  "MessageCircle", "MessageSquare", "Bell", "BellRing", "Volume2",
  "Radio", "Wifi", "Bluetooth", "Battery", "Power",
  "Settings", "Tool", "Wrench", "Hammer", "Scissors",
  "Paintbrush", "PenTool", "Palette", "Image", "Camera",
  "Video", "Film", "Music", "Headphones", "Mic",
  "Book", "BookOpen", "FileText", "File", "Folder",
  "Download", "Upload", "Share2", "Link", "ExternalLink",
  "Bookmark", "Flag", "Pin", "Target", "Compass",
  "Map", "Navigation", "Route", "Plane", "Car",
  "Bus", "Train", "Bike", "Ship", "Rocket",
  "Trophy", "Medal", "Crown", "Diamond", "Gem",
  "Coffee", "Pizza", "Beer", "Wine", "IceCream",
  "Apple", "Cherry", "Banana", "Candy", "Cake",
];

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = COMMON_ICONS.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface border border-theme rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme">
          <h3 className="text-lg font-semibold">Selecciona un Icono</h3>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X size={20} />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-theme">
          <input
            type="text"
            placeholder="Buscar icono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[iconName];
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
                    flex flex-col items-center justify-center p-3 rounded-lg
                    transition-all duration-200 hover:scale-110
                    ${isSelected
                      ? "bg-primary text-white ring-2 ring-primary"
                      : "surface border border-theme hover:border-primary hover:bg-primary/10"
                    }
                  `}
                  title={iconName}
                >
                  <IconComponent size={24} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme text-sm text-muted text-center">
          {filteredIcons.length} iconos disponibles
        </div>
      </div>
    </div>
  );
}
