import type { Meta, StoryObj } from "@storybook/nextjs";
import ProductList from "../../../components/products/ProductList";
import React from "react";

// Mock fetch for all ProductList dependencies
const FetchDecorator = (Story: any) => {
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = url.toString();

      // Mock Products List
      if (u.includes("/api/products") && !u.includes("search")) {
        return {
          ok: true,
          json: async () => ({
            data: {
              data: Array.from({ length: 10 }).map((_, i) => ({
                id: `p${i}`,
                name: `Producto Admin ${i}`,
                price: 1000 * (i + 1),
                stock: i * 2,
                onSale: i % 2 === 0,
                categories: { name: "Demo Cat" },
                images: [],
              })),
              meta: { total: 50, pages: 5, page: 1 },
            },
          }),
        } as Response;
      }

      // Mock Categories
      if (u.includes("/api/categories")) {
        return {
          ok: true,
          json: async () => ({
            data: {
              data: [
                { id: "c1", name: "Categoría 1" },
                { id: "c2", name: "Categoría 2" },
              ],
            },
          }),
        } as Response;
      }

      // Mock Stats
      if (u.includes("/api/admin/stats")) {
        // Assuming endpoint
        return {
          ok: true,
          json: async () => ({
            // structure of inventory stats
            total: 100,
            inStock: 80,
            lowStock: 15,
            outOfStock: 5,
          }),
        } as Response;
      }

      return originalFetch(url, init);
    };
    return () => {
      global.fetch = originalFetch;
    };
  }, []);
  return <Story />;
};

const meta: Meta<typeof ProductList> = {
  title: "Admin/Products/ProductList",
  component: ProductList,
  tags: ["autodocs"],
  decorators: [FetchDecorator],
};

export default meta;
type Story = StoryObj<typeof ProductList>;

export const Default: Story = {
  args: {},
};
