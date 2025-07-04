"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share,
  Truck,
  Shield,
  RotateCcw,
  Loader,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { Product } from "@/types";

// Mock para productos relacionados, se mantendrá por ahora
const relatedProducts = [
  {
    id: "2",
    name: "Blusa de Encaje",
    price: 2199,
    image: "https://placehold.co/300x300/FCE4EC/333333?text=Blusa",
    category: "Niña",
  },
  {
    id: "3",
    name: "Falda Plisada",
    price: 1899,
    image: "https://placehold.co/300x300/FCE4EC/333333?text=Falda",
    category: "Niña",
  },
  {
    id: "4",
    name: "Conjunto Playero",
    price: 2599,
    image: "https://placehold.co/300x300/FCE4EC/333333?text=Conjunto",
    category: "Niña",
  },
  {
    id: "5",
    name: "Vestido de Fiesta",
    price: 3499,
    image: "https://placehold.co/300x300/FCE4EC/333333?text=Fiesta",
    category: "Niña",
  },
];

// Tipos para las propiedades del producto que no están en el modelo principal
interface ProductUIDetails {
  sizes: string[];
  colors: string[];
  features: string[];
}

const productUIDetails: { [key: string]: ProductUIDetails } = {
  "1": {
    sizes: ["2", "4", "6", "8", "10"],
    colors: ["Rosa", "Azul", "Amarillo"],
    features: [
      "100% Algodón orgánico",
      "Lavable en máquina",
      "Diseño cómodo y fresco",
      "Estampado que no se destiñe",
      "Botones de seguridad",
    ],
  },
};

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [uiDetails, setUiDetails] = useState<ProductUIDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const { addToCart } = useCart();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/products/${id}`);
          const data = await response.json();

          if (data.success) {
            // Parsear las imágenes si es un string JSON
            if (typeof data.data.images === "string") {
              data.data.images = JSON.parse(data.data.images);
            }
            setProduct(data.data);
            // Cargar detalles de UI (tallas, colores, etc.) basados en el ID
            // En una app real, esto también vendría del backend
            setUiDetails(productUIDetails[id] || productUIDetails["1"]);
          } else {
            setError(data.error || "No se pudo cargar el producto.");
          }
        } catch (err) {
          setError("Ocurrió un error al conectar con el servidor.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error("Por favor, selecciona una talla.");
      return;
    }
    if (!selectedColor) {
      toast.error("Por favor, selecciona un color.");
      return;
    }

    // Agregamos al carrito
    addToCart(product, quantity, selectedSize, selectedColor);

    // Mostramos confirmación
    toast.success(
      `${product.name} (Talla: ${selectedSize}, Color: ${selectedColor}) x${quantity} agregado al carrito!`,
      {
        duration: 3000,
        icon: "🛒",
        style: {
          borderRadius: "10px",
          background: "#F8F9FA",
          color: "#333",
          border: "1px solid #E91E63",
        },
      }
    );

    // Reseteamos los valores seleccionados para que el usuario pueda agregar otro producto fácilmente
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-[#E91E63]" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Link href="/productos">
          <Button>Volver a productos</Button>
        </Link>
      </div>
    );
  }

  if (!product || !uiDetails) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-xl mb-4">Producto no encontrado</p>
        <Link href="/productos">
          <Button>Volver a productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="bg-white text-[#333333] min-h-screen"
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Header currentPage="productos" />

      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/productos"
            className="inline-flex items-center text-[#666666] hover:text-[#E91E63] transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Volver a productos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-[#E91E63] ring-2 ring-[#E91E63] ring-opacity-50"
                      : "border-[#E0E0E0] hover:border-[#E91E63]"
                  }`}>
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-[#E91E63] font-semibold mb-2">
                {product.category?.name}
              </p>
              <h1
                className="text-3xl font-bold text-[#333333] mb-4"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-[#666666] ml-2">(4.8) • 127 reseñas</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span
                className="text-4xl font-bold text-[#E91E63]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                ${(product.price / 100).toFixed(2)}
              </span>
              <p className="text-[#4CAF50] font-semibold mt-1">
                o 3 cuotas sin interés de $
                {(product.price / 100 / 3).toFixed(2)}
              </p>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3
                className="font-bold text-lg mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Talla
              </h3>
              <div className="flex flex-wrap gap-3">
                {uiDetails.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                      selectedSize === size
                        ? "border-[#E91E63] bg-[#E91E63] text-white"
                        : "border-[#E0E0E0] hover:border-[#E91E63] text-[#333333]"
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3
                className="font-bold text-lg mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {uiDetails.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                      selectedColor === color
                        ? "border-[#E91E63] bg-[#E91E63] text-white"
                        : "border-[#E0E0E0] hover:border-[#E91E63] text-[#333333]"
                    }`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3
                className="font-bold text-lg mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Cantidad
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-10 h-10 rounded-lg border-2 border-[#E0E0E0] flex items-center justify-center hover:border-[#E91E63] transition-colors">
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    quantity < product.stock && setQuantity(quantity + 1)
                  }
                  className="w-10 h-10 rounded-lg border-2 border-[#E0E0E0] flex items-center justify-center hover:border-[#E91E63] transition-colors">
                  +
                </button>
                <span className="text-[#666666] ml-4">
                  Stock disponible: {product.stock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-[#E91E63] text-white hover:bg-[#C2185B] h-14 text-lg font-semibold">
                <ShoppingCart size={20} className="mr-2" />
                Agregar al Carrito
              </Button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  isLiked
                    ? "border-[#E91E63] bg-[#E91E63] text-white"
                    : "border-[#E0E0E0] hover:border-[#E91E63] text-[#333333]"
                }`}>
                <Heart size={20} className={isLiked ? "fill-current" : ""} />
              </button>
              <button className="px-6 py-3 rounded-lg border-2 border-[#E0E0E0] hover:border-[#E91E63] text-[#333333] transition-all">
                <Share size={20} />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#FAFAFA] rounded-xl">
              <div className="flex items-center space-x-3">
                <Truck className="text-[#E91E63]" size={24} />
                <div>
                  <p className="font-semibold text-sm">Envío gratis</p>
                  <p className="text-xs text-[#666666]">A todo el país</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="text-[#E91E63]" size={24} />
                <div>
                  <p className="font-semibold text-sm">Cambios gratis</p>
                  <p className="text-xs text-[#666666]">30 días</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="text-[#E91E63]" size={24} />
                <div>
                  <p className="font-semibold text-sm">Compra segura</p>
                  <p className="text-xs text-[#666666]">100% protegida</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2
              className="text-2xl font-bold text-[#333333] mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Descripción
            </h2>
            <p className="text-[#666666] leading-relaxed mb-6">
              {product.description}
            </p>

            <h3
              className="text-xl font-bold text-[#333333] mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Características
            </h3>
            <ul className="space-y-2">
              {uiDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center text-[#666666]">
                  <div className="w-2 h-2 bg-[#E91E63] rounded-full mr-3"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2
              className="text-2xl font-bold text-[#333333] mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Guía de Tallas
            </h2>
            <Card className="bg-[#FAFAFA] border-0">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E0E0E0]">
                        <th className="text-left py-2">Talla</th>
                        <th className="text-left py-2">Edad</th>
                        <th className="text-left py-2">Altura (cm)</th>
                        <th className="text-left py-2">Pecho (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#666666]">
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-2 font-semibold">2</td>
                        <td className="py-2">2 años</td>
                        <td className="py-2">92</td>
                        <td className="py-2">53</td>
                      </tr>
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-2 font-semibold">4</td>
                        <td className="py-2">4 años</td>
                        <td className="py-2">104</td>
                        <td className="py-2">56</td>
                      </tr>
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-2 font-semibold">6</td>
                        <td className="py-2">6 años</td>
                        <td className="py-2">116</td>
                        <td className="py-2">59</td>
                      </tr>
                      <tr className="border-b border-[#F0F0F0]">
                        <td className="py-2 font-semibold">8</td>
                        <td className="py-2">8 años</td>
                        <td className="py-2">128</td>
                        <td className="py-2">62</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">10</td>
                        <td className="py-2">10 años</td>
                        <td className="py-2">140</td>
                        <td className="py-2">65</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2
            className="text-3xl font-bold text-[#333333] text-center mb-8"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Productos Relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Card
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
                <Link href={`/productos/${item.id}`}>
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <CardContent className="p-4 text-center">
                  <h3
                    className="font-semibold text-lg text-[#333333] mb-2"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-[#757575] mb-2">{item.category}</p>
                  <p className="text-xl font-bold text-[#E91E63] mb-3">
                    ${(item.price / 100).toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/productos/${item.id}`} className="flex-1">
                      <Button
                        size="sm"
                        className="w-full bg-transparent border border-[#E91E63] text-[#E91E63] hover:bg-[#FCE4EC] transition-all duration-300">
                        Ver Producto
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        // Creamos un objeto compatible con el tipo Product para añadirlo al carrito
                        const simpleProduct = {
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          images: [item.image],
                          category: {
                            name: item.category,
                            id: "0",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                          },
                          categoryId: "0",
                          stock: 10,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        };
                        // Añadimos al carrito con valores predeterminados
                        addToCart(simpleProduct, 1, "Única", "Único");
                        toast.success(`${item.name} añadido al carrito!`, {
                          duration: 3000,
                          icon: "🛒",
                          style: {
                            borderRadius: "10px",
                            background: "#F8F9FA",
                            color: "#333",
                            border: "1px solid #E91E63",
                          },
                        });
                      }}
                      className="bg-[#E91E63] text-white hover:bg-[#C2185B] transition-all duration-300">
                      <ShoppingCart size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
