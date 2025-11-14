import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import { CartProvider } from '@/context/CartContext';
import type { Product } from '@/types';

// Mock del componente Image de Next.js
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt: string; [key: string]: unknown }) => 
    <img src={props.src} alt={props.alt} />,
}));

// Mock del hook useCart
const mockAddItem = jest.fn();
jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    isInCart: jest.fn(() => false),
    getQuantity: jest.fn(() => 0),
  })
}));

const mockProduct: Product = {
  id: "1",
  name: "Producto Test",
  description: "Descripción del producto test",
  price: 150.99,
  salePrice: 120.50,
  images: ["test-image.jpg"],
  categoryId: "cat1",
  category: {
    id: "cat1",
    name: "Categoría Test",
    description: "Descripción categoría",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  stock: 10,
  onSale: true,
  rating: 4.5,
  reviewCount: 15,
  createdAt: new Date(),
  updatedAt: new Date()
};

const renderWithCart = (component: React.ReactElement) => {
  return render(
    <CartProvider>
      {component}
    </CartProvider>
  );
};

describe('ProductCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar información básica del producto', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Producto Test')).toBeInTheDocument();
    expect(screen.getByText('Descripción del producto test')).toBeInTheDocument();
  });

  it('debe mostrar precios correctamente cuando está en oferta', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    // Precio original tachado
    expect(screen.getByText('$150.99')).toBeInTheDocument();
    expect(screen.getByText('$150.99')).toHaveClass('line-through');
    
    // Precio de oferta
    expect(screen.getByText('$120.50')).toBeInTheDocument();
  });

  it('debe mostrar precio normal cuando no está en oferta', () => {
    const productNotOnSale = { ...mockProduct, onSale: false, salePrice: undefined };
    renderWithCart(<ProductCard product={productNotOnSale} />);
    
    expect(screen.getByText('$150.99')).toBeInTheDocument();
    expect(screen.queryByText('line-through')).not.toBeInTheDocument();
  });

  it('debe mostrar rating cuando está disponible', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(15 reseñas)')).toBeInTheDocument();
  });

  it('debe mostrar badge de oferta cuando el producto está en oferta', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('¡Oferta!')).toBeInTheDocument();
  });

  it('debe calcular descuento porcentual correctamente', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    // Cálculo: ((150.99 - 120.50) / 150.99) * 100 ≈ 20%
    expect(screen.getByText(/20% OFF/)).toBeInTheDocument();
  });

  it('debe mostrar stock bajo cuando queden pocos productos', () => {
    const lowStockProduct = { ...mockProduct, stock: 2 };
    renderWithCart(<ProductCard product={lowStockProduct} />);
    
    expect(screen.getByText('¡Solo quedan 2!')).toBeInTheDocument();
  });

  it('debe mostrar sin stock cuando stock es 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderWithCart(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });

  it('debe agregar producto al carrito al hacer clic en el botón', async () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    const addButton = screen.getByRole('button', { name: /agregar al carrito/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(mockProduct, 1);
    });
  });

  it('debe deshabilitar botón cuando no hay stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderWithCart(<ProductCard product={outOfStockProduct} />);
    
    const addButton = screen.getByRole('button');
    expect(addButton).toBeDisabled();
  });

  it('debe renderizar en modo lista correctamente', () => {
    renderWithCart(<ProductCard product={mockProduct} variant="list" />);
    
    // En modo lista debería tener diferentes clases CSS
    const card = screen.getByText('Producto Test').closest('.card');
    expect(card).toHaveClass('flex-row'); // Asumiendo que modo lista usa flex-row
  });

  it('debe mostrar imagen del producto con alt text correcto', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Producto Test');
    expect(image).toHaveAttribute('src', expect.stringContaining('test-image.jpg'));
  });

  it('debe mostrar precio formateado correctamente', () => {
    const productWithLargePrice = { 
      ...mockProduct, 
      price: 1234567.89,
      onSale: false,
      salePrice: undefined
    };
    renderWithCart(<ProductCard product={productWithLargePrice} />);
    
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });

  it('debe manejar producto sin imagen', () => {
    const productWithoutImage = { ...mockProduct, images: [] };
    renderWithCart(<ProductCard product={productWithoutImage} />);
    
    // Debería mostrar imagen placeholder o manejar graciosamente
    expect(screen.getByText('Producto Test')).toBeInTheDocument();
  });

  it('debe mostrar información de categoría', () => {
    renderWithCart(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Categoría Test')).toBeInTheDocument();
  });

  it('debe manejar producto sin rating', () => {
    const productWithoutRating = { 
      ...mockProduct, 
      rating: undefined,
      reviewCount: undefined 
    };
    renderWithCart(<ProductCard product={productWithoutRating} />);
    
    expect(screen.getByText('Producto Test')).toBeInTheDocument();
    expect(screen.queryByText(/reseñas/)).not.toBeInTheDocument();
  });
});