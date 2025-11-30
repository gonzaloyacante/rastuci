"use client";

import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";
import {
  Filter,
  Grid3X3,
  Heart,
  List,
  Loader2,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc";
type ViewMode = "grid" | "list";

export default function FavoritosPageClient() {
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoaded } =
    useWishlist();
  const { addToCart } = useCart();

  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleAddToCart = (item: (typeof wishlistItems)[0]) => {
    // Convert wishlist item to product format for addToCart
    const product: Product = {
      id: item.id,
      name: item.name,
      price: item.price,
      images: [item.image],
      description: "",
      categoryId: "default",
      stock: 1,
      onSale: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addToCart(product, 1, "M", "Sin color");
    toast.success("Producto agregado al carrito");
  };

  const handleRemoveFromWishlist = (id: string, name: string) => {
    removeFromWishlist(id);
    toast.success(`${name} eliminado de favoritos`);
  };

  const handleClearWishlist = async () => {
    const confirmed = await confirm({
      title: "Limpiar favoritos",
      message:
        "¿Estás seguro de que quieres eliminar todos los favoritos? Esta acción no se puede deshacer.",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      clearWishlist();
      toast.success("Lista de favoritos limpiada");
    }
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "date-asc":
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case "date-desc":
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: "date-desc", label: "📅 Agregados recientemente" },
    { value: "date-asc", label: "📅 Más antiguos" },
    { value: "name-asc", label: "🔤 Nombre: A-Z" },
    { value: "name-desc", label: "🔤 Nombre: Z-A" },
    { value: "price-asc", label: "💰 Precio: menor a mayor" },
    { value: "price-desc", label: "💎 Precio: mayor a menor" },
  ];

  // Show loading state while wishlist is being loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen surface">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="muted">Cargando favoritos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen surface">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 surface rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 muted" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-4">
              Tu lista de favoritos está vacía
            </h1>
            <p className="muted mb-8 max-w-md mx-auto leading-relaxed">
              Agrega productos a tu lista de favoritos haciendo clic en el ícono
              ❤️ para verlos aquí más tarde.
            </p>
            <Link href="/productos">
              <Button variant="hero" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Explorar productos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Mis Favoritos
          </h1>
          <p className="muted">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1
              ? "producto favorito"
              : "productos favoritos"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Filtros y ordenamiento */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-xs">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-muted rounded-lg surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* View mode y acciones */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 mr-4">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary text-white" : "surface muted hover:text-primary"}`}
                title="Vista en cuadrícula"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary text-white" : "surface muted hover:text-primary"}`}
                title="Vista en lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="outline"
              onClick={handleClearWishlist}
              className="text-error border-error hover:bg-error hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar lista
            </Button>
          </div>
        </div>

        {/* Products Grid/List */}
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }`}
        >
          {sortedItems.map((item) =>
            viewMode === "grid" ? (
              // Grid View
              <div
                key={item.id}
                className="surface rounded-lg border border-muted overflow-hidden group hover:shadow-md transition-all duration-200"
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />

                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveFromWishlist(item.id, item.name)
                      }
                      className="p-2 surface rounded-full shadow-sm text-error hover:bg-error hover:text-white"
                      title="Quitar de favoritos"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>

                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs surface px-2 py-1 rounded text-primary shadow-sm">
                      {new Date(item.addedAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <Link href={`/productos/${item.id}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-primary">
                      {formatPriceARS(item.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="flex-1"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Al carrito
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRemoveFromWishlist(item.id, item.name)
                      }
                      className="px-3 text-error border-error hover:bg-error hover:text-white"
                      title="Quitar de favoritos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <div
                key={item.id}
                className="surface rounded-lg border border-muted p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative w-full md:w-48 aspect-square md:aspect-square shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 192px"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <Link href={`/productos/${item.id}`}>
                        <h3 className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer mb-2">
                          {item.name}
                        </h3>
                      </Link>

                      <p className="text-sm muted">
                        Agregado el{" "}
                        {new Date(item.addedAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-2xl font-bold text-primary">
                        {formatPriceARS(item.price)}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="hero"
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 sm:flex-none"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Agregar al carrito
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            handleRemoveFromWishlist(item.id, item.name)
                          }
                          className="text-error border-error hover:bg-error hover:text-white"
                          title="Quitar de favoritos"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Quitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Continue shopping */}
        <div className="text-center mt-12">
          <Link href="/productos">
            <Button variant="outline" size="lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Seguir comprando
            </Button>
          </Link>
        </div>
      </div>
      {ConfirmDialog}
    </div>
  );
}
