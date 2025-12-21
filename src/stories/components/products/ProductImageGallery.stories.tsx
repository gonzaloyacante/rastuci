import type { Meta, StoryObj } from "@storybook/nextjs";
import ProductImageGallery from "../../../components/products/ProductImageGallery";

const meta: Meta<typeof ProductImageGallery> = {
  title: "Public/Products/ProductImageGallery",
  component: ProductImageGallery,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductImageGallery>;

const images = [
  "https://placehold.co/600x600?text=Image+1",
  "https://placehold.co/600x600?text=Image+2",
  "https://placehold.co/600x600?text=Image+3",
];

export const Default: Story = {
  args: {
    images: images,
    productName: "Producto Demo",
  },
};

export const SingleImage: Story = {
  args: {
    images: [images[0]],
    productName: "Producto Single",
  },
};
