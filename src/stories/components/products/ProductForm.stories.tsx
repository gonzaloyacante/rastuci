import type { Meta, StoryObj } from "@storybook/nextjs";
import ProductForm from "../../../components/products/ProductForm";

const meta: Meta<typeof ProductForm> = {
  title: "Admin/Products/ProductForm",
  component: ProductForm,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ProductForm>;

const mockCategories = [
  { id: "c1", name: "Ropa de Bebé", description: "0-24 meses" },
  { id: "c2", name: "Niños", description: "2-10 años" },
  { id: "c3", name: "Accesorios", description: "Gorros, bufandas, etc" },
];

export const CreateNew: Story = {
  args: {
    initialData: null,
    categories: mockCategories,
  },
};

export const EditExisting: Story = {
  args: {
    categories: mockCategories,
    initialData: {
      id: "p1",
      name: "Vestido Floral de Prueba",
      description: "Vestido hermoso para primavera con estampado floral.",
      price: 45000,
      salePrice: 40000,
      onSale: true,
      stock: 10,
      categoryId: "c1",
      images: ["https://placehold.co/600x600?text=Product+Image"],
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [
        {
          id: "v1",
          productId: "p1",
          color: "Rojo",
          size: "M",
          stock: 5,
          sku: "ROJ-M-001",
        },
        {
          id: "v2",
          productId: "p1",
          color: "Azul",
          size: "L",
          stock: 5,
          sku: "AZU-L-002",
        },
      ],
      colors: ["Rojo", "Azul"],
      sizes: ["M", "L"],
      features: ["Algodón 100%", "Lavable a máquina"],
      weight: 200,
      height: 10,
      width: 20,
      length: 30,
    },
  },
};
