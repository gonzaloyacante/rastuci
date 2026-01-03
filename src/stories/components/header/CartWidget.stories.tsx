import type { Meta, StoryObj } from "@storybook/nextjs";
import CartWidget from "../../../components/header/CartWidget.client";
import React from "react";
import type { Product } from "@/types";

// We need to match the module import that CartWidget uses.
// Since we can't easily module-mock in generic storybook without setup,
// we'll rely on the fact that CartWidget imports from '@/context/CartContext'.
// Storybook Webpack usually resolves aliases.
// BUT: mocking the hook `useCart` is cleaner if we could.
// Since we can't mock imports easily here without extra config, we will try to use a decorator
// that assumes the component uses the context if we could Wrap it.
// However, `CartWidget` imports `useCart` directly.
// We might need to assume `useCart` works by reading a context we PROVIDE here.
// IF `useCart` throws when no context is found, our provider will fix it.
// IF `useCart` imports a specific Context object, we need to provider THAT context.
// But `CartContext` is not exported from the file, only `useCart` and `CartProvider`.
// So we can wrap with the REAL `CartProvider` but we'd need to mock its internal state or behavior?
// `CartProvider` has internal state. We can use it directly?
// It might fetch things on mount.
//
// BETTER APPROACH for "Massive" speed:
// We will try to rely on the fallback logic of `useCart`.
// `useCart` reads `CartContext`. If undefined, it returns default empty cart.
// If we want to show a badge, we need `getItemCount` to return > 0.
// The default `_defaultCart` returns 0.
// So `Default` story (empty) works without provider.
// `WithItems` story needs a provider that overrides `getItemCount`.
// Since we can't inject a value into the *internal* Context of `CartContext.tsx` because it's not exported...
// ... we actually CANNOT easily moch the state unless `CartContext` is exported.
// Wait, `CartContext` variable is NOT exported in `src/context/CartContext.tsx`.
// It is `const CartContext = createContext...` not exported.
// Only `useCart` and `CartProvider` are exported.
// `CartProvider` renders `<CartContext.Provider ...>`.
// So we must use `CartProvider`.
// To simulate items in `CartProvider`, we can use `addToCart` in a `useEffect`.

import { CartProvider, useCart } from "../../../context/CartContext";

const AddItemsDecorator = (Story: React.ComponentType) => {
  const { addToCart, clearCart } = useCart();
  React.useEffect(() => {
    clearCart();
    // Product structure mock - minimal fields for cart functionality
    const p = {
      id: "1",
      name: "Mock Product",
      price: 100,
      images: [],
      stock: 10,
      categoryId: "cat1",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;
    addToCart(p, 5, "M", "Red");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Story />;
};

const meta: Meta<typeof CartWidget> = {
  title: "Public/Header/CartWidget",
  component: CartWidget,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CartProvider>
        <Story />
      </CartProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CartWidget>;

export const Empty: Story = {
  args: { mobile: false },
};

export const WithItems: Story = {
  args: { mobile: false },
  decorators: [AddItemsDecorator],
};

export const Mobile: Story = {
  args: { mobile: true },
  decorators: [AddItemsDecorator],
};
