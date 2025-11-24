import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { WEEKDAY_NAMES_SHORT, type WeekdayKey } from "@/lib/constants";
import { Agency, PROVINCE_NAMES } from "@/lib/correo-argentino-service";
import { MapPin, Store } from "lucide-react";
import { useEffect, useState } from "react";

interface AgencySelectorProps {
  selectedAgency: Agency | null;
  onSelectAgency: (agency: Agency) => void;
  initialProvince?: string;
}

export function AgencySelector({
  selectedAgency,
  onSelectAgency,
  initialProvince,
}: AgencySelectorProps) {
  const [province, setProvince] = useState<string>("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar provincias
  const provinceOptions = Object.entries(PROVINCE_NAMES).map(
    ([code, name]) => ({
      value: code,
      label: name,
    })
  );

  // Efecto para cargar sucursales cuando cambia la provincia
  useEffect(() => {
    if (!province) {
      setAgencies([]);
      return;
    }

    const fetchAgencies = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/shipping/agencies?provinceCode=${province}`
        );
        const data = await response.json();
        if (data.success) {
          setAgencies(data.agencies);
        } else {
          setAgencies([]);
        }
      } catch {
        setAgencies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, [province]);

  // Efecto para setear provincia inicial si viene del usuario
  useEffect(() => {
    if (initialProvince && !province) {
      // Intentar matchear nombre o código
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

  // Opciones de sucursales para el Select
  const agencyOptions = agencies.map((agency) => ({
    value: agency.code,
    label: `${agency.name} - ${agency.location.address.streetName} ${agency.location.address.streetNumber}, ${agency.location.address.city}`,
  }));

  const handleAgencyChange = (agencyCode: string) => {
    const agency = agencies.find((a) => a.code === agencyCode);
    if (agency) {
      onSelectAgency(agency);
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Sucursal</label>
        <Select
          value={selectedAgency?.code || ""}
          onChange={handleAgencyChange}
          options={agencyOptions}
          placeholder={
            loading
              ? "Cargando sucursales..."
              : province
                ? "Selecciona una sucursal"
                : "Selecciona primero una provincia"
          }
          disabled={!province || loading || agencies.length === 0}
          searchable
        />
      </div>

      {selectedAgency && (
        <div className="rounded-md border p-3 text-sm bg-muted/50">
          <p className="font-medium flex items-center gap-2">
            <Store className="h-4 w-4" />
            {selectedAgency.name}
          </p>
          <p className="text-muted-foreground mt-1">
            {selectedAgency.location.address.streetName}{" "}
            {selectedAgency.location.address.streetNumber},{" "}
            {selectedAgency.location.address.city}
          </p>
          {selectedAgency.hours && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p className="font-medium">Horarios:</p>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {Object.entries(selectedAgency.hours).map(([day, hours]) => {
                  if (!hours || day === "holidays") {
                    return null;
                  }
                  const dayName = WEEKDAY_NAMES_SHORT[day as WeekdayKey];

                  if (!dayName) {
                    return null;
                  }

                  return (
                    <div key={day}>
                      {dayName}: {hours.start.slice(0, 2)}:
                      {hours.start.slice(2)} - {hours.end.slice(0, 2)}:
                      {hours.end.slice(2)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3">
            <Button
              type="button"
              className="w-full text-xs h-8 bg-transparent border border-input hover:bg-accent hover:text-accent-foreground text-primary"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${selectedAgency.location.latitude},${selectedAgency.location.longitude}`,
                  "_blank"
                );
              }}
            >
              <MapPin className="w-3 h-3 mr-2" />
              Ver en Mapa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
