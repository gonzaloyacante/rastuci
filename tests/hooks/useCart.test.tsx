import { renderHook, act } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

// Mock product para tests
const mockProduct: Product = {
  id: "1",
  name: "Producto Test",
  description: "Descripción del producto test",
  price: 100,
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
  onSale: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('useCart Hook', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  it('debe inicializar con carrito vacío', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('debe agregar producto al carrito', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      productId: mockProduct.id,
      product: mockProduct,
      quantity: 2
    });
    expect(result.current.itemCount).toBe(2);
    expect(result.current.total).toBe(200);
  });

  it('debe incrementar cantidad si el producto ya existe', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 1);
    });

    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.itemCount).toBe(3);
  });

  it('debe actualizar cantidad de producto', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    act(() => {
      result.current.updateQuantity("1", 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
  });

  it('debe remover producto del carrito', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    act(() => {
      result.current.removeItem("1");
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('debe limpiar el carrito completo', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('debe verificar si un producto está en el carrito', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.isInCart("1")).toBe(false);
    
    act(() => {
      result.current.addItem(mockProduct, 1);
    });

    expect(result.current.isInCart("1")).toBe(true);
  });

  it('debe obtener la cantidad de un producto específico', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.getQuantity("1")).toBe(0);
    
    act(() => {
      result.current.addItem(mockProduct, 3);
    });

    expect(result.current.getQuantity("1")).toBe(3);
  });

  it('debe persistir carrito en localStorage', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 1);
    });

    // Verificar que se guardó en localStorage
    const savedCart = JSON.parse(localStorage.getItem('rastuci_cart') || '[]');
    expect(savedCart).toHaveLength(1);
    expect(savedCart[0].productId).toBe("1");
  });

  it('debe cargar carrito desde localStorage', () => {
    // Simular carrito existente en localStorage
    const existingCart = [{ 
      productId: mockProduct.id, 
      product: mockProduct, 
      quantity: 3 
    }];
    localStorage.setItem('rastuci_cart', JSON.stringify(existingCart));

    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.itemCount).toBe(3);
  });

  it('debe calcular precio total correctamente con múltiples productos', () => {
    const product2: Product = {
      ...mockProduct,
      id: "2",
      price: 50
    };

    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 2); // 100 * 2 = 200
      result.current.addItem(product2, 3);    // 50 * 3 = 150
    });

    expect(result.current.total).toBe(350);
    expect(result.current.itemCount).toBe(5);
  });

  it('debe remover producto al actualizar cantidad a 0', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    act(() => {
      result.current.updateQuantity("1", 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });
});