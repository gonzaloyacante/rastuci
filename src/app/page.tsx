import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Truck, CreditCard, ShieldCheck } from "lucide-react";

// --- Mock Data ---
const heroSlides = [
  {
    id: 1,
    title: "Nueva Colección Verano",
    subtitle: "Frescura y estilo para los más peques",
    imageUrl:
      "https://placehold.co/1200x600/FCE4EC/333333?text=Nueva+Colección",
    link: "/productos?collection=verano",
  },
  {
    id: 2,
    title: "¡Ofertas Imperdibles!",
    subtitle: "Hasta 30% de descuento en prendas seleccionadas",
    imageUrl: "https://placehold.co/1200x600/E91E63/FFFFFF?text=OFERTAS",
    link: "/productos?filter=ofertas",
  },
];

const featuredProducts = [
  {
    id: 1,
    name: "Vestido Floral de Verano",
    price: 29.99,
    imageUrl: "https://placehold.co/300x300/FAFAFA/333333?text=Vestido",
    category: "Niña",
  },
  {
    id: 2,
    name: "Camiseta de Dinosaurio",
    price: 15.99,
    imageUrl: "https://placehold.co/300x300/FAFAFA/333333?text=Camiseta",
    category: "Niño",
  },
  {
    id: 3,
    name: "Conjunto de Algodón para Bebé",
    price: 25.99,
    imageUrl: "https://placehold.co/300x300/FAFAFA/333333?text=Conjunto",
    category: "Bebé",
  },
  {
    id: 4,
    name: "Shorts de Jean",
    price: 19.99,
    imageUrl: "https://placehold.co/300x300/FAFAFA/333333?text=Shorts",
    category: "Niño",
  },
];

// --- Tipos ---
type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
};

const categories = [
  {
    name: "Niña",
    imageUrl: "https://placehold.co/400x500/FCE4EC/333333?text=Niña",
    link: "/productos?category=nina",
  },
  {
    name: "Niño",
    imageUrl: "https://placehold.co/400x500/E0F7FA/333333?text=Niño",
    link: "/productos?category=nino",
  },
  {
    name: "Bebé",
    imageUrl: "https://placehold.co/400x500/FFF9C4/333333?text=Bebé",
    link: "/productos?category=bebe",
  },
];

// --- Componente de Tarjeta de Producto ---
function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="bg-[#FAFAFA] rounded-xl shadow-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
      <Link href={`/productos/${product.id}`}>
        <div className="relative aspect-square bg-white">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4 text-center">
          <h3
            className="font-semibold text-lg text-[#333333]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-[#E91E63] mt-2">
            ${product.price.toFixed(2)}
          </p>
          <Button className="mt-4 bg-[#E91E63] text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-[#C2185B] transition-all duration-300 transform hover:scale-105">
            Ver más
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}

export default function Home() {
  return (
    <div
      className="bg-white text-[#333333]"
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Header currentPage="inicio" />

      <main>
        {/* Hero Section */}
        <section className="w-full">
          {/* Idealmente, aquí se usaría un componente de carrusel funcional */}
          <div className="relative h-[400px] md:h-[600px] bg-gray-200">
            <Image
              src={heroSlides[0].imageUrl}
              alt={heroSlides[0].title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center text-white p-4">
              <h1
                className="text-4xl md:text-6xl font-bold"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {heroSlides[0].title}
              </h1>
              <p className="text-lg md:text-xl mt-4 max-w-2xl">
                {heroSlides[0].subtitle}
              </p>
              <Button className="mt-8 bg-[#E91E63] text-white uppercase font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-[#C2185B] transition-all duration-300 transform hover:scale-105">
                <Link href={heroSlides[0].link}>Ver Colección</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-6 max-w-[1200px] mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-10"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Nuestras Categorías
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                href={category.link}
                key={category.name}
                className="relative rounded-xl overflow-hidden group shadow-lg">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={400}
                  height={500}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3
                    className="text-white text-3xl font-bold"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-[#FAFAFA] py-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2
              className="text-3xl font-bold text-center mb-10"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Productos Destacados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="bg-[#FCE4EC] py-12 px-6">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Truck size={48} className="text-[#E91E63] mb-3" />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Envíos a todo el país
              </h3>
              <p className="text-sm text-[#757575]">
                Recibí tu compra donde quieras.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CreditCard size={48} className="text-[#E91E63] mb-3" />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                3 Cuotas sin interés
              </h3>
              <p className="text-sm text-[#757575]">
                Con todas las tarjetas de crédito.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck size={48} className="text-[#E91E63] mb-3" />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Compra Segura
              </h3>
              <p className="text-sm text-[#757575]">
                Tus datos siempre protegidos.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
