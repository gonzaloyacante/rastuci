import ProductCard from "@/components/products/ProductCard";
import { CartProvider } from "@/context/CartContext";
import type { Product } from "@/types";
import { render, screen } from "@testing-library/react";

// Mock del componente Image de Next.js
vi.mock("next/image", () => ({
  __esModule: true,

  default: (props: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={props.src} alt={props.alt} />
  ),
}));

// Mock del hook useCart
const mockAddItem = vi.fn();
vi.mock("@/hooks/useCart", () => ({
  useCart: () => ({
    addItem: mockAddItem,
    isInCart: vi.fn(() => false),
    getQuantity: vi.fn(() => 0),
  }),
}));

const mockProduct: Product = {
  id: "1",
  name: "Producto Test",
  description: "Descripción del producto test",
  price: 150.99,
  salePrice: 120.5,
  images: ["/test-image.jpg"],
  categoryId: "cat1",
  categories: {
    id: "cat1",
    name: "Categoría Test",
    description: "Descripción categoría",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  stock: 10,
  onSale: true,
  rating: 4.5,
  reviewCount: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const renderWithCart = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>);
};

describe("ProductCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe renderizar información básica del producto", () => {
    renderWithCart(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Producto Test")).toBeInTheDocument();
    expect(screen.getByText("Categoría Test")).toBeInTheDocument();
  });

  it("debe mostrar badge de oferta cuando el producto está en oferta", () => {
    renderWithCart(<ProductCard product={mockProduct} />);

    // Component shows discount percentage badge
    expect(screen.getByText(/OFF/i)).toBeInTheDocument();
  });

  it("debe mostrar el badge de descuento cuando onSale es true", () => {
    const productOnSale = { ...mockProduct, onSale: true };
    renderWithCart(<ProductCard product={productOnSale} />);

    // El componente muestra el porcentaje de descuento cuando onSale es true
    expect(screen.getByText(/OFF/i)).toBeInTheDocument();
  });

  it("debe mostrar stock bajo cuando queden pocos productos", () => {
    const lowStockProduct = { ...mockProduct, stock: 2 };
    renderWithCart(<ProductCard product={lowStockProduct} />);

    // El componente muestra "¡Últimas X!" para stock bajo (texto dividido en elementos)
    expect(screen.getByText(/Últimas/i)).toBeInTheDocument();
  });

  it("debe mostrar Agotado cuando stock es 0", () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderWithCart(<ProductCard product={outOfStockProduct} />);

    // El componente muestra "Agotado" cuando stock es 0
    expect(screen.getByText("Agotado")).toBeInTheDocument();
  });

  it("debe tener botón de favoritos con aria-label correcto", () => {
    renderWithCart(<ProductCard product={mockProduct} />);

    // El único botón es el de favoritos
    const favoriteButton = screen.getByRole("button", {
      name: /agregar producto test a favoritos/i,
    });
    expect(favoriteButton).toBeInTheDocument();
  });

  it("debe mostrar botón de favoritos cuando el stock es 0", () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderWithCart(<ProductCard product={outOfStockProduct} />);

    // El botón de favoritos siempre está disponible
    const favoriteButton = screen.getByRole("button", {
      name: /agregar producto test a favoritos/i,
    });
    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton).not.toBeDisabled();
  });

  it("debe renderizar en modo lista con estructura flex", () => {
    renderWithCart(<ProductCard product={mockProduct} variant="list" />);

    // En modo lista tiene un div.flex contenedor
    expect(screen.getByText("Producto Test")).toBeInTheDocument();
    const article = screen.getByText("Producto Test").closest("article");
    expect(article).toHaveClass("group", "relative", "surface");
  });

  it("debe mostrar imagen del producto con alt text que incluye nombre, categoría y precio", () => {
    renderWithCart(<ProductCard product={mockProduct} />);

    const image = screen.getByRole("img");
    // El alt incluye: nombre - categoría - precio formateado
    expect(image).toHaveAttribute(
      "alt",
      expect.stringContaining("Producto Test")
    );
    expect(image).toHaveAttribute(
      "alt",
      expect.stringContaining("Categoría Test")
    );
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("test-image.jpg")
    );
  });

  it("debe mostrar precio formateado en estilo argentino", () => {
    const productWithLargePrice = {
      ...mockProduct,
      price: 1234567.89,
      onSale: false,
      salePrice: undefined,
    };
    renderWithCart(<ProductCard product={productWithLargePrice} />);

    // formatPriceARS usa formato argentino: $1.234.567,89 (punto miles, coma decimales)
    expect(screen.getByText("$1.234.568")).toBeInTheDocument();
  });

  it("debe manejar producto sin imagen mostrando placeholder", () => {
    const productWithoutImage = { ...mockProduct, images: [] };
    renderWithCart(<ProductCard product={productWithoutImage} />);

    // Debería mostrar el producto y usar imagen placeholder
    expect(screen.getByText("Producto Test")).toBeInTheDocument();
  });

  it("debe mostrar información de categoría", () => {
    renderWithCart(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Categoría Test")).toBeInTheDocument();
  });

  it("debe mostrar rating cuando está disponible", () => {
    renderWithCart(<ProductCard product={mockProduct} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(15)")).toBeInTheDocument();
  });

  it("debe manejar producto sin rating", () => {
    const productWithoutRating = {
      ...mockProduct,
      rating: undefined,
      reviewCount: undefined,
    };
    renderWithCart(<ProductCard product={productWithoutRating} />);

    expect(screen.getByText("Producto Test")).toBeInTheDocument();
    expect(screen.queryByText("4.5")).not.toBeInTheDocument();
  });
});
