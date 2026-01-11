import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  WEEKDAY_NAMES_SHORT,
  type WeekdayKey,
  PROVINCE_CODE_MAP as PROVINCE_NAMES,
} from "@/lib/constants";
import { Agency } from "@/lib/correo-argentino-service";
import { Loader2, MapPin, Search, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const [query, setQuery] = useState(""); // Valor inmediato del input
  const [searchTerm, setSearchTerm] = useState(""); // Valor que dispara el filtrado
  const [error, setError] = useState<string | null>(null);
  const userClearedRef = useRef(false); // Prevent auto-fill after manual clear

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
      const normalizedInitial = initialProvince.toLowerCase().trim();
      const found = provinceOptions.find(
        (p) =>
          p.value.toLowerCase() === normalizedInitial ||
          p.label.toLowerCase() === normalizedInitial ||
          normalizedInitial.includes(p.label.toLowerCase()) ||
          p.label.toLowerCase().includes(normalizedInitial)
      );
      if (found) {
        setProvince(found.value);
      }
    }
  }, [initialProvince, province, provinceOptions]);

  // Pre-filtrar por código postal si viene (solo una vez, no después de clear)
  useEffect(() => {
    // Si tenemos un CP inicial y aún no hay búsqueda activa Y user no limpió manualmente
    if (initialPostalCode && !query && !searchTerm && !userClearedRef.current) {
      setQuery(initialPostalCode);
      setSearchTerm(initialPostalCode); // Trigger search immediately
    }
  }, [initialPostalCode, query, searchTerm]);

  const { getAgencies } = useCart();

  // Efecto para cargar sucursales cuando cambia la provincia
  useEffect(() => {
    if (!province) {
      setAgencies([]);
      return;
    }

    const loadAgencies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAgencies(province);

        if (data && data.length > 0) {
          // Filtrar solo sucursales activas con servicio de retiro
          const activeAgencies = data.filter(
            (a: Agency) =>
              a.status === "ACTIVE" && a.services?.pickupAvailability
          );

          setAgencies(activeAgencies);

          if (activeAgencies.length === 0) {
            setError(null);
          }
        } else {
          setAgencies([]);
          // Si la API no devuelve nada pero es una provincia válida,
          // permitimos la búsqueda local (si hubiera datos cacheados) o mostramos mensaje
          // En este caso, si la API falla, el usuario verá vacío.
        }
      } catch {
        setAgencies([]);
        setError("Error de conexión al buscar sucursales");
      } finally {
        setLoading(false);
      }
    };

    loadAgencies();
  }, [province, getAgencies]);

  // Filtrar sucursales por término de búsqueda con scoring para mejorar relevancia
  const filteredAgencies = useMemo(() => {
    if (!searchTerm.trim()) return agencies;

    const term = searchTerm.toLowerCase().trim();
    // Extraer solo números para comparación flexible de CP (ej: 1611 vs B1611AAA)
    const termNumeric = term.replace(/\D/g, "");

    // Dar puntaje de relevancia para ordenar resultados
    const scored = agencies.map((agency) => {
      let score = 0;
      const cp = agency.location.address.postalCode?.toLowerCase() || "";
      const cpNumeric = cp.replace(/\D/g, "");

      const city = (
        agency.location.address.city ||
        agency.location.address.locality ||
        ""
      ).toLowerCase();
      const name = agency.name.toLowerCase();
      const street = agency.location.address.streetName?.toLowerCase() || "";

      // Código postal: Prioridad máxima
      // Coincidencia exacta de string
      if (cp === term) score += 100;
      // Coincidencia exacta numérica (ej: busco 1611 y encuentro B1611ABC)
      else if (termNumeric.length >= 4 && cpNumeric === termNumeric)
        score += 90;
      // Comienza con (ej: busco 1611 y encuentro 16110)
      else if (cp.startsWith(term)) score += 50;
      // Contiene el término numerico (si es suficientemente largo)
      else if (termNumeric.length >= 3 && cpNumeric.includes(termNumeric))
        score += 40;
      // Contiene el string
      else if (cp.includes(term)) score += 25;

      // Ciudad/Localidad
      if (city === term) score += 80;
      else if (city.startsWith(term)) score += 40;
      else if (city.includes(term)) score += 20;

      // Nombre de sucursal
      if (name.includes(term)) score += 15;

      // Calle
      if (street.includes(term)) score += 10;

      return { agency, score };
    });

    // Filtrar solo los que tienen puntaje > 0 y ordenar por score descendente
    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.agency);
  }, [agencies, searchTerm]);

  // Opciones de sucursales para el Select con mejor formato
  const agencyOptions = useMemo(() => {
    // Agrupar por ciudad para mejor organización
    const byCity = filteredAgencies.reduce(
      (acc, agency) => {
        const city =
          agency.location.address.city ||
          agency.location.address.locality ||
          "Otras";
        if (!acc[city]) acc[city] = [];
        acc[city].push(agency);
        return acc;
      },
      {} as Record<string, Agency[]>
    );

    const options: { value: string; label: string; group?: string }[] = [];

    // Mostrar TODAS las sucursales filtradas (no limitar artificialmente)
    Object.entries(byCity).forEach(([city, cityAgencies]) => {
      cityAgencies.forEach((agency) => {
        const label = `${agency.name} - ${agency.location.address.streetName} ${agency.location.address.streetNumber} (CP: ${agency.location.address.postalCode})`;
        options.push({
          value: agency.code,
          label,
          group: Object.keys(byCity).length > 1 ? city : undefined,
        });
      });
    });

    return options; // Retornar TODAS las opciones filtradas
  }, [filteredAgencies]);

  const handleAgencyChange = useCallback(
    (agencyCode: string) => {
      const agency = agencies.find((a) => a.code === agencyCode);
      if (agency) {
        onSelectAgency(agency);
      }
    },
    [agencies, onSelectAgency]
  );

  const handleSearchTrigger = useCallback(() => {
    setSearchTerm(query.trim());
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchTrigger();
    }
  };

  const handleClearSearch = useCallback(() => {
    userClearedRef.current = true; // Mark as user-cleared to prevent auto-refill
    setQuery("");
    setSearchTerm("");
  }, []);

  return (
    <div className="space-y-4">
      {/* Selector de Provincia */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Provincia</label>
        <Select
          value={province}
          onChange={(val) => {
            setProvince(val);
            setQuery("");
            setSearchTerm("");
          }}
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
          {/* Input + Button in same flex row */}
          <div className="flex gap-0">
            <div className="relative flex-1">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ej: Monte Grande, 1842..."
                disabled={loading || !province}
                leftIcon={<Search className="h-4 w-4" />}
                onClear={query ? handleClearSearch : undefined}
                inputSize="lg"
                className="rounded-r-none border-r-0 focus:z-10 focus:ring-0 focus:border-primary"
                containerClassName="w-full"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearchTrigger}
              disabled={loading || !province || !query.trim()}
              className="rounded-l-none px-6 h-12 shrink-0"
              variant="primary"
            >
              Buscar
            </Button>
          </div>
          {searchTerm && !loading && (
            <div className="flex items-center gap-2">
              {filteredAgencies.length > 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {filteredAgencies.length} sucursal
                  {filteredAgencies.length !== 1 ? "es" : ""} encontrada
                  {filteredAgencies.length !== 1 ? "s" : ""}
                  {filteredAgencies.length > 50 && " (mostrando primeras 50)"}
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  ⚠ No se encontraron sucursales con "{searchTerm}". Intenta
                  buscar por código postal o ciudad.
                </p>
              )}
            </div>
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
