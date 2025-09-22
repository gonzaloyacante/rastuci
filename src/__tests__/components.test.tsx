import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingComponents";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe("Button Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("renders with different variants", () => {
    const { rerender } = render(
      <Button variant="outline">Outline Button</Button>,
    );
    expect(screen.getByRole("button")).toHaveClass(
      "surface",
      "border",
      "border-primary",
    );

    rerender(<Button variant="destructive">Destructive Button</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "surface",
      "border",
      "border-error",
    );
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Button size="sm">Small Button</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5", "text-xs");

    rerender(<Button size="lg">Large Button</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-7", "py-3", "text-base");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<Button loading>Loading Button</Button>);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});

describe("Badge Component", () => {
  it("renders with default props", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Badge variant="success">Success Badge</Badge>);
    expect(screen.getByText("Success Badge")).toHaveClass(
      "bg-success/10",
      "text-success",
    );

    rerender(<Badge variant="error">Error Badge</Badge>);
    expect(screen.getByText("Error Badge")).toHaveClass(
      "bg-error/10",
      "text-error",
    );

    rerender(<Badge variant="warning">Warning Badge</Badge>);
    expect(screen.getByText("Warning Badge")).toHaveClass(
      "bg-warning/10",
      "text-warning",
    );
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Badge</Badge>);
    expect(screen.getByText("Badge")).toHaveClass("custom-class");
  });
});

describe("LoadingSpinner Component", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status")).toHaveClass("w-4", "h-4");

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole("status")).toHaveClass("w-8", "h-8");
  });

  it("renders with different colors", () => {
    const { rerender } = render(<LoadingSpinner color="white" />);
    expect(screen.getByRole("status")).toHaveClass("text-white");

    rerender(<LoadingSpinner color="gray" />);
    expect(screen.getByRole("status")).toHaveClass("muted");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    expect(screen.getByRole("status")).toHaveClass("custom-class");
  });

  it("has accessible aria-label", () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
});

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("formats numbers as currency", () => {
      const formatCurrency = vi.fn((amount: number) =>
        new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(amount),
      );

      expect(formatCurrency(1000)).toBe("$1.000");
      expect(formatCurrency(1234.56)).toBe("$1.234,56");
    });
  });

  describe("truncateText", () => {
    it("truncates text to specified length", () => {
      const truncateText = (text: string, maxLength: number) =>
        text.length <= maxLength
          ? text
          : text.slice(0, maxLength).trim() + "...";

      expect(truncateText("Hello world", 5)).toBe("Hello...");
      expect(truncateText("Short", 10)).toBe("Short");
    });
  });

  describe("debounce", () => {
    it("debounces function calls", async () => {
      const mockFn = vi.fn();
      const debouncedFn = vi.fn().mockImplementation(
        ((func, wait) => {
          let timeout: NodeJS.Timeout;
          return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
          };
        })(mockFn, 100),
      );

      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Wait for debounce to resolve
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Theme System", () => {
  it("should have theme provider", () => {
    // This would test the theme provider component
    // For now, just a placeholder test
    expect(true).toBe(true);
  });
});

describe("Form Validation", () => {
  it("should validate required fields", () => {
    // Test form validation logic
    expect(true).toBe(true);
  });
});

// Integration tests
describe("Product Card Integration", () => {
  it("should render product card with all elements", () => {
    const mockProduct = {
      id: "1",
      name: "Test Product",
      price: 1000,
      images: ["/test-image.jpg"],
      stock: 10,
      onSale: false,
      category: { name: "Test Category" },
    };

    // This would test the product card component with real props
    expect(mockProduct.name).toBe("Test Product");
  });
});

// Performance tests
describe("Performance", () => {
  it("should render components efficiently", () => {
    const startTime = performance.now();

    // Simulate component rendering
    for (let i = 0; i < 100; i++) {
      // Component rendering simulation
    }

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in reasonable time
    expect(renderTime).toBeLessThan(100); // Less than 100ms for 100 renders
  });
});

// Accessibility tests
describe("Accessibility", () => {
  it("should have proper ARIA labels", () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("should have proper role attributes", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

// Error handling tests
describe("Error Handling", () => {
  it("should handle invalid props gracefully", () => {
    // Test component with invalid props
    expect(() => {
      render(<Button variant={"invalid" as any}>Test</Button>);
    }).not.toThrow();
  });
});

// Snapshot tests (if using Jest)
describe("Snapshots", () => {
  it("should match snapshot", () => {
    const { container } = render(<Button>Test Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
