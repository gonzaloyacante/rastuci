"use client";

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { User } from 'lucide-react';

interface CustomerData {
  email: string;
  firstName: string;
  lastName: string;
  identificationType: string;
  identificationNumber: string;
}

interface CustomerFormProps {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
}

export function CustomerForm({ data, onChange }: CustomerFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const identificationTypes = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CUIL', label: 'CUIL' },
    { value: 'CUIT', label: 'CUIT' },
    { value: 'Pasaporte', label: 'Pasaporte' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Datos personales</h4>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email *
        </label>
        <Input
          type="email"
          placeholder="tu@email.com"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />
        <p className="text-xs muted mt-1">
          Te enviaremos la confirmación de compra a este email
        </p>
      </div>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nombre *
          </label>
          <Input
            type="text"
            placeholder="Tu nombre"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Apellido *
          </label>
          <Input
            type="text"
            placeholder="Tu apellido"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Tipo y número de documento */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipo de documento
          </label>
          <Select
            options={identificationTypes}
            value={data.identificationType}
            onChange={(value) => handleChange('identificationType', value)}
            placeholder="Tipo"
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">
            Número de documento
          </label>
          <Input
            type="text"
            placeholder="12345678"
            value={data.identificationNumber}
            onChange={(e) => handleChange('identificationNumber', e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      {/* Nota informativa */}
      <div className="p-3 surface rounded-lg border border-muted">
        <p className="text-sm muted">
          <strong>Importante:</strong> Los datos deben coincidir con los de tu tarjeta o documento de identidad.
        </p>
      </div>
    </div>
  );
}
