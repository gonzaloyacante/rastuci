import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Building2, Home, Store } from "lucide-react";

export type DeliveryMode = "home" | "agency" | "pickup";

interface ShippingMethodSelectorProps {
  value: DeliveryMode;
  onChange: (value: DeliveryMode) => void;
}

export function ShippingMethodSelector({
  value,
  onChange,
}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Método de entrega</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as DeliveryMode)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Envío a Domicilio */}
        <div>
          <RadioGroupItem
            value="home"
            id="delivery-home"
            className="peer sr-only"
          />
          <Label
            htmlFor="delivery-home"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
          >
            <Home className="mb-3 h-6 w-6" />
            <div className="text-center">
              <span className="block font-semibold">Envío a Domicilio</span>
              <span className="text-sm text-muted-foreground">
                Recibí tu pedido en tu casa
              </span>
            </div>
          </Label>
        </div>

        {/* Retiro en Sucursal CA */}
        <div>
          <RadioGroupItem
            value="agency"
            id="delivery-agency"
            className="peer sr-only"
          />
          <Label
            htmlFor="delivery-agency"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
          >
            <Building2 className="mb-3 h-6 w-6" />
            <div className="text-center">
              <span className="block font-semibold">Retiro en Correo</span>
              <span className="text-sm text-muted-foreground">
                Sucursal Correo Argentino
              </span>
            </div>
          </Label>
        </div>

        {/* Retiro en Tienda */}
        <div>
          <RadioGroupItem
            value="pickup"
            id="delivery-pickup"
            className="peer sr-only"
          />
          <Label
            htmlFor="delivery-pickup"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
          >
            <Store className="mb-3 h-6 w-6" />
            <div className="text-center">
              <span className="block font-semibold">Retiro en Local</span>
              <span className="text-sm text-muted-foreground">
                Gratis en nuestro local
              </span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
