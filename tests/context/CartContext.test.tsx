/// <reference types="jest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CartProvider, useCart } from '@/context/CartContext';

// Mock product data
const mockProduct = {
  id: 'prod-1',
  name: 'Test Product',
  price: 100,
  stock: 10,
  images: ['/test.jpg'],
  categoryId: 'cat-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test component to access cart context
function TestComponent() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getCartTotal,
  } = useCart();

  return (
    <div>
      <div data-testid="item-count">{getItemCount()}</div>
      <div data-testid="cart-total">{getCartTotal()}</div>
      <div data-testid="cart-items">{cartItems.length}</div>

      <button onClick={() => addToCart(mockProduct, 'M', 'Red')}>
        Add to Cart
      </button>
      <button onClick={() => removeFromCart('prod-1', 'M', 'Red')}>
        Remove from Cart
      </button>
      <button onClick={() => updateQuantity('prod-1', 'M', 'Red', 3)}>
        Update Quantity
      </button>
      <button onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}

describe('CartContext', () => {
  const renderWithProvider = () => {
    return render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock fetch for settings loading
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with empty cart', () => {
    renderWithProvider();

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
  });

  it('adds item to cart', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Add to Cart'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('100');
    expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
  });

  it('increases quantity when adding same item', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Add to Cart'));
    fireEvent.click(screen.getByText('Add to Cart'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('200');
    expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
  });

  it('removes item from cart', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Add to Cart'));
    fireEvent.click(screen.getByText('Remove from Cart'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
  });

  it('updates item quantity', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Add to Cart'));
    fireEvent.click(screen.getByText('Update Quantity'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('3');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('300');
  });

  it('clears entire cart', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Add to Cart'));
    fireEvent.click(screen.getByText('Clear Cart'));

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
  });

  it('persists cart to localStorage', async () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Add to Cart'));

    await waitFor(() => {
      const savedCart = localStorage.getItem('rastuci-cart');
      expect(savedCart).toBeTruthy();

      const parsedCart = JSON.parse(savedCart!);
      expect(parsedCart).toHaveLength(1);
      expect(parsedCart[0].product.id).toBe('prod-1');
    });
  });

  it('loads cart from localStorage on mount', () => {
    const cartData = [{
      product: mockProduct,
      size: 'L',
      color: 'Blue',
      quantity: 2
    }];

    localStorage.setItem('rastuci-cart', JSON.stringify(cartData));

    renderWithProvider();

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('200');
    expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
  });
});
