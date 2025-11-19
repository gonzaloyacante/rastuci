import { CorreoArgentinoService } from '@/lib/correo-argentino-service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

describe('CorreoArgentinoService', () => {
  let service: CorreoArgentinoService;

  beforeEach(() => {
    service = new CorreoArgentinoService({
      apiUrl: 'https://apitest.correoargentino.com.ar/micorreo/v1',
      username: 'test_user',
      password: 'test_pass',
      customerId: 'test_customer_123',
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate successfully and set token', async () => {
      const mockResponse = {
        token: 'mock_jwt_token_12345',
        expiresIn: 3600,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await service.authenticate();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apitest.correoargentino.com.ar/micorreo/v1/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic'),
          }),
        })
      );
    });

    it('should fail authentication with invalid credentials', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const result = await service.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockAuthResponse = { token: 'mock_token' };
      const mockRegisterResponse = {
        customerId: 'new_customer_456',
        email: 'test@example.com',
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockRegisterResponse,
        });

      const result = await service.registerUser({
        email: 'test@example.com',
        documentType: 'DNI',
        documentNumber: '12345678',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        address: 'Test St 123',
        city: 'Test City',
        province: 'B',
        postalCode: '1234',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRegisterResponse);
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const mockAuthResponse = { token: 'mock_token' };
      const mockValidateResponse = {
        customerId: 'existing_customer_789',
        valid: true,
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockValidateResponse,
        });

      const result = await service.validateUser({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockValidateResponse);
    });
  });

  describe('getAgencies', () => {
    it('should fetch agencies for a province', async () => {
      const mockAuthResponse = { token: 'mock_token' };
      const mockAgencies = [
        {
          agencyCode: 'B0001',
          name: 'Sucursal Test',
          address: 'Test Address 123',
          city: 'Test City',
          province: 'B',
          postalCode: '1234',
          phone: '1234567890',
          email: 'test@correo.com',
          schedule: 'Lun-Vie 9-18hs',
          latitude: -34.6037,
          longitude: -58.3816,
          services: ['ENTREGA', 'RETIRO'],
        },
      ];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockAgencies,
        });

      const result = await service.getAgencies({ province: 'B' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAgencies);
      expect(result.data?.length).toBe(1);
    });
  });

  describe('calculateRates', () => {
    it('should calculate shipping rates', async () => {
      const mockAuthResponse = { token: 'mock_token' };
      const mockRates = {
        rates: [
          {
            productType: 'CP',
            productName: 'Correo Argentino Clasico',
            price: 1500.0,
            deliveryTimeMin: 3,
            deliveryTimeMax: 5,
            validFrom: '2025-01-01',
            validTo: '2025-12-31',
          },
        ],
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockRates,
        });

      const result = await service.calculateRates({
        customerId: 'test_customer_123',
        postalCodeOrigin: '1425',
        postalCodeDestination: '5000',
        deliveredType: 'D',
        dimensions: {
          weight: 1000,
          height: 10,
          width: 20,
          length: 30,
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRates);
      expect(result.data?.rates.length).toBe(1);
    });
  });

  describe('importShipment', () => {
    it('should import shipment successfully', async () => {
      const mockAuthResponse = { token: 'mock_token' };
      const mockImportResponse = {
        shipmentId: 'SHIP12345',
        trackingNumber: '000500076393019A3G0C701',
        status: 'PREIMPOSICION',
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockImportResponse,
        });

      const result = await service.importShipment({
        customerId: 'test_customer_123',
        extOrderId: 'ORDER_789',
        sender: {
          name: 'Sender Name',
          street: 'Sender St 123',
          city: 'CABA',
          province: 'C',
          postalCode: '1425',
          phone: '1122334455',
          email: 'sender@example.com',
        },
        recipient: {
          name: 'Recipient Name',
          street: 'Recipient St 456',
          city: 'Cordoba',
          province: 'X',
          postalCode: '5000',
          phone: '3512345678',
          email: 'recipient@example.com',
        },
        deliveredType: 'D',
        packages: [
          {
            weight: 500,
            height: 10,
            width: 20,
            length: 30,
            declaredValue: 5000,
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockImportResponse);
      expect(result.data?.trackingNumber).toBeDefined();
    });
  });

  describe('getTracking', () => {
    it('should fetch tracking information', async () => {
      const mockAuthResponse = { token: 'mock_token' };
      const mockTracking = [
        {
          shipmentId: 'SHIP12345',
          trackingNumber: '000500076393019A3G0C701',
          status: 'EN_TRANSITO',
          events: [
            {
              event: 'PREIMPOSICION',
              eventDate: '2025-01-01T10:00:00Z',
              branch: 'CORREO ARGENTINO - ORIGEN',
              status: 'ADMITIDO',
            },
            {
              event: 'EN_TRANSITO',
              eventDate: '2025-01-02T14:30:00Z',
              branch: 'CORREO ARGENTINO - CENTRO DISTRIBUCION',
              status: 'EN_CAMINO',
            },
          ],
        },
      ];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockTracking,
        });

      const result = await service.getTracking({
        shippingId: '000500076393019A3G0C701',
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.[0].events.length).toBe(2);
    });
  });

  describe('isValidPostalCode', () => {
    it('should validate correct postal codes', () => {
      expect(service.isValidPostalCode('1425')).toBe(true);
      expect(service.isValidPostalCode('5000')).toBe(true);
      expect(service.isValidPostalCode('3000')).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(service.isValidPostalCode('123')).toBe(false);
      expect(service.isValidPostalCode('12345')).toBe(false);
      expect(service.isValidPostalCode('ABCD')).toBe(false);
      expect(service.isValidPostalCode('')).toBe(false);
    });
  });

  describe('setCustomerId / getCustomerId', () => {
    it('should set and get customer ID', () => {
      service.setCustomerId('new_customer_999');
      expect(service.getCustomerId()).toBe('new_customer_999');
    });
  });
});
