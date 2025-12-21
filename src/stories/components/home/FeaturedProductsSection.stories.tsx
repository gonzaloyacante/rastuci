import type { Meta, StoryObj } from "@storybook/nextjs";
import { FeaturedProductsSection } from "../../../components/home/FeaturedProductsSection";

const meta: Meta<typeof FeaturedProductsSection> = {
  title: "Public/Home/FeaturedProductsSection",
  component: FeaturedProductsSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FeaturedProductsSection>;

const mockProducts = [
  {
    id: "1",
    name: "Classic Tee",
    price: 25000,
    stock: 10,
    images: ["https://placehold.co/400x400?text=Product+1"],
    categoryId: "c1",
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [],
  },
  {
    id: "2",
    name: "Denim Jeans",
    price: 55000,
    salePrice: 45000,
    stock: 5,
    images: ["https://placehold.co/400x400?text=Product+2"],
    categoryId: "c1",
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [],
  },
  {
    id: "3",
    name: "Sneakers",
    price: 89000,
    stock: 0,
    images: ["https://placehold.co/400x400?text=Product+3"],
    categoryId: "c1",
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [],
  },
  {
    id: "4",
    name: "Cap",
    price: 15000,
    stock: 20,
    images: ["https://placehold.co/400x400?text=Product+4"],
    categoryId: "c1",
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [],
  },
];

export const Default: Story = {
  args: {
    products: mockProducts as any,
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
