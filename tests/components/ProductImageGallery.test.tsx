/// <reference types="jest" />
import ProductImageGallery from "@/components/products/ProductImageGallery";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe("ProductImageGallery Component", () => {
  const mockImages = ["/image1.jpg", "/image2.jpg", "/image3.jpg"];

  const defaultProps = {
    images: mockImages,
    productName: "Test Product",
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with single image", () => {
    render(
      <ProductImageGallery
        images={["/single.jpg"]}
        productName="Single Product"
      />
    );

    expect(
      screen.getByRole("region", {
        name: /galería de imágenes de single product/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Single Product - Imagen 1 de 1")
    ).toBeInTheDocument();
  });

  it("renders navigation controls for multiple images", () => {
    render(<ProductImageGallery {...defaultProps} />);

    expect(
      screen.getByLabelText(/imagen anterior de test product/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/imagen siguiente de test product/i)
    ).toBeInTheDocument();
  });

  it("navigates to next image on button click", () => {
    render(<ProductImageGallery {...defaultProps} />);

    const nextButton = screen.getByLabelText(
      /imagen siguiente de test product/i
    );
    fireEvent.click(nextButton);

    // Fast-forward time to complete transition (150ms delay + 50ms buffer)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(
      screen.getByAltText("Test Product - Imagen 2 de 3")
    ).toBeInTheDocument();
  });

  it("navigates to previous image on button click", () => {
    render(<ProductImageGallery {...defaultProps} />);

    const prevButton = screen.getByLabelText(
      /imagen anterior de test product/i
    );
    fireEvent.click(prevButton);

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should wrap to last image
    expect(
      screen.getByAltText("Test Product - Imagen 3 de 3")
    ).toBeInTheDocument();
  });

  it("handles keyboard navigation on controls", () => {
    render(<ProductImageGallery {...defaultProps} />);

    const nextButton = screen.getByLabelText(
      /imagen siguiente de test product/i
    );

    fireEvent.keyDown(nextButton, { key: "Enter" });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(
      screen.getByAltText("Test Product - Imagen 2 de 3")
    ).toBeInTheDocument();

    fireEvent.keyDown(nextButton, { key: " " });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(
      screen.getByAltText("Test Product - Imagen 3 de 3")
    ).toBeInTheDocument();
  });

  it("selects thumbnail on click", () => {
    render(<ProductImageGallery {...defaultProps} />);

    const thumbnails = screen.getAllByRole("button", {
      name: /seleccionar imagen/i,
    });
    fireEvent.click(thumbnails[2]);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(
      screen.getByAltText("Test Product - Imagen 3 de 3")
    ).toBeInTheDocument();
  });

  it("handles keyboard navigation on thumbnails", () => {
    render(<ProductImageGallery {...defaultProps} />);

    const thumbnails = screen.getAllByRole("button", {
      name: /seleccionar imagen/i,
    });

    fireEvent.keyDown(thumbnails[1], { key: "Enter" });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(
      screen.getByAltText("Test Product - Imagen 2 de 3")
    ).toBeInTheDocument();
  });

  it("shows correct aria-current for selected thumbnail", () => {
    render(<ProductImageGallery {...defaultProps} />);

    const thumbnails = screen.getAllByRole("button", {
      name: /seleccionar imagen/i,
    });
    expect(thumbnails[0]).toHaveAttribute("aria-current", "true");
    expect(thumbnails[1]).toHaveAttribute("aria-current", "false");
  });

  it("handles empty images array gracefully", () => {
    render(<ProductImageGallery images={[]} productName="Empty Product" />);

    expect(
      screen.getByText(/no hay imágenes disponibles/i)
    ).toBeInTheDocument();
  });

  it("applies correct accessibility attributes", () => {
    render(<ProductImageGallery {...defaultProps} />);

    const gallery = screen.getByRole("region");
    expect(gallery).toHaveAttribute(
      "aria-label",
      "Galería de imágenes de Test Product"
    );

    const thumbnailList = screen.getByRole("list", {
      name: /miniaturas de imágenes/i,
    });
    expect(thumbnailList).toBeInTheDocument();
  });
});
