"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import {
  buildProductData,
  normalizeProductData,
  type ProductFormCategory,
  type ProductFormValues,
  productSchema,
} from "@/components/products/forms/productFormSchema";
import type { SizeGuideData } from "@/components/products/variants/SizeGuideEditor";
import { useToast } from "@/components/ui/Toast";
import { usePriceInput } from "@/hooks/usePriceInput";
import { logger } from "@/lib/logger";
import { Product, ProductVariant } from "@/types";
import { validateProductData } from "@/utils/validateProductData";

interface UseProductFormProps {
  initialData?: Product | null;
  categories: ProductFormCategory[];
}

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface InitSetters {
  setProductImages: SetState<string[]>;
  setColorImages: SetState<Record<string, string[]>>;
  setColors: SetState<string[]>;
  setSizes: SetState<string[]>;
  setFeatures: SetState<string[]>;
  setVariants: SetState<ProductVariant[]>;
  setSelectedCategoryId: SetState<string>;
  reset: (values: Partial<ProductFormValues>) => void;
}

function initializeFromData(
  data: NonNullable<Product | null>,
  setters: InitSetters
) {
  const {
    setProductImages,
    setColorImages,
    setColors,
    setSizes,
    setFeatures,
    setVariants,
    setSelectedCategoryId,
    reset,
  } = setters;
  const normalized = normalizeProductData(data);
  setProductImages(normalized.images);
  setColorImages(normalized.colorImages);
  setColors(normalized.colors);
  setSizes(normalized.sizes);
  setFeatures(normalized.features);
  setVariants(normalized.variants);
  setSelectedCategoryId(normalized.categoryId);
  reset(normalized.resetValues);
}

export function useProductForm({ initialData }: UseProductFormProps) {
  const router = useRouter();
  const { show } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.categoryId || ""
  );
  const [productImages, setProductImages] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const title = initialData ? "Editar Producto" : "Crear Nuevo Producto";
  const toastMessage = initialData
    ? "Producto actualizado exitosamente"
    : "Producto creado exitosamente";
  const action = initialData ? "Guardar Cambios" : "Crear Producto";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { stock: 0, categoryId: "", discountPercentage: null },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const watchPrice = watch("price");
  const watchDiscountPercentage = watch("discountPercentage");

  const totalVariantStock = useMemo(
    () => variants.reduce((acc, v) => acc + (v.stock || 0), 0),
    [variants]
  );

  const isOnSale = (watchDiscountPercentage ?? 0) > 0;

  const priceInputProps = usePriceInput(watchPrice, setValue, "price");

  const calculatedSalePrice =
    watchPrice && watchDiscountPercentage && watchDiscountPercentage > 0
      ? watchPrice * (1 - watchDiscountPercentage / 100)
      : null;

  useEffect(() => {
    logger.info("ProductForm mounted and interactive");
  }, []);

  useEffect(() => {
    if (initialData) {
      initializeFromData(initialData, {
        setProductImages,
        setColorImages,
        setColors,
        setSizes,
        setFeatures,
        setVariants,
        setSelectedCategoryId,
        reset,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    const total = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    setValue("stock", total, { shouldValidate: true });
  }, [variants, setValue]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId, { shouldValidate: true });
  };

  const handleSizeGuideChange = useCallback(
    (data: SizeGuideData | null) => {
      setValue("sizeGuide", data as unknown as Record<string, unknown>, {
        shouldDirty: true,
      });
    },
    [setValue]
  );

  async function handleResponseError(response: Response): Promise<never> {
    const errorText = await response.text();
    logger.error("Error response del servidor:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    let errorData: { error?: { message?: string }; message?: string };
    try {
      errorData = JSON.parse(errorText) as typeof errorData;
    } catch {
      errorData = { error: { message: errorText } };
    }
    const errorMsg =
      errorData.error?.message ??
      errorData.message ??
      `Error ${response.status}`;
    show({ type: "error", message: errorMsg });
    throw new Error(errorMsg);
  }

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true);
      const validationError = validateProductData(
        data,
        productImages,
        colorImages
      );
      if (validationError) {
        show({ type: "error", message: validationError });
        setLoading(false);
        return;
      }

      const productData = buildProductData(
        data,
        productImages,
        colorImages,
        totalVariantStock,
        sizes,
        colors,
        features,
        variants
      );
      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) await handleResponseError(response);

      router.push("/admin/productos");
      router.refresh();
      show({ type: "success", message: toastMessage });
    } catch (error) {
      logger.error("Error al guardar el producto:", { error });
      show({
        type: "error",
        message: "Error al procesar la solicitud. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = useCallback(
    (formErrors: Record<string, { message?: string }>) => {
      const sanitized = Object.keys(formErrors).reduce(
        (acc, key) => ({ ...acc, [key]: formErrors[key]?.message }),
        {}
      );
      logger.warn("Form validation errors:", sanitized);
      show({
        type: "error",
        message:
          "Hay errores en el formulario. Por favor revisa los campos en rojo.",
      });
      setTimeout(() => {
        const firstError = Object.keys(formErrors)[0];
        const el = document.getElementById(firstError);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }, 100);
    },
    [show]
  );

  const handleCancel = useCallback(() => router.back(), [router]);

  return {
    form,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    loading,
    title,
    action,
    initialData,
    selectedCategoryId,
    productImages,
    setProductImages,
    colorImages,
    setColorImages,
    colors,
    setColors,
    sizes,
    setSizes,
    features,
    setFeatures,
    variants,
    setVariants,
    totalVariantStock,
    isOnSale,
    watchPrice,
    watchDiscountPercentage,
    calculatedSalePrice,
    ...priceInputProps,
    handleCategoryChange,
    handleSizeGuideChange,
    handleCancel,
    handleFormError,
    onSubmit,
  };
}
