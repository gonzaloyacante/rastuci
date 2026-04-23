import { Mail, MapPin, Phone, User2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Order } from "@/types";

interface CustomerInfoCardProps {
  order: Order;
}

interface ContactRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  isLink?: "tel" | "mailto";
  className?: string;
}

function ContactRow({
  icon: Icon,
  label,
  value,
  isLink,
  className,
}: ContactRowProps) {
  const content = isLink ? (
    <a
      href={`${isLink}:${value}`}
      className="text-sm text-primary hover:underline"
    >
      {value}
    </a>
  ) : (
    <p className={`text-sm ${className ?? ""}`}>{value}</p>
  );

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary border border-muted text-muted-foreground">
        <Icon size={13} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {content}
      </div>
    </div>
  );
}

export function CustomerInfoCard({ order }: CustomerInfoCardProps) {
  const location = [
    order.customerCity,
    order.customerProvince,
    order.customerPostalCode ? `(${order.customerPostalCode})` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader className="surface border-b border-muted pb-3">
        <div className="flex items-center gap-2">
          <User2 size={15} className="text-muted-foreground" />
          <CardTitle className="text-base">Cliente</CardTitle>
        </div>
        <p className="text-sm font-semibold mt-1">{order.customerName}</p>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <ContactRow
          icon={Phone}
          label="Teléfono"
          value={order.customerPhone}
          isLink="tel"
        />
        {order.customerEmail && (
          <ContactRow
            icon={Mail}
            label="Email"
            value={order.customerEmail}
            isLink="mailto"
            className="break-all"
          />
        )}
        {location && (
          <ContactRow
            icon={MapPin}
            label="Ciudad / Provincia"
            value={location}
          />
        )}
        {order.customerAddress && (
          <ContactRow
            icon={MapPin}
            label="Dirección"
            value={order.customerAddress}
          />
        )}
      </CardContent>
    </Card>
  );
}
