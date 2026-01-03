import type { Meta, StoryObj } from "@storybook/nextjs";
import SmartSearch from "../../../components/search/SmartSearch";
import React from "react";

// Mock fetch for SmartSearch
const FetchDecorator = (Story: React.ComponentType) => {
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = url.toString();
      if (u.includes("/api/search/trending")) {
        return {
          ok: true,
          json: async () => ({
            data: { trending: ["remeras", "pantalones", "bebé"] },
          }),
        } as Response;
      }
      if (u.includes("/api/products/search")) {
        return {
          ok: true,
          json: async () => ({
            data: {
              data: [
                {
                  id: "1",
                  name: "Remera Basic",
                  price: 15000,
                  categories: { name: "Ropa" },
                },
                {
                  id: "2",
                  name: "Pantalón Jean",
                  price: 35000,
                  categories: { name: "Ropa" },
                },
              ],
            },
          }),
        } as Response;
      }
      if (u.includes("/api/categories")) {
        return {
          ok: true,
          json: async () => ({
            data: {
              data: [
                { id: "c1", name: "Remeras" },
                { id: "c2", name: "Pantalones" },
              ],
            },
          }),
        } as Response;
      }
      return originalFetch(url, init);
    };
    return () => {
      global.fetch = originalFetch;
    };
  }, []);
  return (
    <div className="h-64">
      <Story />
    </div>
  ); // Height for dropdown
};

const meta: Meta<typeof SmartSearch> = {
  title: "Public/Search/SmartSearch",
  component: SmartSearch,
  tags: ["autodocs"],
  decorators: [FetchDecorator],
};

export default meta;
type Story = StoryObj<typeof SmartSearch>;

export const Default: Story = {
  args: {
    placeholder: "Buscar...",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    placeholder: "Busca un producto...",
  },
};
