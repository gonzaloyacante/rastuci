"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    type StoreSettings,
    provinceCodeMap,
} from "@/lib/validation/store";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";

interface StoreFormProps {
    initial: StoreSettings;
    onSave?: (data: StoreSettings) => void;
}

export default function StoreForm({ initial, onSave }: StoreFormProps) {
    const [data, setData] = useState<StoreSettings>(initial);
    const [saving, setSaving] = useState(false);

    const handleChange = (field: keyof StoreSettings, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (
        field: keyof StoreSettings["address"],
        value: string
    ) => {
        setData((prev) => ({
            ...prev,
            address: { ...prev.address, [field]: value },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/settings/store", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.error || "Error al guardar");
            }

            toast.success("Configuración guardada");
            onSave?.(data);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Error al guardar"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identidad del negocio */}
            <div className="surface-secondary rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Identidad del Negocio</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="name">Nombre de la Tienda</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Rastuci"
                        />
                    </div>
                    <div>
                        <Label htmlFor="adminEmail">Email Admin (notificaciones)</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            value={data.adminEmail}
                            onChange={(e) => handleChange("adminEmail", e.target.value)}
                            placeholder="admin@example.com"
                        />
                        <p className="text-xs muted mt-1">
                            Recibe notificaciones de nuevos pedidos
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="+54 11 1234-5678"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email de Ventas</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="ventas@example.com"
                        />
                    </div>
                </div>
            </div>

            {/* Dirección de origen (para envíos) */}
            <div className="surface-secondary rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Dirección de Origen (Envíos)</h3>
                <p className="text-sm muted">
                    Esta dirección se usa como remitente en Correo Argentino
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                        <Label htmlFor="streetName">Calle</Label>
                        <Input
                            id="streetName"
                            value={data.address.streetName}
                            onChange={(e) => handleAddressChange("streetName", e.target.value)}
                            placeholder="Av. San Martín"
                        />
                    </div>
                    <div>
                        <Label htmlFor="streetNumber">Número</Label>
                        <Input
                            id="streetNumber"
                            value={data.address.streetNumber}
                            onChange={(e) =>
                                handleAddressChange("streetNumber", e.target.value)
                            }
                            placeholder="1234"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="floor">Piso (opcional)</Label>
                        <Input
                            id="floor"
                            value={data.address.floor || ""}
                            onChange={(e) => handleAddressChange("floor", e.target.value)}
                            placeholder="1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="apartment">Depto (opcional)</Label>
                        <Input
                            id="apartment"
                            value={data.address.apartment || ""}
                            onChange={(e) => handleAddressChange("apartment", e.target.value)}
                            placeholder="A"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                            id="city"
                            value={data.address.city}
                            onChange={(e) => handleAddressChange("city", e.target.value)}
                            placeholder="Buenos Aires"
                        />
                    </div>
                    <div>
                        <Label htmlFor="provinceCode">Provincia</Label>
                        <select
                            id="provinceCode"
                            value={data.address.provinceCode}
                            onChange={(e) =>
                                handleAddressChange("provinceCode", e.target.value)
                            }
                            className="w-full h-10 px-3 rounded-md border border-theme surface text-base-primary"
                        >
                            {Object.entries(provinceCodeMap).map(([code, name]) => (
                                <option key={code} value={code}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="postalCode">Código Postal</Label>
                        <Input
                            id="postalCode"
                            value={data.address.postalCode}
                            onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                            placeholder="1611"
                            maxLength={4}
                        />
                        <p className="text-xs muted mt-1">
                            Usado para cotizar envíos
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar Configuración"}
                </Button>
            </div>
        </form>
    );
}
