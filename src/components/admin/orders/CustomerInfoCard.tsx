import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface CustomerInfoCardProps {
    order: {
        customerName: string;
        customerPhone: string;
        customerAddress?: string;
    };
}

export function CustomerInfoCard({ order }: CustomerInfoCardProps) {
    return (
        <Card>
            <CardHeader className="surface border-b border-muted">
                <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    <div>
                        <h3 className="text-sm font-medium muted">Nombre</h3>
                        <p className="text-sm">{order.customerName}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium muted">Teléfono</h3>
                        <p className="text-sm">{order.customerPhone}</p>
                    </div>
                    {order.customerAddress && (
                        <div>
                            <h3 className="text-sm font-medium muted">Dirección</h3>
                            <p className="text-sm">{order.customerAddress}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
