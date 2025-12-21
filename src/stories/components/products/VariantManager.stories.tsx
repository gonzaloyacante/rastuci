import type { Meta, StoryObj } from "@storybook/nextjs";
import VariantManager from "../../../components/products/VariantManager";
import { useState } from "react";
import { ProductVariant } from "../../../types";

const meta: Meta<typeof VariantManager> = {
  title: "Admin/Products/VariantManager",
  component: VariantManager,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof VariantManager>;

// Wrapper to handle state
const StatefulVariantManager = ({ initialVariants = [], ...args }: any) => {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  return (
    <VariantManager {...args} variants={variants} onChange={setVariants} />
  );
};

export const Default: Story = {
  args: {
    availableColors: ["Rojo", "Azul", "Verde"],
    availableSizes: ["S", "M", "L", "XL"],
    variants: [],
  },
  render: (args) => <StatefulVariantManager {...args} />,
};

export const WithVariants: Story = {
  render: () => (
    <StatefulVariantManager
      availableColors={["Rojo", "Azul"]}
      availableSizes={["S", "M"]}
      initialVariants={[
        { id: "1", color: "Rojo", size: "S", stock: 10, sku: "RED-S-1" },
        { id: "2", color: "Rojo", size: "M", stock: 5, sku: "RED-M-1" },
      ]}
    />
  ),
};
