import type { Meta, StoryObj } from "@storybook/nextjs";
import { ProductGrid } from "../../../components/products/ProductGrid";
import { Product } from "../../../types";

const meta: Meta<typeof ProductGrid> = {
  title: "Public/Products/ProductGrid",
  component: ProductGrid,
  tags: ["autodocs"],
  argTypes: {
    onLoadMore: { action: "loadMore" },
    onPageChange: { action: "pageChange" },
    onViewModeChange: { action: "viewModeChange" },
  },
};

export default meta;
type Story = StoryObj<typeof ProductGrid>;

const mockProducts: Product[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `prod-${i}`,
  name: `Producto de Prueba ${i + 1}`,
  description: "Descripción corta del producto",
  price: 15000 + i * 1000,
  stock: i % 3 === 0 ? 0 : 10,
  images: [`https://placehold.co/400x400?text=Product+${i + 1}`],
  categoryId: "cat1",
  createdAt: new Date(),
  updatedAt: new Date(),
  variants: [],
}));

export const GridView: Story = {
  args: {
    products: mockProducts,
    viewMode: "grid",
    loading: false,
  },
};

export const ListView: Story = {
  args: {
    products: mockProducts,
    viewMode: "list",
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    products: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    products: [],
    loading: false,
  },
};

export const PaginationMode: Story = {
  args: {
    products: mockProducts.slice(0, 4),
    viewMode: "grid",
    totalPages: 5,
    currentPage: 1,
    totalItems: 40,
    itemsPerPage: 8,
  },
};
