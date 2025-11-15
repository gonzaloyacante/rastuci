import {
  capitalize,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPhone,
  formatPrice,
  formatPriceARS,
  generateSlug,
  isValidEmail,
  isValidPhone,
  truncateText,
} from "@/utils/formatters";

describe("Formatters Utils", () => {
  describe("formatPrice (Colombian pesos)", () => {
    it("debe formatear precios en pesos colombianos", () => {
      expect(formatPrice(100)).toContain("100");
      expect(formatPrice(1000)).toContain("1.000");
    });

    it("debe manejar números grandes", () => {
      expect(formatPrice(1000000)).toContain("1.000.000");
    });
  });

  describe("formatCurrency (Argentinian pesos)", () => {
    it("debe formatear precios enteros SIEMPRE con 2 decimales", () => {
      // formatCurrency SIEMPRE muestra 2 decimales (minimumFractionDigits: 2)
      expect(formatCurrency(100)).toBe("$100,00");
      expect(formatCurrency(1000)).toBe("$1.000,00");
    });

    it("debe formatear precios con decimales", () => {
      expect(formatCurrency(100.5)).toBe("$100,50");
      expect(formatCurrency(1234.56)).toBe("$1.234,56");
    });
  });

  describe("formatPriceARS", () => {
    it("debe formatear sin decimales por defecto", () => {
      expect(formatPriceARS(100)).toBe("$100");
      expect(formatPriceARS(1000)).toBe("$1.000");
    });

    it("debe formatear con decimales cuando se especifica", () => {
      expect(formatPriceARS(100, true)).toBe("$100,00");
      expect(formatPriceARS(100.5, true)).toBe("$100,50");
    });
  });

  describe("formatNumber", () => {
    it("debe formatear números con separadores de miles", () => {
      expect(formatNumber(1000)).toBe("1.000");
      expect(formatNumber(1234567)).toBe("1.234.567");
    });
  });

  describe("capitalize", () => {
    it("debe capitalizar primera letra", () => {
      expect(capitalize("hola")).toBe("Hola");
      expect(capitalize("MUNDO")).toBe("Mundo");
      expect(capitalize("")).toBe("");
    });
  });

  describe("truncateText", () => {
    it("debe truncar texto largo", () => {
      expect(truncateText("Texto muy largo", 10)).toBe("Texto muy ...");
    });

    it("debe retornar texto completo si es más corto", () => {
      expect(truncateText("Corto", 10)).toBe("Corto");
    });
  });

  describe("generateSlug", () => {
    it("debe generar slug válido", () => {
      expect(generateSlug("Producto Increíble")).toBe("producto-increible");
      expect(generateSlug("Café & Té")).toBe("cafe-te");
    });

    it("debe manejar espacios múltiples", () => {
      expect(generateSlug("Producto    Con    Espacios")).toBe(
        "producto-con-espacios"
      );
    });
  });

  describe("isValidEmail", () => {
    it("debe validar emails correctos", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("usuario.nombre@dominio.co")).toBe(true);
    });

    it("debe rechazar emails inválidos", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("debe validar teléfonos colombianos correctos", () => {
      expect(isValidPhone("3001234567")).toBe(true);
      expect(isValidPhone("+573001234567")).toBe(true);
    });

    it("debe rechazar teléfonos inválidos", () => {
      expect(isValidPhone("1234567890")).toBe(false);
      expect(isValidPhone("30012345")).toBe(false);
    });
  });

  describe("formatPhone", () => {
    it("debe formatear teléfono colombiano", () => {
      expect(formatPhone("3001234567")).toBe("+57 300 123 4567");
    });

    it("debe retornar sin cambios si no es válido", () => {
      expect(formatPhone("1234567890")).toBe("1234567890");
    });
  });

  describe("formatDate", () => {
    it("debe formatear fecha correctamente", () => {
      const date = new Date("2024-01-15T10:30:00");
      const formatted = formatDate(date);
      expect(formatted).toContain("enero");
      expect(formatted).toContain("2024");
    });

    it("debe manejar string de fecha", () => {
      const formatted = formatDate("2024-01-15T10:30:00");
      expect(formatted).toContain("enero");
    });
  });
});
