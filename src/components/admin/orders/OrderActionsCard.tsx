"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle, Package, Truck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface OrderActionsCardProps {
    order: {
        id: string;
        status: string;
    };
    onOrderUpdate: (updates: Partial<any>) => void;
}

export function OrderActionsCard({ order, onOrderUpdate }: OrderActionsCardProps) {
    const [updating, setUpdating] = useState(false);

    const updateOrderStatus = async (
        newStatus: "PENDING" | "PROCESSED" | "DELIVERED"
    ) => {
        try {
            setUpdating(true);
            const response = await fetch(`/api/orders/${order.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar pedido");
            }

            const data = await response.json();

            if (data.success) {
                onOrderUpdate({ status: newStatus });
                toast.success(`Pedido actualizado a ${newStatus}`);
            } else {
                throw new Error(data.error || "Error al actualizar el pedido");
            }
        } catch (error) {
            toast.error("No se pudo actualizar el estado del pedido");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Card>
            <CardHeader className="surface border-b border-muted">
                <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {order.status === "PENDING" && (
                        <Button
                            className="w-full btn-hero flex items-center justify-center gap-2"
                            onClick={() => updateOrderStatus("PROCESSED")}
                            disabled={updating}
                        >
                            {updating ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                            ) : (
                                <Package size={16} />
                            )}
                            Marcar como Procesado
                        </Button>
                    )}
                    {order.status === "PROCESSED" && (
                        <Button
                            className="w-full btn-hero flex items-center justify-center gap-2"
                            onClick={() => updateOrderStatus("DELIVERED")}
                            disabled={updating}
                        >
                            {updating ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                            ) : (
                                <Truck size={16} />
                            )}
                            Marcar como Entregado
                        </Button>
                    )}
                    {order.status === "DELIVERED" && (
                        <div className="p-4 surface text-primary border border-muted rounded-lg flex items-center justify-center gap-2">
                            <CheckCircle size={16} />
                            Pedido completado
                        </div>
                    )}
                    {order.status !== "PENDING" && order.status !== "DELIVERED" && (
                        <Button
                            variant="outline"
                            className="w-full mt-3"
                            onClick={() => updateOrderStatus("PENDING")}
                            disabled={updating}
                        >
                            Volver a marcar como Pendiente
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
