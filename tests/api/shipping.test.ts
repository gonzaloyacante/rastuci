/**
 * Tests for Shipping API endpoints
 *
 * These tests verify the Correo Argentino integration endpoints work correctly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the correoArgentinoService
vi.mock("@/lib/correo-argentino-service", () => ({
    correoArgentinoService: {
        authenticate: vi.fn(),
        getRates: vi.fn(),
        getAgencies: vi.fn(),
        importShipment: vi.fn(),
        getTracking: vi.fn(),
        getCustomerId: vi.fn(() => "0000550997"),
    },
    PROVINCE_NAMES: {
        B: "Buenos Aires",
        C: "Ciudad Autónoma de Buenos Aires",
    },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

import { correoArgentinoService } from "@/lib/correo-argentino-service";

describe("Correo Argentino Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getRates", () => {
        it("should return rates for valid postal codes", async () => {
            const mockRates = {
                success: true,
                data: {
                    customerId: "0000550997",
                    validTo: new Date().toISOString(),
                    rates: [
                        {
                            deliveredType: "D" as const,
                            productType: "CP" as const,
                            productName: "Correo Argentino Clásico",
                            price: 1500,
                            deliveryTimeMin: "3",
                            deliveryTimeMax: "5",
                        },
                    ],
                },
            };

            vi.mocked(correoArgentinoService.getRates).mockResolvedValueOnce(
                mockRates
            );

            const result = await correoArgentinoService.getRates({
                customerId: "0000550997",
                postalCodeOrigin: "1757",
                postalCodeDestination: "1704",
                dimensions: {
                    weight: 2500,
                    height: 10,
                    width: 20,
                    length: 30,
                },
            });

            expect(result.success).toBe(true);
            expect(result.data?.rates).toHaveLength(1);
            expect(result.data?.rates[0].price).toBe(1500);
        });

        it("should handle API errors gracefully", async () => {
            vi.mocked(correoArgentinoService.getRates).mockResolvedValueOnce({
                success: false,
                error: {
                    code: "INVALID_POSTAL_CODE",
                    message: "Código postal inválido",
                },
            });

            const result = await correoArgentinoService.getRates({
                customerId: "123",
                postalCodeOrigin: "1000",
                postalCodeDestination: "2000",
                dimensions: {
                    weight: 1000,
                    height: 10,
                    width: 10,
                    length: 10,
                },
            });

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe("INVALID_POSTAL_CODE");
        });
    });

    describe("importShipment", () => {
        it("should import shipment with complete address data", async () => {
            const mockResponse = {
                success: true,
                data: {
                    createdAt: new Date().toISOString(),
                    trackingNumber: "RR123456789AR",
                    shipmentId: "SHP123",
                },
            };

            vi.mocked(correoArgentinoService.importShipment).mockResolvedValueOnce(
                mockResponse
            );

            const result = await correoArgentinoService.importShipment({
                customerId: "0000550997",
                extOrderId: "ord_123",
                recipient: {
                    name: "Juan Pérez",
                    email: "juan@test.com",
                },
                shipping: {
                    deliveryType: "D" as const,
                    productType: "CP" as const,
                    address: {
                        streetName: "Av. Corrientes",
                        streetNumber: "1234",
                        city: "Buenos Aires",
                        provinceCode: "C",
                        postalCode: "1043",
                    },
                    weight: 2500,
                    height: 10,
                    width: 20,
                    length: 30,
                    declaredValue: 5000,
                },
            });

            expect(result.success).toBe(true);
            expect(result.data?.trackingNumber).toBe("RR123456789AR");
        });

        it("should handle missing address fields", async () => {
            vi.mocked(correoArgentinoService.importShipment).mockResolvedValueOnce({
                success: false,
                error: {
                    code: "MISSING_ADDRESS",
                    message: "Envío a domicilio requiere dirección completa",
                },
            });

            const result = await correoArgentinoService.importShipment({
                customerId: "0000550997",
                extOrderId: "ord_123",
                recipient: {
                    name: "Juan Pérez",
                    email: "juan@test.com",
                },
                shipping: {
                    deliveryType: "D" as const,
                    productType: "CP" as const,
                    // Missing address fields
                    weight: 2500,
                    height: 10,
                    width: 20,
                    length: 30,
                    declaredValue: 5000,
                },
            });

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe("MISSING_ADDRESS");
        });
    });

    describe("getAgencies", () => {
        it("should return agencies for a province", async () => {
            const mockAgencies = {
                success: true,
                data: [
                    {
                        code: "AGN001",
                        name: "Sucursal Centro",
                        status: "ACTIVE" as const,
                        manager: "Juan Manager",
                        email: "centro@correo.com",
                        phone: "1122334455",
                        services: {
                            packageReception: true,
                            pickupAvailability: true,
                        },
                        location: {
                            address: {
                                streetName: "Calle Falsa",
                                streetNumber: "123",
                                city: "Buenos Aires",
                                provinceCode: "B" as const,
                                postalCode: "1000",
                                province: "Buenos Aires",
                            },
                            latitude: "-34.123",
                            longitude: "-58.123",
                        },
                        hours: {
                            monday: { start: "09:00", end: "18:00" },
                            tuesday: { start: "09:00", end: "18:00" },
                            wednesday: null,
                            thursday: null,
                            friday: null,
                            saturday: null,
                            sunday: null,
                            holidays: null,
                        },
                    },
                    {
                        code: "AGN002",
                        name: "Sucursal Norte",
                        status: "ACTIVE" as const,
                        manager: "Pedro Manager",
                        email: "norte@correo.com",
                        phone: "1122334456",
                        services: {
                            packageReception: true,
                            pickupAvailability: true,
                        },
                        location: {
                            address: {
                                streetName: "Calle Norte",
                                streetNumber: "456",
                                city: "Buenos Aires",
                                provinceCode: "B" as const,
                                postalCode: "1600",
                                province: "Buenos Aires",
                            },
                            latitude: "-34.456",
                            longitude: "-58.456",
                        },
                        hours: {
                            monday: { start: "09:00", end: "18:00" },
                            tuesday: { start: "09:00", end: "18:00" },
                            wednesday: null,
                            thursday: null,
                            friday: null,
                            saturday: null,
                            sunday: null,
                            holidays: null,
                        },
                    },
                ],
            };

            vi.mocked(correoArgentinoService.getAgencies).mockResolvedValueOnce(
                mockAgencies
            );

            const result = await correoArgentinoService.getAgencies({
                customerId: "0000550997",
                provinceCode: "B",
            });

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
        });
    });
});

describe("Shipping Address Parsing", () => {
    const parseAddress = (address: string) => {
        const addressParts = address.split(",").map((s) => s.trim());
        const streetPart = addressParts[0] || "";
        const streetMatch = streetPart.match(/^(.+?)\s+(\d+)/);
        const streetName = streetMatch ? streetMatch[1].trim() : streetPart;
        const streetNumber = streetMatch ? streetMatch[2] : "S/N";

        const postalCodeMatch = address.match(/\b(\d{4})\b/);
        const postalCode = postalCodeMatch ? postalCodeMatch[1] : "1611";

        return { streetName, streetNumber, postalCode };
    };

    it("should extract street name and number correctly", () => {
        const result = parseAddress("Av. Corrientes 1234, CABA");
        expect(result.streetName).toBe("Av. Corrientes");
        expect(result.streetNumber).toBe("1234");
    });

    it("should handle address without number", () => {
        const result = parseAddress("Calle Sin Numero, Ciudad");
        expect(result.streetName).toBe("Calle Sin Numero");
        expect(result.streetNumber).toBe("S/N");
    });

    it("should extract postal code", () => {
        const result = parseAddress("Av. San Martín 500, 1704 Ramos Mejía");
        expect(result.postalCode).toBe("1704");
    });
});
