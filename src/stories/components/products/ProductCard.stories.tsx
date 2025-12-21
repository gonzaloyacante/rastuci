import type { Meta, StoryObj } from "@storybook/nextjs";
import { ProductCard } from "../../../components/products/ProductCard";

const meta: Meta<typeof ProductCard> = {
  title: "Components/Products/ProductCard",
  component: ProductCard,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["public", "grid", "list", "admin"],
    },
    layout: {
      control: "select",
      options: ["grid", "list"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

const defaultProduct = {
  id: "1",
  name: "Camiseta Clásica de Algodón Premium",
  description:
    "Una camiseta cómoda y duradera para el uso diario. Fabricada con algodón 100% orgánico.",
  price: 25000,
  stock: 15,
  images: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  categoryId: "cat1",
  onSale: false,
  salePrice: undefined,
  isFeatured: false,
  isArchived: false,
  categories: {
    name: "Ropa",
    id: "cat1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  sizes: ["S", "M", "L", "XL"],
  colors: ["#000000", "#FFFFFF", "#1E3A8A"],
  rating: 4.5,
  reviewCount: 12,
};

export const GridView: Story = {
  args: {
    product: defaultProduct,
    variant: "grid",
  },
};

export const ListView: Story = {
  args: {
    product: defaultProduct,
    variant: "list",
  },
};

export const OnSale: Story = {
  args: {
    product: {
      ...defaultProduct,
      onSale: true,
      salePrice: 19999,
    },
    variant: "grid",
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...defaultProduct,
      stock: 0,
    },
    variant: "grid",
  },
};

export const LowStock: Story = {
  args: {
    product: {
      ...defaultProduct,
      stock: 3,
    },
    variant: "grid",
  },
};

export const AdminView: Story = {
  args: {
    product: defaultProduct,
    variant: "admin",
    onEdit: (id) => alert(`Edit ${id}`),
    onDelete: (id) => alert(`Delete ${id}`),
    onView: (id) => alert(`View ${id}`),
  },
};
