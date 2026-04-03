"use client";

import {
  Filter,
  Grid3X3,
  Heart,
  List,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { ShareWishlistModal } from "@/components/wishlist/ShareModal";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPriceARS } from "@/utils/formatters";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc";
type ViewMode = "grid" | "list";

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
};

interface FavoriteItemProps {
  item: WishlistItem;
  onAddToCart: (item: WishlistItem) => void;
  onRemove: (id: string, name: string) => void;
}

function FavoriteGridItem({ item, onAddToCart, onRemove }: FavoriteItemProps) {
  return (
    <div className="surface rounded-lg border border-muted overflow-hidden group hover:shadow-md transition-all duration-200">
      <div className="relative aspect-square">
        <OptimizedImage
          src={item.image}
          alt={item.name}
          width={500}
          height={500}
          className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id, item.name)}
            className="p-2 surface rounded-full shadow-sm text-error hover:bg-error hover:text-white"
            title="Quitar de favoritos"
          >
            <Heart className="w-4 h-4 fill-current" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="text-xs surface px-2 py-1 rounded text-primary shadow-sm">
            {new Date(item.addedAt).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </div>
      <div className="p-4">
        <Link href={`/productos/${item.id}`}>
          <h2 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
            {item.name}
          </h2>
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
            onClick={() => onAddToCart(item)}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver opciones
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(item.id, item.name)}
            className="px-3 text-error border-error hover:bg-error hover:text-white"
            title="Quitar de favoritos"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FavoriteListItem({ item, onAddToCart, onRemove }: FavoriteItemProps) {
  return (
    <div className="surface rounded-lg border border-muted p-6 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-48 aspect-square md:aspect-square shrink-0">
          <OptimizedImage
            src={item.image}
            alt={item.name}
            width={200}
            height={200}
            className="object-cover rounded-lg w-full h-full"
            sizes="(max-width: 768px) 100vw, 192px"
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <Link href={`/productos/${item.id}`}>
              <h2 className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer mb-2">
                {item.name}
              </h2>
            </Link>
            <p className="text-sm muted">
              Agregado el{" "}
              {new Date(item.addedAt).toLocaleDateString("es-AR", {
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
                onClick={() => onAddToCart(item)}
                className="flex-1 sm:flex-none"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Agregar al carrito
              </Button>
              <Button
                variant="outline"
                onClick={() => onRemove(item.id, item.name)}
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
  );
}

const SORT_OPTIONS = [
  { value: "date-desc", label: "📅 Agregados recientemente" },
  { value: "date-asc", label: "📅 Más antiguos" },
  { value: "name-asc", label: "🔤 Nombre: A-Z" },
  { value: "name-desc", label: "🔤 Nombre: Z-A" },
  { value: "price-asc", label: "💰 Precio: menor a mayor" },
  { value: "price-desc", label: "💎 Precio: mayor a menor" },
];

function sortItems(items: WishlistItem[], sortBy: SortOption): WishlistItem[] {
  return [...items].sort((a, b) => {
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
}

function FavoritesLoadingState() {
  return (
    <div className="min-h-screen surface">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="muted">Cargando favoritos...</p>
        </div>
      </div>
    </div>
  );
}

function FavoritesEmptyState() {
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

interface FavoritesControlsProps {
  sortBy: SortOption;
  viewMode: ViewMode;
  showFilters: boolean;
  onSortChange: (value: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleFilters: () => void;
  onClearWishlist: () => void;
}

function FavoritesControls({
  sortBy,
  viewMode,
  showFilters,
  onSortChange,
  onViewModeChange,
  onToggleFilters,
  onClearWishlist,
}: FavoritesControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="flex-1 max-w-xs">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-4 py-2 border border-muted rounded-lg surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="sm:hidden"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Ocultar" : "Filtros"}
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <ShareWishlistModal />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 mr-4">
          <Button
            onClick={() => onViewModeChange("grid")}
            variant="ghost"
            className={`p-2 rounded-lg h-auto ${viewMode === "grid" ? "bg-primary text-white hover:bg-primary/90 hover:text-white" : "surface muted hover:text-primary"}`}
            title="Vista en cuadrícula"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onViewModeChange("list")}
            variant="ghost"
            className={`p-2 rounded-lg h-auto ${viewMode === "list" ? "bg-primary text-white hover:bg-primary/90 hover:text-white" : "surface muted hover:text-primary"}`}
            title="Vista en lista"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={onClearWishlist}
          className="text-error border-error hover:bg-error hover:text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpiar lista
        </Button>
      </div>
    </div>
  );
}

export default function FavoritosPageClient() {
  const { show } = useToast();
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoaded } =
    useWishlist();
  const { addToCart: _addToCart } = useCart();

  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const router = useRouter();

  const handleAddToCart = (item: (typeof wishlistItems)[0]) => {
    // Para evitar variants falsos ("M", "Sin color") que rompen el checkout,
    // redirigimos al usuario a la página del producto para que elija opciones.
    router.push(`/productos/${item.id}`);
  };

  const handleRemoveFromWishlist = (id: string, name: string) => {
    removeFromWishlist(id);
    show({ type: "success", message: `${name} eliminado de favoritos` });
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
      show({ type: "success", message: "Lista de favoritos limpiada" });
    }
  };

  const sortedItems = sortItems(wishlistItems as WishlistItem[], sortBy);

  // Show loading state while wishlist is being loaded from localStorage
  if (!isLoaded) {
    return <FavoritesLoadingState />;
  }

  if (wishlistItems.length === 0) {
    return <FavoritesEmptyState />;
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
        <FavoritesControls
          sortBy={sortBy}
          viewMode={viewMode}
          showFilters={showFilters}
          onSortChange={setSortBy}
          onViewModeChange={setViewMode}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearWishlist={handleClearWishlist}
        />

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
              <FavoriteGridItem
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onRemove={handleRemoveFromWishlist}
              />
            ) : (
              <FavoriteListItem
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onRemove={handleRemoveFromWishlist}
              />
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
