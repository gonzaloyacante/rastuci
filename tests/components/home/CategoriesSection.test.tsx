import { CategoriesSection } from "@/components/home/CategoriesSection";
import type { Category } from "@/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock CategoryIcon
vi.mock("@/components/ui/CategoryIcon", () => ({
  default: ({ categoryName }: { categoryName: string }) => (
    <span data-testid="category-icon">{categoryName}</span>
  ),
}));

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electrónica",
    description: "Productos electrónicos",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Ropa",
    description: "Indumentaria y accesorios",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Hogar",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("CategoriesSection", () => {
  it("debe renderizar el título de la sección", () => {
    render(<CategoriesSection categories={mockCategories} />);

    expect(screen.getByText("Nuestras Categorías")).toBeInTheDocument();
  });

  it("debe renderizar todas las categorías", () => {
    render(<CategoriesSection categories={mockCategories} />);

    // Cada categoría aparece 2 veces: en el icono mock y en el título
    const electronica = screen.getAllByText("Electrónica");
    const ropa = screen.getAllByText("Ropa");
    const hogar = screen.getAllByText("Hogar");

    expect(electronica.length).toBeGreaterThan(0);
    expect(ropa.length).toBeGreaterThan(0);
    expect(hogar.length).toBeGreaterThan(0);
  });

  it("debe renderizar descripciones cuando existen", () => {
    render(<CategoriesSection categories={mockCategories} />);

    expect(screen.getByText("Productos electrónicos")).toBeInTheDocument();
    expect(screen.getByText("Indumentaria y accesorios")).toBeInTheDocument();
  });

  it("debe renderizar links correctos para cada categoría", () => {
    render(<CategoriesSection categories={mockCategories} />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/productos?categoryId=1");
    expect(links[1]).toHaveAttribute("href", "/productos?categoryId=2");
    expect(links[2]).toHaveAttribute("href", "/productos?categoryId=3");
  });

  it("debe tener aria-labels descriptivos", () => {
    render(<CategoriesSection categories={mockCategories} />);

    expect(
      screen.getByLabelText("Ver productos de la categoría Electrónica")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ver productos de la categoría Ropa")
    ).toBeInTheDocument();
  });

  it("debe renderizar iconos para cada categoría", () => {
    render(<CategoriesSection categories={mockCategories} />);

    const icons = screen.getAllByTestId("category-icon");
    expect(icons).toHaveLength(3);
  });

  it('debe renderizar texto "Ver" en cada card', () => {
    render(<CategoriesSection categories={mockCategories} />);

    const verTexts = screen.getAllByText("Ver");
    expect(verTexts).toHaveLength(3);
  });

  it("no debe renderizar nada cuando no hay categorías", () => {
    render(<CategoriesSection categories={[]} />);

    // Si no hay categorías, el componente retorna null, por lo que no debe haber título
    expect(screen.queryByText("Nuestras Categorías")).not.toBeInTheDocument();

    // Pero no debe haber cards de categorías
    const links = screen.queryByRole("link");
    expect(links).toBeNull();
  });

  it("debe renderizar skeletons durante la carga", () => {
    const { container } = render(
      <CategoriesSection categories={[]} loading={true} />
    );

    // Debe mostrar el título
    expect(screen.getByText("Nuestras Categorías")).toBeInTheDocument();

    // Debe renderizar 8 skeletons (usando querySelector para verificar estructura)
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });

  it("debe usar título personalizado de home settings", () => {
    const homeSettings = {
      heroTitle: "Test",
      heroSubtitle: "Test",
      ctaPrimaryLabel: "Test",
      ctaSecondaryLabel: "Test",
      categoriesTitle: "Categorías Personalizadas",
      categoriesSubtitle: "Subtítulo de prueba",
      featuredTitle: "Test",
      featuredSubtitle: "Test",
      benefits: [],
    };

    render(
      <CategoriesSection categories={[]} loading={true} home={homeSettings} />
    );

    expect(screen.getByText("Categorías Personalizadas")).toBeInTheDocument();
  });

  it("debe tener el id correcto para navegación", () => {
    const { container } = render(
      <CategoriesSection categories={mockCategories} />
    );

    const section = container.querySelector("#categorias");
    expect(section).toBeInTheDocument();
  });

  it("debe manejar categorías sin descripción", () => {
    const categoryWithoutDesc: Category[] = [
      {
        id: "1",
        name: "TestCategory",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<CategoriesSection categories={categoryWithoutDesc} />);

    // Aparece 2 veces: icono + título
    const categoryText = screen.getAllByText("TestCategory");
    expect(categoryText.length).toBeGreaterThan(0);

    // No debe renderizar descripción si es null
    const { container } = render(
      <CategoriesSection categories={categoryWithoutDesc} />
    );
    const descriptions = container.querySelectorAll("p.hidden");
    // Si hay descripción null, no debe haber contenido en el párrafo o el párrafo no debe existir
    expect(descriptions.length).toBe(0);
  });

  it("debe aplicar clases responsive correctamente", () => {
    const { container } = render(
      <CategoriesSection categories={mockCategories} />
    );

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass(
      "grid-cols-2", // Updated to match component
      "md:grid-cols-3",
      "lg:grid-cols-4" // Updated to match component
    );
  });
});
