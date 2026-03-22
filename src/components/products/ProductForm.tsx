"use client";

import {
  AlertCircle,
  DollarSign,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  List,
  Package,
  Palette,
  Percent,
  Ruler,
  Save,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useProductForm } from "@/hooks/useProductForm";
import { formatPriceARS } from "@/utils/formatters";

import ImageUploadZone from "./ImageUploadZone";
import {
  ColorPicker,
  FeatureManager,
  HelpTooltip,
  SizeManager,
} from "./ProductFormComponents";
import {
  numericKeyHandler,
  numericPasteHandler,
  type ProductFormProps,
} from "./productFormSchema";
import ProductPreview from "./ProductPreview";
import SizeGuideEditor, { SizeGuideData } from "./SizeGuideEditor";
import VariantManager from "./VariantManager";

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function ProductForm({
  initialData,
  categories,
}: ProductFormProps) {
  const {
    register, handleSubmit, errors, watch, loading, title, action,
    selectedCategoryId, productImages, setProductImages, colorImages, setColorImages,
    colors, setColors, sizes, setSizes, features, setFeatures, variants, setVariants,
    totalVariantStock, isOnSale, watchPrice, watchDiscountPercentage, calculatedSalePrice,
    priceInput, handlePriceFocus, handlePriceChange, handlePriceKeyDown, handlePricePaste,
    handlePriceBlur, handleCategoryChange, handleSizeGuideChange, handleCancel,
    handleFormError, onSubmit,
  } = useProductForm({ initialData, categories });

  return (
    <div className="min-h-screen surface py-8 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header - responsive */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full mb-3 sm:mb-4 shadow-lg">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent px-4">
            {title}
          </h1>
          <p className="muted mt-2 text-sm sm:text-base lg:text-lg px-4">
            {initialData
              ? `Modifica los datos del producto: ${initialData.name}`
              : "Completa toda la información para crear un producto completo"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, handleFormError)}
          className="space-y-4 sm:space-y-6 lg:space-y-8"
        >
          {/* Información Básica */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b bg-surface-secondary p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 text-foreground">
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-medium mb-2"
                  >
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-2" />
                    Nombre del Producto *
                  </label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: Vestido Floral Primavera"
                    className={errors.name ? "border-error" : ""}
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium mb-2"
                  >
                    <Tag className="h-4 w-4 inline mr-2" />
                    Categoría *
                  </label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={handleCategoryChange}
                    disabled={loading}
                  >
                    <SelectTrigger
                      id="categoryId"
                      className={errors.categoryId ? "border-error" : ""}
                    >
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Descripción Detallada
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe detalladamente el producto..."
                  rows={4}
                  className={`form-input resize-none ${errors.description ? "border-error" : ""}`}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 1000 caracteres.
                </p>
                {errors.description && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Imágenes del Producto */}
          <Card className="shadow-xl border-0">
            <CardHeader className="border-b bg-surface-secondary p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 text-foreground">
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Imágenes del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Sube las fotos principales del producto. También podés subir
                imágenes por color en la sección &quot;Variantes&quot;.
              </p>
              <ImageUploadZone
                existingImages={productImages}
                onImagesChange={setProductImages}
                maxImages={10}
              />
            </CardContent>
          </Card>

          {/* Precios y Stock */}
          <Card className="shadow-xl border-0">
            <CardHeader className="border-b bg-surface-secondary p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 text-foreground">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Precios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium mb-2"
                  >
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Precio Base *
                  </label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    value={priceInput}
                    onFocus={handlePriceFocus}
                    onChange={handlePriceChange}
                    onKeyDown={handlePriceKeyDown}
                    onPaste={handlePricePaste}
                    onBlur={handlePriceBlur}
                    placeholder={formatPriceARS(0)}
                    className={errors.price ? "border-error" : ""}
                    disabled={loading}
                  />
                  {watchPrice > 0 && (
                    <p className="text-xs text-success mt-1 font-medium">
                      {formatPriceARS(Number(watchPrice))}
                    </p>
                  )}
                  {errors.price && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="discountPercentage"
                    className="block text-sm font-medium mb-2"
                  >
                    <Percent className="h-4 w-4 inline mr-2" />
                    Descuento (%)
                  </label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...register("discountPercentage")}
                    placeholder="0"
                    onKeyDown={numericKeyHandler}
                    onPaste={numericPasteHandler}
                    className={errors.discountPercentage ? "border-error" : ""}
                    disabled={loading}
                  />
                  {watchDiscountPercentage &&
                    watchDiscountPercentage > 0 &&
                    calculatedSalePrice && (
                      <>
                        <p className="text-xs text-warning mt-1 font-medium">
                          Precio en oferta:{" "}
                          {formatPriceARS(Number(calculatedSalePrice))}
                          <span className="ml-1 text-destructive">
                            (-{watchDiscountPercentage}%)
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          El descuento será de{" "}
                          {formatPriceARS(
                            Number(watchPrice || 0) -
                              Number(calculatedSalePrice)
                          )}
                        </p>
                      </>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variantes del Producto - REORDERED: Moved UP */}
          <Card className="shadow-xl border-0">
            <CardHeader className="border-b bg-surface-secondary p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 text-foreground">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                Variantes del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-3">
                  <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-2" />
                  Talles Disponibles
                </label>
                <SizeManager sizes={sizes} onSizesChange={setSizes} />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-3">
                  <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-2" />
                  Colores Disponibles
                </label>
                <ColorPicker
                  colors={colors}
                  onColorsChange={setColors}
                  colorImages={colorImages}
                  onColorImagesChange={(color, imgs) =>
                    setColorImages((prev) => ({ ...prev, [color]: imgs }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-3">
                  <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-2" />
                  Características Especiales
                </label>
                <FeatureManager
                  features={features}
                  onFeaturesChange={setFeatures}
                />
              </div>

              {/* Variant Manager */}
              <div className="pt-4 border-t">
                <label className="block text-xs sm:text-sm font-medium mb-3">
                  <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-2" />
                  Gestión de Stock por Variante
                </label>
                <VariantManager
                  variants={variants}
                  onChange={setVariants}
                  availableColors={colors}
                  availableSizes={sizes}
                />
              </div>
            </CardContent>
          </Card>

          {/* Guía de Talles (Smart Table) */}
          <Card className="shadow-xl border-0">
            <CardHeader className="border-b bg-surface-secondary p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 text-foreground">
                <Ruler className="h-4 w-4 sm:h-5 sm:w-5" />
                Guía de Talles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <label className="block text-sm text-muted-foreground mb-4">
                Define las medidas específicas para cada talle seleccionado.
                Esta tabla se mostrará a los clientes en el botón "Ver guía de
                talles".
              </label>
              <SizeGuideEditor
                sizes={sizes}
                value={watch("sizeGuide") as unknown as SizeGuideData}
                onChange={handleSizeGuideChange}
              />
            </CardContent>
          </Card>

          {/* Dimensiones para Envío */}
          <Card className="shadow-xl border-0">
            <CardHeader className="border-b bg-surface-secondary p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 text-foreground">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Dimensiones para Envío
                <HelpTooltip text="Estas medidas son requeridas para calcular el costo de envío con Correo Argentino." />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  {
                    id: "weight",
                    label: "Peso (gramos)",
                    placeholder: "1000",
                    min: "1g",
                    max: "30kg",
                  },
                  {
                    id: "height",
                    label: "Alto (cm)",
                    placeholder: "10",
                    min: "1cm",
                    max: "150cm",
                  },
                  {
                    id: "width",
                    label: "Ancho (cm)",
                    placeholder: "20",
                    min: "1cm",
                    max: "150cm",
                  },
                  {
                    id: "length",
                    label: "Largo (cm)",
                    placeholder: "30",
                    min: "1cm",
                    max: "150cm",
                  },
                ].map(({ id, label, placeholder, min, max }) => (
                  <div key={id}>
                    <label
                      htmlFor={id}
                      className="block text-xs sm:text-sm font-medium mb-2"
                    >
                      <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-2" />
                      {label}
                    </label>
                    <Input
                      id={id}
                      type="number"
                      {...register(id as "weight" | "height" | "width" | "length")}
                      placeholder={placeholder}
                      className={
                        errors[id as keyof typeof errors] ? "border-error" : ""
                      }
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mín: {min} • Máx: {max}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg mb-6">
                <p className="text-sm text-warning flex items-start gap-2">
                  <Info className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <span>
                    <strong>Importante:</strong> Las dimensiones correctas
                    (Peso, Alto, Ancho, Largo) son esenciales para calcular el
                    costo de envío. Si no se especifican, se usarán valores por
                    defecto.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vista Previa */}
          <Card className="shadow-xl border-0">
            <CardHeader className="border-b bg-surface-secondary p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2 text-foreground">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                Vista Previa del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <ProductPreview
                images={productImages}
                name={watch("name")}
                category={
                  categories.find((c) => c.id === watch("categoryId"))?.name
                }
                description={watch("description")}
                price={Number(watch("price") || 0)}
                salePrice={calculatedSalePrice}
                discountPercentage={watchDiscountPercentage}
                onSale={isOnSale}
                stock={totalVariantStock}
                features={features}
                sizes={sizes}
                colors={colors}
                colorImages={colorImages}
              />
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-8 border-t border-muted">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="bg-surface/90 backdrop-blur-sm shadow-md hover:bg-surface-secondary flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {action}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
