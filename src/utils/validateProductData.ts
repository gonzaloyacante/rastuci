// ==============================================================================
// validateProductData — Valida los datos del formulario de producto antes del
// submit. Retorna un string con el primer error encontrado, o null si todo OK.
// Extrae la lógica de validación del onSubmit para bajar la complejidad ciclomática.
// ==============================================================================

interface ProductValidationInput {
  name: string;
  price: number;
  categoryId: string;
  discountPercentage?: number | null;
  weight?: number | null;
  height?: number | null;
  width?: number | null;
  length?: number | null;
}

function validateDimension(
  value: number | null | undefined,
  label: string,
  min: number,
  max: number
): string | null {
  if (value === null || value === undefined) return null;
  if (!Number.isInteger(value) || value < min || value > max) {
    return `${label} debe ser un número entero entre ${min} y ${max}`;
  }
  return null;
}

export function validateProductData(
  data: ProductValidationInput,
  productImages: string[],
  colorImages: Record<string, string[]>
): string | null {
  if (!data.name || data.name.trim().length < 3) {
    return "El nombre debe tener al menos 3 caracteres";
  }

  if (!data.price || data.price <= 0 || isNaN(data.price)) {
    return "El precio debe ser mayor a 0";
  }

  if (!data.categoryId || data.categoryId.trim() === "") {
    return "Debes seleccionar una categoría";
  }

  const hasGlobalImages = productImages && productImages.length > 0;
  const hasColorImages = Object.values(colorImages).some(
    (imgs) => imgs && imgs.length > 0
  );
  if (!hasGlobalImages && !hasColorImages) {
    return "Debes subir al menos una imagen del producto";
  }

  const invalidImages = productImages.filter(
    (img) => !img || typeof img !== "string" || img.trim() === ""
  );
  if (invalidImages.length > 0) {
    return "Hay imágenes inválidas. Por favor, vuelve a subirlas.";
  }

  const dimError =
    validateDimension(data.weight, "El peso", 1, 30000) ||
    validateDimension(data.height, "La altura", 1, 150) ||
    validateDimension(data.width, "El ancho", 1, 150) ||
    validateDimension(data.length, "El largo", 1, 150);
  if (dimError) return dimError;

  if (
    data.discountPercentage !== null &&
    data.discountPercentage !== undefined &&
    (data.discountPercentage < 0 || data.discountPercentage > 100)
  ) {
    return "El descuento debe estar entre 0 y 100%";
  }

  return null;
}
