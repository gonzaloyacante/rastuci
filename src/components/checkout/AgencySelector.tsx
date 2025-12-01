import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { WEEKDAY_NAMES_SHORT, type WeekdayKey } from "@/lib/constants";
import { Agency, PROVINCE_NAMES } from "@/lib/correo-argentino-service";
import { Loader2, MapPin, Search, Store, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface AgencySelectorProps {
  selectedAgency: Agency | null;
  onSelectAgency: (agency: Agency) => void;
  initialProvince?: string;
  initialPostalCode?: string;
}

export function AgencySelector({
  selectedAgency,
  onSelectAgency,
  initialProvince,
  initialPostalCode,
}: AgencySelectorProps) {
  const [province, setProvince] = useState<string>("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Cargar provincias
  const provinceOptions = useMemo(
    () =>
      Object.entries(PROVINCE_NAMES).map(([code, name]) => ({
        value: code,
        label: name,
      })),
    []
  );

  // Efecto para setear provincia inicial
  useEffect(() => {
    if (initialProvince && !province) {
      const found = provinceOptions.find(
        (p) =>
          p.value === initialProvince ||
          p.label.toLowerCase() === initialProvince.toLowerCase()
      );
      if (found) {
        setProvince(found.value);
      }
    }
  }, [initialProvince, province, provinceOptions]);

  // Pre-filtrar por código postal si viene
  useEffect(() => {
    if (initialPostalCode && agencies.length > 0) {
      setSearchTerm(initialPostalCode);
    }
  }, [initialPostalCode, agencies.length]);

  // Efecto para cargar sucursales cuando cambia la provincia
  useEffect(() => {
    if (!province) {
      setAgencies([]);
      return;
    }

    const fetchAgencies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/shipping/agencies?provinceCode=${province}`
        );
        const data = await response.json();
        if (data.success && data.agencies) {
          // Filtrar solo sucursales activas con servicio de retiro
          const activeAgencies = data.agencies.filter(
            (a: Agency) =>
              a.status === "ACTIVE" && a.services?.pickupAvailability
          );
          setAgencies(activeAgencies);
          if (activeAgencies.length === 0) {
            setError("No hay sucursales disponibles en esta provincia");
          }
        } else {
          setAgencies([]);
          setError(data.error || "Error al cargar sucursales");
        }
      } catch {
        setAgencies([]);
        setError("Error de conexión al buscar sucursales");
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, [province]);

  // Filtrar sucursales por término de búsqueda
  const filteredAgencies = useMemo(() => {
    if (!searchTerm.trim()) return agencies;

    const term = searchTerm.toLowerCase().trim();
    return agencies.filter(
      (agency) =>
        agency.name.toLowerCase().includes(term) ||
        agency.location.address.city?.toLowerCase().includes(term) ||
        agency.location.address.locality?.toLowerCase().includes(term) ||
        agency.location.address.postalCode?.toLowerCase().includes(term) ||
        agency.location.address.streetName?.toLowerCase().includes(term) ||
        agency.code.toLowerCase().includes(term)
    );
  }, [agencies, searchTerm]);

  // Opciones de sucursales para el Select (limitadas a 50 para rendimiento)
  const agencyOptions = useMemo(
    () =>
      filteredAgencies.slice(0, 50).map((agency) => ({
        value: agency.code,
        label: `${agency.name} - ${agency.location.address.streetName} ${agency.location.address.streetNumber}, ${agency.location.address.city || agency.location.address.locality}`,
      })),
    [filteredAgencies]
  );

  const handleAgencyChange = useCallback(
    (agencyCode: string) => {
      const agency = agencies.find((a) => a.code === agencyCode);
      if (agency) {
        onSelectAgency(agency);
      }
    },
    [agencies, onSelectAgency]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <div className="space-y-4">
      {/* Selector de Provincia */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Provincia</label>
        <Select
          value={province}
          onChange={setProvince}
          options={provinceOptions}
          placeholder="Selecciona una provincia"
          searchable
        />
      </div>

      {/* Buscador de Sucursales */}
      {province && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-sm font-medium">
            Buscar sucursal{" "}
            <span className="text-muted-foreground font-normal">
              (por nombre, ciudad o CP)
            </span>
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej: Monte Grande, 1842, B0107..."
              className="pl-10 pr-9"
              disabled={loading || agencies.length === 0}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchTerm && filteredAgencies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {filteredAgencies.length} sucursal
              {filteredAgencies.length !== 1 ? "es" : ""} encontrada
              {filteredAgencies.length !== 1 ? "s" : ""}
              {filteredAgencies.length > 50 && " (mostrando primeras 50)"}
            </p>
          )}
        </div>
      )}

      {/* Selector de Sucursal */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sucursal</label>
        {loading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando sucursales...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        ) : (
          <Select
            value={selectedAgency?.code || ""}
            onChange={handleAgencyChange}
            options={agencyOptions}
            placeholder={
              !province
                ? "Selecciona primero una provincia"
                : agencies.length === 0
                  ? "No hay sucursales disponibles"
                  : filteredAgencies.length === 0
                    ? "No hay sucursales que coincidan"
                    : "Selecciona una sucursal"
            }
            disabled={!province || agencies.length === 0}
            searchable
          />
        )}
      </div>

      {/* Detalle de Sucursal Seleccionada */}
      {selectedAgency && (
        <div className="rounded-lg border p-3 sm:p-4 bg-muted/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary text-sm sm:text-base leading-tight">
                {selectedAgency.name}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {selectedAgency.location.address.streetName}{" "}
                {selectedAgency.location.address.streetNumber}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {selectedAgency.location.address.city ||
                  selectedAgency.location.address.locality}
                , CP {selectedAgency.location.address.postalCode}
              </p>

              {/* Horarios - responsive grid */}
              {selectedAgency.hours && (
                <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border">
                  <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2">
                    Horarios de atención:
                  </p>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-0.5 sm:gap-y-1 text-[11px] sm:text-xs">
                    {Object.entries(selectedAgency.hours).map(
                      ([day, hours]) => {
                        if (!hours || day === "holidays") return null;
                        const dayName = WEEKDAY_NAMES_SHORT[day as WeekdayKey];
                        if (!dayName) return null;

                        return (
                          <div key={day} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {dayName}:
                            </span>
                            <span>
                              {hours.start.slice(0, 2)}:{hours.start.slice(2)} -{" "}
                              {hours.end.slice(0, 2)}:{hours.end.slice(2)}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Botón Ver en Mapa */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-2.5 sm:mt-3 text-xs sm:text-sm"
                leftIcon={<MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${selectedAgency.location.latitude},${selectedAgency.location.longitude}`,
                    "_blank"
                  );
                }}
              >
                Ver en Google Maps
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
