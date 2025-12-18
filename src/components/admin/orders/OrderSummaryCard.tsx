import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface OrderSummaryCardProps {
    order: {
        id: string;
        status: string;
        paymentStatus?: string; // Add optional payment status
        paymentMethod: string;
        createdAt: string;
        updatedAt: string;
        total: number;
        items: any[];
        shippingMethod?: any; // To determine if it needs shipping
        caTrackingNumber?: string; // To determine if shipped
        caImportStatus?: string; // To determine if imported
    };
}

const getDetailedStatus = (order: OrderSummaryCardProps['order']) => {
    // 1. Payment Status
    const isPaid = order.paymentStatus === 'approved' || order.status === 'PROCESSED';

    // 2. Shipping Status (only if shipping is required)
    const requiresShipping = order.shippingMethod && order.shippingMethod.id !== 'pickup';
    const isShipped = !!order.caTrackingNumber;
    const isImported = order.caImportStatus === 'processed' || !!order.caTrackingNumber;

    if (order.status === 'DELIVERED') {
        return { label: "Entregado", color: "bg-green-100 text-green-800 border-green-200" };
    }

    if (isPaid) {
        if (!requiresShipping) {
            return { label: "Pagado (Retiro en Local)", color: "bg-blue-100 text-blue-800 border-blue-200" };
        }
        if (isShipped) {
            return { label: "Enviado / En Tránsito", color: "bg-purple-100 text-purple-800 border-purple-200" };
        }
        if (isImported) {
            return { label: "Etiqueta Generada (Esperando Pago Envío)", color: "bg-orange-100 text-orange-800 border-orange-200" };
        }
        return { label: "Pagado (Pendiente Envío)", color: "bg-blue-100 text-blue-800 border-blue-200" };
    }

    return { label: "Pendiente de Pago", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
};

const getProductImage = (item: any) => {
    if (!item.product.images) {
        return "https://placehold.co/800x800.png";
    }
    if (Array.isArray(item.product.images) && item.product.images.length > 0) {
        return item.product.images[0];
    }
    return "https://placehold.co/800x800.png";
};

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    const status = getDetailedStatus(order);

    return (
        <div className="space-y-6">
            {/* Información general del pedido */}
            <Card>
                <CardHeader className="surface border-b border-muted">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Información General</CardTitle>
                        <Badge className={`${status.color} border px-3 py-1 text-sm font-medium`}>
                            {status.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium muted">ID del Pedido</h3>
                            <p className="text-sm font-mono">{order.id}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium muted">
                                Fecha del Pedido
                            </h3>
                            <p className="text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium muted">Total</h3>
                            <p className="text-lg font-bold text-primary">
                                {formatCurrency(order.total)}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium muted">
                                Método de Pago
                            </h3>
                            <p className="text-sm capitalize">
                                {order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : order.paymentMethod}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Productos */}
            <Card>
                <CardHeader className="surface border-b border-muted">
                    <CardTitle className="text-lg">
                        Productos ({order.items.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {order.items.map((item) => (
                            <div key={item.id} className="p-4 flex items-center gap-4">
                                <div className="relative w-16 h-16 surface rounded overflow-hidden">
                                    <Image
                                        src={getProductImage(item)}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="grow">
                                    <Link
                                        href={`/admin/productos/editar/${item.product.id}`}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {item.product.name}
                                    </Link>
                                    <div className="text-sm muted">
                                        Categoría: {item.product.categories?.name}
                                    </div>
                                    <div className="text-sm muted">
                                        {item.quantity} x {formatCurrency(item.price)}
                                    </div>
                                </div>
                                <div className="text-right font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 surface flex justify-between items-center border-t border-muted">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-primary">
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
