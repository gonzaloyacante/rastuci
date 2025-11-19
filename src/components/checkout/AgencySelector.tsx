'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCorreoArgentino } from '@/hooks/useCorreoArgentino';
import type { ProvinceCode } from '@/lib/correo-argentino-service';
import { normalizeAgency, type NormalizedAgency } from '@/utils/agency-helpers';
import { Clock, Loader2, Mail, MapPin, Phone, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AgencySelectorProps {
  province: ProvinceCode;
  onSelect: (agency: NormalizedAgency) => void;
  selectedAgencyId?: string;
}

export function AgencySelector({ province, onSelect, selectedAgencyId }: AgencySelectorProps) {
  const [agencies, setAgencies] = useState<NormalizedAgency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<NormalizedAgency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAgencies } = useCorreoArgentino();

  const loadAgencies = useCallback(async () => {
    if (!province) {return;}

    try {
      setLoading(true);
      const result = await getAgencies({
        customerId: process.env.NEXT_PUBLIC_CORREO_ARGENTINO_CUSTOMER_ID || '',
        provinceCode: province
      });

      if (result) {
        const normalized = result.map(normalizeAgency);
        setAgencies(normalized);
        setFilteredAgencies(normalized);
      }
    } catch {
      // Error loading agencies - silent fail
    } finally {
      setLoading(false);
    }
  }, [province, getAgencies]);

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAgencies(agencies);
    } else {
      const filtered = agencies.filter(
        (agency) =>
          agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgencies(filtered);
    }
  }, [searchTerm, agencies]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar sucursal por nombre, dirección o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={loadAgencies}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Recargar'}
        </Button>
      </div>

      {loading && agencies.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted">Cargando sucursales...</span>
        </div>
      ) : filteredAgencies.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron sucursales con "{searchTerm}"</p>
              </>
            ) : (
              <>
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay sucursales disponibles en esta provincia</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAgencies.map((agency) => (
            <Card
              key={agency.code}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAgencyId === agency.code
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => onSelect(agency)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>{agency.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-primary">{agency.address}</p>
                    <p className="text-muted">{agency.city}, {agency.province}</p>
                    {agency.postalCode && (
                      <p className="text-muted text-xs">CP: {agency.postalCode}</p>
                    )}
                  </div>
                </div>

                {agency.schedule && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                    <p className="text-muted text-xs">{agency.schedule}</p>
                  </div>
                )}

                {agency.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted shrink-0" />
                    <a
                      href={`tel:${agency.phone}`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {agency.phone}
                    </a>
                  </div>
                )}

                {agency.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted shrink-0" />
                    <a
                      href={`mailto:${agency.email}`}
                      className="text-primary hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {agency.email}
                    </a>
                  </div>
                )}

                {(agency.latitude && agency.longitude) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${agency.latitude},${agency.longitude}`,
                        '_blank'
                      );
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver en Mapa
                  </Button>
                )}

                {selectedAgencyId === agency.code && (
                  <div className="mt-3 p-2 bg-primary/10 rounded text-center text-sm font-medium text-primary">
                    ✓ Sucursal seleccionada
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
