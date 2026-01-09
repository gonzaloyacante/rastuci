"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    type StoreSettings,
    defaultStoreSettings,
} from "@/lib/validation/store";
import { PROVINCE_CODE_MAP as provinceCodeMap } from "@/lib/constants";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";

interface StoreFormProps {
    initial?: StoreSettings;
    onSave?: (data: StoreSettings) => void;
}

export default function StoreForm({ initial, onSave }: StoreFormProps) {
    const [data, setData] = useState<StoreSettings>(initial || defaultStoreSettings);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!initial);

    useEffect(() => {
        if (!initial) {
            fetch("/api/settings/store")
                .then(async (res) => {
                    if (res.status === 401 || res.status === 403) {
                        window.location.href = "/admin"; // Redirect on auth fail
                        return { success: false, error: "Sesión expirada" };
                    }
                    return res.json();
                })
                .then((json) => {
                    if (json.success) {
                        setData(json.data);
                    } else if (json.error) {
                        toast.error(json.error);
                    }
                })
                .catch((e) => console.error(e))
                .finally(() => setLoading(false));
        }
    }, [initial]);

    if (loading) return <div className="p-4">Cargando configuración...</div>;

    const handleChange = (field: keyof StoreSettings, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
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

            if (res.status === 401 || res.status === 403) {
                toast.error("Sesión expirada. Por favor recarga o inicia sesión nuevamente.");
                return;
            }

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

                <div className="bg-muted/50 p-4 rounded-lg text-sm border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10">
                    <p className="flex items-center gap-2">
                        <span className="text-blue-600 font-semibold">ℹ️ Nota:</span>
                        El nombre de la tienda y el email administrativo se usan para notificaciones internas y branding.
                    </p>
                </div>

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
                        <Label htmlFor="adminEmail">Email para Notificaciones (Admin)</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            value={data.adminEmail}
                            onChange={(e) => handleChange("adminEmail", e.target.value)}
                            placeholder="admin@rastuci.com"
                        />
                        <p className="text-xs muted mt-1">
                            Recibe alertas de stock y pedidos.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar Identidad"}
                </Button>
            </div>
        </form>
    );
}
