/**
 * Tests for validation utilities
 *
 * Tests validators for forms, addresses, and business logic.
 */

import { describe, it, expect } from "vitest";

describe("Address Validation", () => {
    const isValidArgentinePostalCode = (code: string) => {
        return /^\d{4}$/.test(code);
    };

    const isValidProvince = (province: string) => {
        const validProvinces = [
            "Buenos Aires",
            "Ciudad Autónoma de Buenos Aires",
            "Catamarca",
            "Chaco",
            "Chubut",
            "Córdoba",
            "Corrientes",
            "Entre Ríos",
            "Formosa",
            "Jujuy",
            "La Pampa",
            "La Rioja",
            "Mendoza",
            "Misiones",
            "Neuquén",
            "Río Negro",
            "Salta",
            "San Juan",
            "San Luis",
            "Santa Cruz",
            "Santa Fe",
            "Santiago del Estero",
            "Tierra del Fuego",
            "Tucumán",
        ];
        return validProvinces.some(
            (p) => p.toLowerCase() === province.toLowerCase()
        );
    };

    const parseStreetAddress = (address: string) => {
        const match = address.match(/^(.+?)\s+(\d+)/);
        if (match) {
            return {
                streetName: match[1].trim(),
                streetNumber: match[2],
            };
        }
        return {
            streetName: address.trim(),
            streetNumber: "S/N",
        };
    };

    describe("isValidArgentinePostalCode", () => {
        it("should accept valid 4-digit codes", () => {
            expect(isValidArgentinePostalCode("1234")).toBe(true);
            expect(isValidArgentinePostalCode("1000")).toBe(true);
            expect(isValidArgentinePostalCode("5000")).toBe(true);
        });

        it("should reject invalid codes", () => {
            expect(isValidArgentinePostalCode("123")).toBe(false);
            expect(isValidArgentinePostalCode("12345")).toBe(false);
            expect(isValidArgentinePostalCode("ABCD")).toBe(false);
            expect(isValidArgentinePostalCode("")).toBe(false);
        });
    });

    describe("isValidProvince", () => {
        it("should accept valid provinces", () => {
            expect(isValidProvince("Buenos Aires")).toBe(true);
            expect(isValidProvince("Córdoba")).toBe(true);
            expect(isValidProvince("Ciudad Autónoma de Buenos Aires")).toBe(true);
        });

        it("should be case insensitive", () => {
            expect(isValidProvince("buenos aires")).toBe(true);
            expect(isValidProvince("MENDOZA")).toBe(true);
        });

        it("should reject invalid provinces", () => {
            expect(isValidProvince("Invalid")).toBe(false);
            expect(isValidProvince("")).toBe(false);
        });
    });

    describe("parseStreetAddress", () => {
        it("should extract street name and number", () => {
            const result = parseStreetAddress("Av. Corrientes 1234");
            expect(result.streetName).toBe("Av. Corrientes");
            expect(result.streetNumber).toBe("1234");
        });

        it("should handle address without number", () => {
            const result = parseStreetAddress("Calle Sin Numero");
            expect(result.streetName).toBe("Calle Sin Numero");
            expect(result.streetNumber).toBe("S/N");
        });

        it("should handle complex street names", () => {
            const result = parseStreetAddress("Av. General San Martín 500");
            expect(result.streetName).toBe("Av. General San Martín");
            expect(result.streetNumber).toBe("500");
        });
    });
});

describe("Order Validation", () => {
    interface OrderItem {
        productId: string;
        quantity: number;
        price: number;
    }

    interface Order {
        items: OrderItem[];
        customerEmail: string;
        customerName: string;
        total: number;
    }

    const validateOrder = (order: Partial<Order>) => {
        const errors: string[] = [];

        if (!order.items || order.items.length === 0) {
            errors.push("El pedido debe tener al menos un producto");
        }

        if (!order.customerEmail) {
            errors.push("El email del cliente es requerido");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail)) {
            errors.push("El formato del email es inválido");
        }

        if (!order.customerName || order.customerName.trim().length < 2) {
            errors.push("El nombre del cliente es requerido");
        }

        if (order.items) {
            for (const item of order.items) {
                if (item.quantity < 1) {
                    errors.push(`Cantidad inválida para producto ${item.productId}`);
                }
                if (item.price < 0) {
                    errors.push(`Precio inválido para producto ${item.productId}`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    };

    it("should accept valid order", () => {
        const order: Order = {
            items: [{ productId: "1", quantity: 2, price: 100 }],
            customerEmail: "test@test.com",
            customerName: "Juan Pérez",
            total: 200,
        };

        const result = validateOrder(order);
        expect(result.valid).toBe(true);
    });

    it("should reject order without items", () => {
        const order = {
            items: [],
            customerEmail: "test@test.com",
            customerName: "Juan",
            total: 0,
        };

        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("El pedido debe tener al menos un producto");
    });

    it("should reject invalid email", () => {
        const order = {
            items: [{ productId: "1", quantity: 1, price: 100 }],
            customerEmail: "invalid",
            customerName: "Juan",
            total: 100,
        };

        const result = validateOrder(order);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("El formato del email es inválido");
    });

    it("should reject invalid quantity", () => {
        const order = {
            items: [{ productId: "1", quantity: 0, price: 100 }],
            customerEmail: "test@test.com",
            customerName: "Juan",
            total: 0,
        };

        const result = validateOrder(order);
        expect(result.valid).toBe(false);
    });
});

describe("Shipping Validation", () => {
    type ShippingMethod = "home_delivery" | "agency_pickup";

    interface ShippingData {
        method: ShippingMethod;
        street?: string;
        city?: string;
        postalCode?: string;
        agencyCode?: string;
    }

    const validateShipping = (data: ShippingData) => {
        const errors: string[] = [];

        if (data.method === "home_delivery") {
            if (!data.street) errors.push("La calle es requerida para envío a domicilio");
            if (!data.city) errors.push("La ciudad es requerida para envío a domicilio");
            if (!data.postalCode) errors.push("El código postal es requerido");
        }

        if (data.method === "agency_pickup") {
            if (!data.agencyCode) errors.push("Debe seleccionar una sucursal");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    };

    it("should validate home delivery with all fields", () => {
        const data: ShippingData = {
            method: "home_delivery",
            street: "Av. Corrientes 1234",
            city: "Buenos Aires",
            postalCode: "1043",
        };

        expect(validateShipping(data).valid).toBe(true);
    });

    it("should reject home delivery without street", () => {
        const data: ShippingData = {
            method: "home_delivery",
            city: "Buenos Aires",
            postalCode: "1043",
        };

        const result = validateShipping(data);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("La calle es requerida para envío a domicilio");
    });

    it("should validate agency pickup with code", () => {
        const data: ShippingData = {
            method: "agency_pickup",
            agencyCode: "AGN001",
        };

        expect(validateShipping(data).valid).toBe(true);
    });

    it("should reject agency pickup without code", () => {
        const data: ShippingData = {
            method: "agency_pickup",
        };

        const result = validateShipping(data);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Debe seleccionar una sucursal");
    });
});
