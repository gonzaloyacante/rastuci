"use client";

import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCorreoArgentino } from "@/hooks/useCorreoArgentino";
import { PROVINCIAS, type ProvinceCode } from "@/lib/constants";
// import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { normalizeAgency, type NormalizedAgency } from "@/utils/agency-helpers";
import {
  AlertCircle,
  Clock,
  Download,
  Filter,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CardGridSkeleton } from "@/components/admin/SettingsSkeletons";

// PROVINCIAS imported from @/lib/constants

export default function SucursalesCAPage() {
  const [agencies, setAgencies] = useState<NormalizedAgency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<NormalizedAgency[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode | "">(
    ""
  );
  const [error, setError] = useState<string | null>(null);
  const { show } = useToast();
  const { getAgencies } = useCorreoArgentino();

  const loadAgencies = useCallback(
    async (province: ProvinceCode) => {
      if (!province) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getAgencies({
          customerId:
            process.env.NEXT_PUBLIC_CORREO_ARGENTINO_CUSTOMER_ID || "",
          provinceCode: province,
        });

        if (result) {
          const normalized = result.map(normalizeAgency);
          setAgencies(normalized);
          setFilteredAgencies(normalized);
        } else {
          setError("No se pudieron cargar las sucursales");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [getAgencies]
  );

  const filterAgencies = useCallback(() => {
    if (searchTerm.trim() === "") {
      setFilteredAgencies(agencies);
    } else {
      const filtered = agencies.filter(
        (agency) =>
          agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgencies(filtered);
    }
  }, [searchTerm, agencies]);

  useEffect(() => {
    if (selectedProvince) {
      loadAgencies(selectedProvince);
    }
  }, [selectedProvince, loadAgencies]);

  useEffect(() => {
    filterAgencies();
  }, [filterAgencies]);

  const syncAgenciesToDB = async () => {
    if (agencies.length === 0) {
      setError("Primero carga sucursales de alguna provincia");
      return;
    }

    try {
      setSyncing(true);
      setError(null);

      const response = await fetch("/api/admin/sucursales-ca/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencies }),
      });

      const data = await response.json();

      if (data.success) {
        show({
          type: "success",
          message: "Sucursales sincronizadas correctamente",
        });
      } else {
        const msg = data.error || "Error al sincronizar";
        setError(msg);
        show({ type: "error", message: msg });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      show({ type: "error", message: msg });
    } finally {
      setSyncing(false);
    }
  };

  const exportToCSV = () => {
    if (filteredAgencies.length === 0) {
      return;
    }

    const headers = [
      "Código",
      "Nombre",
      "Dirección",
      "Ciudad",
      "Provincia",
      "CP",
      "Teléfono",
      "Email",
      "Horario",
      "Latitud",
      "Longitud",
    ];

    const rows = filteredAgencies.map((a) => [
      a.code,
      a.name,
      a.address,
      a.city,
      a.province,
      a.postalCode || "",
      a.phone || "",
      a.email || "",
      a.schedule || "",
      a.latitude || "",
      a.longitude || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sucursales-ca-${selectedProvince || "todas"}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    link.click();
    URL.revokeObjectURL(url);
    show({ type: "success", message: "Exportación completada" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Sucursales Correo Argentino
          </h1>
          <p className="text-muted mt-1">
            Gestiona y sincroniza las sucursales de Correo Argentino con la base
            de datos
          </p>
        </div>
      </div>

      {/* Filtros y acciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros y Acciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Provincia
              </label>
              <select
                value={selectedProvince}
                onChange={(e) =>
                  setSelectedProvince(e.target.value as ProvinceCode | "")
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar provincia...</option>
                {PROVINCIAS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Nombre, código, dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Acciones</label>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    selectedProvince && loadAgencies(selectedProvince)
                  }
                  disabled={!selectedProvince || loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={exportToCSV}
                  disabled={filteredAgencies.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {agencies.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="default">
                  {filteredAgencies.length} sucursales
                </Badge>
                {searchTerm && (
                  <span className="text-muted">
                    Filtrado de {agencies.length} totales
                  </span>
                )}
              </div>
              <Button onClick={syncAgenciesToDB} disabled={syncing}>
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar a DB
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listado de sucursales */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredAgencies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted">
            {selectedProvince ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  No se encontraron sucursales
                </p>
                <p className="text-sm">
                  {searchTerm
                    ? `No hay resultados para "${searchTerm}"`
                    : "Selecciona una provincia para ver las sucursales"}
                </p>
              </>
            ) : (
              <>
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Selecciona una provincia
                </p>
                <p className="text-sm">
                  Elige una provincia para cargar sus sucursales
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgencies.map((agency) => (
            <Card
              key={agency.code}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-base flex items-start justify-between gap-2">
                  <span className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{agency.name}</span>
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {agency.code}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-primary">{agency.address}</p>
                  <p className="text-muted">
                    {agency.city}, {agency.province}
                  </p>
                  {agency.postalCode && (
                    <p className="text-muted text-xs">
                      CP: {agency.postalCode}
                    </p>
                  )}
                </div>

                {agency.schedule && (
                  <div className="flex items-start gap-2 text-sm text-muted">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-xs">{agency.schedule}</span>
                  </div>
                )}

                {agency.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted" />
                    <a
                      href={`tel:${agency.phone}`}
                      className="text-primary hover:underline text-xs"
                    >
                      {agency.phone}
                    </a>
                  </div>
                )}

                {agency.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted" />
                    <a
                      href={`mailto:${agency.email}`}
                      className="text-primary hover:underline text-xs truncate"
                    >
                      {agency.email}
                    </a>
                  </div>
                )}

                {agency.latitude && agency.longitude && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${agency.latitude},${agency.longitude}`,
                        "_blank"
                      )
                    }
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver en Mapa
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
