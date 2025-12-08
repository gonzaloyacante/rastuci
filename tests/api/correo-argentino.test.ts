/**
 * Tests for Correo Argentino integration
 *
 * Tests based on official MiCorreo API documentation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("CA API Endpoints", () => {
    describe("Environment URLs", () => {
        const getBaseUrl = (environment: "test" | "production") => {
            return environment === "test"
                ? "https://apitest.correoargentino.com.ar/micorreo/v1"
                : "https://api.correoargentino.com.ar/micorreo/v1";
        };

        it("should return test URL for test environment", () => {
            expect(getBaseUrl("test")).toBe("https://apitest.correoargentino.com.ar/micorreo/v1");
        });

        it("should return production URL for production environment", () => {
            expect(getBaseUrl("production")).toBe("https://api.correoargentino.com.ar/micorreo/v1");
        });
    });

    describe("Province Codes", () => {
        const provinceCodes: Record<string, string> = {
            A: "Salta",
            B: "Buenos Aires",
            C: "Ciudad Autónoma de Buenos Aires",
            D: "San Luis",
            E: "Entre Ríos",
            F: "La Rioja",
            G: "Santiago del Estero",
            H: "Chaco",
            J: "San Juan",
            K: "Catamarca",
            L: "La Pampa",
            M: "Mendoza",
            N: "Misiones",
            P: "Formosa",
            Q: "Neuquén",
            R: "Río Negro",
            S: "Santa Fe",
            T: "Tucumán",
            U: "Chubut",
            V: "Tierra del Fuego",
            W: "Corrientes",
            X: "Córdoba",
            Y: "Jujuy",
            Z: "Santa Cruz",
        };

        const getProvinceCode = (provinceName: string): string | null => {
            const normalizedName = provinceName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            for (const [code, name] of Object.entries(provinceCodes)) {
                const normalizedProvince = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (normalizedProvince.includes(normalizedName) || normalizedName.includes(normalizedProvince)) {
                    return code;
                }
            }
            return null;
        };

        it("should return B for Buenos Aires", () => {
            expect(getProvinceCode("Buenos Aires")).toBe("B");
        });

        it("should return C for CABA", () => {
            expect(getProvinceCode("Ciudad Autónoma de Buenos Aires")).toBe("C");
        });

        it("should return X for Córdoba", () => {
            expect(getProvinceCode("Córdoba")).toBe("X");
        });

        it("should handle accents", () => {
            expect(getProvinceCode("Cordoba")).toBe("X");
        });

        it("should have all 24 provinces", () => {
            expect(Object.keys(provinceCodes).length).toBe(24);
        });
    });
});

describe("CA Rate Request Validation", () => {
    interface RateRequest {
        customerId: string;
        postalCodeOrigin: string;
        postalCodeDestination: string;
        deliveredType?: "D" | "S";
        dimensions: {
            weight: number;
            height: number;
            width: number;
            length: number;
        };
    }

    const validateRateRequest = (request: RateRequest) => {
        const errors: string[] = [];

        if (!request.customerId) {
            errors.push("customerId es requerido");
        }

        if (!request.postalCodeOrigin || !/^\d{4}$/.test(request.postalCodeOrigin)) {
            errors.push("postalCodeOrigin debe ser un código postal válido de 4 dígitos");
        }

        if (!request.postalCodeDestination || !/^\d{4}$/.test(request.postalCodeDestination)) {
            errors.push("postalCodeDestination debe ser un código postal válido de 4 dígitos");
        }

        if (request.dimensions.weight < 1 || request.dimensions.weight > 25000) {
            errors.push("El peso debe estar entre 1g y 25000g");
        }

        if (request.dimensions.height > 150) {
            errors.push("El alto no puede exceder 150cm");
        }

        if (request.dimensions.width > 150) {
            errors.push("El ancho no puede exceder 150cm");
        }

        if (request.dimensions.length > 150) {
            errors.push("El largo no puede exceder 150cm");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    };

    it("should accept valid rate request", () => {
        const request: RateRequest = {
            customerId: "0000550997",
            postalCodeOrigin: "1757",
            postalCodeDestination: "1704",
            deliveredType: "D",
            dimensions: {
                weight: 2500,
                height: 10,
                width: 20,
                length: 30,
            },
        };

        expect(validateRateRequest(request).valid).toBe(true);
    });

    it("should reject missing customerId", () => {
        const request: RateRequest = {
            customerId: "",
            postalCodeOrigin: "1757",
            postalCodeDestination: "1704",
            dimensions: { weight: 1000, height: 10, width: 10, length: 10 },
        };

        const result = validateRateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("customerId es requerido");
    });

    it("should reject invalid postal code", () => {
        const request: RateRequest = {
            customerId: "0000550997",
            postalCodeOrigin: "123",
            postalCodeDestination: "1704",
            dimensions: { weight: 1000, height: 10, width: 10, length: 10 },
        };

        const result = validateRateRequest(request);
        expect(result.valid).toBe(false);
    });

    it("should reject weight over limit", () => {
        const request: RateRequest = {
            customerId: "0000550997",
            postalCodeOrigin: "1757",
            postalCodeDestination: "1704",
            dimensions: { weight: 30000, height: 10, width: 10, length: 10 },
        };

        const result = validateRateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("El peso debe estar entre 1g y 25000g");
    });

    it("should reject dimensions over 150cm", () => {
        const request: RateRequest = {
            customerId: "0000550997",
            postalCodeOrigin: "1757",
            postalCodeDestination: "1704",
            dimensions: { weight: 1000, height: 200, width: 10, length: 10 },
        };

        const result = validateRateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("El alto no puede exceder 150cm");
    });
});

describe("CA Shipping Import Validation", () => {
    interface ShippingImportRequest {
        customerId: string;
        extOrderId: string;
        orderNumber: string;
        recipient: {
            name: string;
            email: string;
            phone?: string;
        };
        shipping: {
            deliveryType: "D" | "S";
            productType: string;
            agency?: string;
            address: {
                streetName: string;
                streetNumber: string;
                city: string;
                provinceCode: string;
                postalCode: string;
            };
            weight: number;
            declaredValue: number;
            height: number;
            length: number;
            width: number;
        };
    }

    const validateShippingImport = (request: ShippingImportRequest) => {
        const errors: string[] = [];

        if (!request.customerId) {
            errors.push("customerId es requerido");
        }

        if (!request.extOrderId) {
            errors.push("extOrderId es requerido");
        }

        if (!request.recipient.name) {
            errors.push("El nombre del destinatario es requerido");
        }

        if (!request.recipient.email) {
            errors.push("El email del destinatario es requerido");
        }

        if (request.shipping.deliveryType === "D") {
            if (!request.shipping.address.streetName) {
                errors.push("La calle es requerida para envío a domicilio");
            }
            if (!request.shipping.address.streetNumber) {
                errors.push("El número es requerido para envío a domicilio");
            }
            if (!request.shipping.address.city) {
                errors.push("La ciudad es requerida para envío a domicilio");
            }
            if (!request.shipping.address.postalCode) {
                errors.push("El código postal es requerido para envío a domicilio");
            }
        }

        if (request.shipping.deliveryType === "S" && !request.shipping.agency) {
            errors.push("El código de sucursal es requerido para envío a sucursal");
        }

        if (request.shipping.weight <= 0) {
            errors.push("El peso debe ser mayor a 0");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    };

    it("should accept valid home delivery request", () => {
        const request: ShippingImportRequest = {
            customerId: "0005000033",
            extOrderId: "583358193",
            orderNumber: "102",
            recipient: {
                name: "Juan Pérez",
                email: "juan@test.com",
            },
            shipping: {
                deliveryType: "D",
                productType: "CP",
                address: {
                    streetName: "Av. Corrientes",
                    streetNumber: "1234",
                    city: "Buenos Aires",
                    provinceCode: "B",
                    postalCode: "1425",
                },
                weight: 1000,
                declaredValue: 500,
                height: 20,
                length: 40,
                width: 20,
            },
        };

        expect(validateShippingImport(request).valid).toBe(true);
    });

    it("should accept valid agency delivery request", () => {
        const request: ShippingImportRequest = {
            customerId: "0005000033",
            extOrderId: "583358194",
            orderNumber: "103",
            recipient: {
                name: "Juan Pérez",
                email: "juan@test.com",
            },
            shipping: {
                deliveryType: "S",
                productType: "CP",
                agency: "E0000",
                address: {
                    streetName: "",
                    streetNumber: "",
                    city: "",
                    provinceCode: "B",
                    postalCode: "1425",
                },
                weight: 1000,
                declaredValue: 500,
                height: 20,
                length: 40,
                width: 20,
            },
        };

        expect(validateShippingImport(request).valid).toBe(true);
    });

    it("should reject missing agency for sucursal delivery", () => {
        const request: ShippingImportRequest = {
            customerId: "0005000033",
            extOrderId: "583358194",
            orderNumber: "103",
            recipient: {
                name: "Juan Pérez",
                email: "juan@test.com",
            },
            shipping: {
                deliveryType: "S",
                productType: "CP",
                address: {
                    streetName: "",
                    streetNumber: "",
                    city: "",
                    provinceCode: "B",
                    postalCode: "1425",
                },
                weight: 1000,
                declaredValue: 500,
                height: 20,
                length: 40,
                width: 20,
            },
        };

        const result = validateShippingImport(request);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("El código de sucursal es requerido para envío a sucursal");
    });

    it("should reject zero weight", () => {
        const request: ShippingImportRequest = {
            customerId: "0005000033",
            extOrderId: "583358193",
            orderNumber: "102",
            recipient: {
                name: "Juan Pérez",
                email: "juan@test.com",
            },
            shipping: {
                deliveryType: "D",
                productType: "CP",
                address: {
                    streetName: "Av. Corrientes",
                    streetNumber: "1234",
                    city: "Buenos Aires",
                    provinceCode: "B",
                    postalCode: "1425",
                },
                weight: 0,
                declaredValue: 500,
                height: 20,
                length: 40,
                width: 20,
            },
        };

        const result = validateShippingImport(request);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("El peso debe ser mayor a 0");
    });
});

describe("CA Tracking", () => {
    interface TrackingEvent {
        event: string;
        date: string;
        branch: string;
        status: string;
        sign: string;
    }

    interface TrackingResponse {
        id: string | null;
        productId: string | null;
        trackingNumber: string;
        events: TrackingEvent[];
    }

    const parseTrackingStatus = (events: TrackingEvent[]) => {
        if (events.length === 0) return "UNKNOWN";

        const lastEvent = events[0];
        const eventMap: Record<string, string> = {
            PREIMPOSICION: "PENDING",
            ADMISION: "PROCESSING",
            EN_TRANSITO: "IN_TRANSIT",
            EN_SUCURSAL: "AT_BRANCH",
            ENTREGADO: "DELIVERED",
            CADUCA: "EXPIRED",
            DEVUELTO: "RETURNED",
        };

        return eventMap[lastEvent.event] || "UNKNOWN";
    };

    it("should parse PREIMPOSICION as PENDING", () => {
        const events: TrackingEvent[] = [
            { event: "PREIMPOSICION", date: "28-08-2024 10:33", branch: "CORREO ARGENTINO", status: "", sign: "" },
        ];
        expect(parseTrackingStatus(events)).toBe("PENDING");
    });

    it("should parse ENTREGADO as DELIVERED", () => {
        const events: TrackingEvent[] = [
            { event: "ENTREGADO", date: "01-09-2024 14:00", branch: "Buenos Aires", status: "", sign: "Juan" },
        ];
        expect(parseTrackingStatus(events)).toBe("DELIVERED");
    });

    it("should parse CADUCA as EXPIRED", () => {
        const events: TrackingEvent[] = [
            { event: "CADUCA", date: "09-12-2024 05:00", branch: "CORREO ARGENTINO", status: "", sign: "" },
        ];
        expect(parseTrackingStatus(events)).toBe("EXPIRED");
    });

    it("should return UNKNOWN for empty events", () => {
        expect(parseTrackingStatus([])).toBe("UNKNOWN");
    });

    it("should return UNKNOWN for unrecognized event", () => {
        const events: TrackingEvent[] = [
            { event: "EVENTO_DESCONOCIDO", date: "01-09-2024 14:00", branch: "", status: "", sign: "" },
        ];
        expect(parseTrackingStatus(events)).toBe("UNKNOWN");
    });
});
