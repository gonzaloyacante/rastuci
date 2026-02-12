import { prisma } from "@/lib/prisma";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatPriceARS } from "@/utils/formatters";
import { ShoppingCart } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: { token: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Lista de Deseos Compartida - Rastuci",
    description: "Mira los productos favoritos que han compartido contigo.",
    robots: "noindex, nofollow",
  };
}

async function getSharedWishlist(token: string) {
  try {
    const wishlist = await prisma.shared_wishlists.findUnique({
      where: { token },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            onSale: true,
            salePrice: true,
            categories: { select: { name: true } },
          },
        },
      },
    });

    if (!wishlist) return null;
    if (wishlist.expiresAt && new Date() > wishlist.expiresAt) return null;

    return wishlist;
  } catch (error) {
    console.error("Error fetching shared wishlist:", error);
    return null;
  }
}

export default async function SharedWishlistPage({ params }: Props) {
  const wishlist = await getSharedWishlist(params.token);

  if (!wishlist) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Lista de Deseos Compartida
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Alguien ha compartido esta selección de productos contigo.
            Disponibles por tiempo limitado hasta el{" "}
            {wishlist.expiresAt?.toLocaleDateString()}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <OptimizedImage
                  src={product.images[0] || "/placeholder.png"}
                  alt={product.name}
                  width={400}
                  height={500}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                {product.onSale && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    OFERTA
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                    {product.categories?.name}
                  </p>
                  <Link href={`/productos/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-primary">
                      {formatPriceARS(
                        product.onSale && product.salePrice
                          ? Number(product.salePrice)
                          : Number(product.price)
                      )}
                    </span>
                    {product.onSale && product.salePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPriceARS(Number(product.price))}
                      </span>
                    )}
                  </div>
                </div>

                <Link href={`/productos/${product.id}`} className="w-full">
                  <Button
                    variant="hero"
                    className="w-full justify-center group-hover:translate-y-0 transition-transform"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ver Producto
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/productos">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Explorar todo el catálogo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
