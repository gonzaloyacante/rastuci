import { Building2, Home, Store } from "lucide-react";

export type DeliveryMode = "home" | "agency" | "pickup";

interface ShippingMethodSelectorProps {
  value: DeliveryMode;
  onChange: (value: DeliveryMode) => void;
}

const deliveryOptions: {
  id: DeliveryMode;
  icon: React.ElementType;
  title: string;
  description: string;
}[] = [
    {
      id: "home",
      icon: Home,
      title: "Envío a Domicilio",
      description: "Recibí tu pedido en tu casa",
    },
    {
      id: "agency",
      icon: Building2,
      title: "Retiro en Correo",
      description: "Sucursal Correo Argentino",
    },
    {
      id: "pickup",
      icon: Store,
      title: "Retiro en Local",
      description: "Sin cargo",
    },
  ];

export function ShippingMethodSelector({
  value,
  onChange,
}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <label className="text-base font-semibold text-primary">
        Método de entrega
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deliveryOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex flex-col items-center justify-center rounded-md border-2 p-4 transition-all cursor-pointer h-full ${isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-muted bg-popover hover:bg-accent hover:border-primary/50"
                }`}
            >
              <Icon
                className={`mb-3 h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
              />
              <div className="text-center">
                <span
                  className={`block font-semibold ${isSelected ? "text-primary" : ""}`}
                >
                  {option.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
