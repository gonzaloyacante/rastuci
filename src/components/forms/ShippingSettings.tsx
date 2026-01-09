"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { StoreSettings, defaultStoreSettings } from "@/lib/validation/store";
import { PROVINCE_CODE_MAP as provinceCodeMap } from "@/lib/constants";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";
import Alert from "@/components/ui/Alert";

export default function ShippingSettings() {
    const [data, setData] = useState<StoreSettings>(defaultStoreSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/settings/store")
            .then(async (res) => {
                if (res.status === 401 || res.status === 403) {
                    return null; // Auth handshake handled by fetch wrapper usually, or just fail safely
                }
                return res.json();
            })
            .then((json) => {
                if (json?.success) {
                    setData(json.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleAddressChange = (
        field: keyof StoreSettings["address"],
        value: string
    ) => {
        setData((prev) => ({
            ...prev,
            address: { ...prev.address, [field]: value },
        }));
    };

    const handleShippingChange = (enabled: boolean) => {
        setData(prev => ({
            ...prev,
            shipping: { ...prev.shipping, freeShipping: enabled }
        }));
    }

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
            if (json.success) {
                toast.success("Configuración de envíos guardada");
            } else {
                throw new Error(json.error || "Error al guardar");
            }
        } catch (error) {
            toast.error("Error al guardar configuración");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Cargando configuración de envíos...</div>;

    const { freeShipping } = data.shipping || {};

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="surface-secondary rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Dirección de Origen (Logística)</h3>
                <p className="text-sm muted">
                    Esta dirección se utiliza EXCLUSIVAMENTE para calcular el costo de envío con Correo Argentino y como remitente en las etiquetas.
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
                            onChange={(e) => handleAddressChange("streetNumber", e.target.value)}
                            placeholder="1234"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="floor">Piso</Label>
                        <Input
                            id="floor"
                            value={data.address.floor || ""}
                            onChange={(e) => handleAddressChange("floor", e.target.value)}
                            placeholder="1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="apartment">Depto</Label>
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
                            onChange={(e) => handleAddressChange("provinceCode", e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-theme surface text-base-primary"
                        >
                            {Object.entries(provinceCodeMap).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
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
                    </div>
                </div>
            </div>

            <div className="surface-secondary rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Promociones de Envío</h3>

                <div className="p-4 border border-muted rounded-lg surface">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!freeShipping}
                            onChange={(e) => handleShippingChange(e.target.checked)}
                            className="w-5 h-5 rounded border-muted text-primary focus:ring-primary"
                        />
                        <div>
                            <div className="font-medium text-content-primary">
                                Activar Envío Gratis Global
                            </div>
                            <div className="text-sm text-muted">
                                Se mostrará "ENVÍO GRATIS" en el checkout. El costo lo absorbe la tienda.
                            </div>
                        </div>
                    </label>
                </div>
                <Alert
                    inline
                    variant="info"
                    title="Información"
                    isOpen={true}
                    onClose={() => { }}
                    message="Al activar esto, el cliente verá $0 de costo de envío. La etiqueta de Correo Argentino se generará normalmente pero no se cobrará al cliente."
                />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar Configuración de Envíos"}
                </Button>
            </div>
        </form>
    );
}
