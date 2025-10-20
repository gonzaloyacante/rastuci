/// <reference types="jest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "@/components/Header";

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock cart context
const mockCartContext = {
  cartItems: [],
  getItemCount: jest.fn(() => 0),
  getCartTotal: jest.fn(() => 0),
};

jest.mock("@/context/CartContext", () => ({
  useCart: () => mockCartContext,
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock wishlist context
const mockWishlistContext = {
  getWishlistCount: jest.fn(() => 0),
};

jest.mock("@/context/WishlistContext", () => ({
  useWishlist: () => mockWishlistContext,
  WishlistProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe.skip("Header Component (skipped - legacy)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHeader = (currentPage = "inicio") => {
    return render(<Header currentPage={currentPage} />);
  };

  it("renders logo and navigation links", () => {
    renderHeader();

    expect(screen.getByText("Rastuci")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /navegación principal/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inicio/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /productos/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contacto/i })).toBeInTheDocument();
  });

  it("highlights current page in navigation", () => {
    renderHeader("productos");

    const productosLink = screen.getByRole("link", { name: /productos/i });
    expect(productosLink).toHaveAttribute("aria-current", "page");
    expect(productosLink).toHaveClass("text-primary");
  });

  it("opens mobile menu on button click", () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText(/abrir menú móvil/i);
    fireEvent.click(mobileMenuButton);

    expect(
      screen.getByRole("dialog", { name: /menú de navegación móvil/i }),
    ).toBeInTheDocument();
  });

  it("closes mobile menu on close button click", () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText(/abrir menú móvil/i);
    fireEvent.click(mobileMenuButton);

    const closeButton = screen.getByLabelText(/cerrar menú móvil/i);
    fireEvent.click(closeButton);

    expect(
      screen.queryByRole("dialog", { name: /menú de navegación móvil/i }),
    ).not.toBeInTheDocument();
  });

  it("closes mobile menu on overlay click", () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText(/abrir menú móvil/i);
    fireEvent.click(mobileMenuButton);

    const overlay = screen.getByRole("dialog").previousSibling as HTMLElement;
    fireEvent.click(overlay);

    expect(
      screen.queryByRole("dialog", { name: /menú de navegación móvil/i }),
    ).not.toBeInTheDocument();
  });

  it("opens search modal on search button click", () => {
    renderHeader();

    const searchButton = screen.getByLabelText(/buscar productos/i);
    fireEvent.click(searchButton);

    expect(
      screen.getByRole("dialog", { name: /buscar productos/i }),
    ).toBeInTheDocument();
  });

  it("handles search form submission", async () => {
    renderHeader();

    const searchButton = screen.getByLabelText(/buscar productos/i);
    fireEvent.click(searchButton);

    const searchInput = screen.getByLabelText(/término de búsqueda/i);
    const submitButton = screen.getByRole("button", { name: /buscar/i });

    fireEvent.change(searchInput, { target: { value: "test search" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/productos?search=test%20search");
    });
  });

  it("displays cart item count when items present", () => {
    mockCartContext.getItemCount.mockReturnValue(3);

    renderHeader();

    const cartLink = screen.getByLabelText(/ver carrito \(3 productos\)/i);
    expect(cartLink).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("handles keyboard navigation in mobile menu", () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText(/abrir menú móvil/i);
    fireEvent.click(mobileMenuButton);

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(5); // Inicio, Productos, Contacto, Favoritos, Carrito

    menuItems.forEach((item) => {
      expect(item).toHaveAttribute("role", "menuitem");
    });
  });

  it("closes search modal on escape key", () => {
    renderHeader();

    const searchButton = screen.getByLabelText(/buscar productos/i);
    fireEvent.click(searchButton);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", { name: /buscar productos/i }),
    ).not.toBeInTheDocument();
  });

  it("applies scroll styles when scrolled", () => {
    renderHeader();

    // Simulate scroll
    Object.defineProperty(window, "scrollY", { value: 50, writable: true });
    fireEvent.scroll(window);

    const header =
      screen.getByRole("banner") || document.querySelector("header");
    expect(header).toHaveClass("backdrop-blur-md", "shadow-lg");
  });
});
