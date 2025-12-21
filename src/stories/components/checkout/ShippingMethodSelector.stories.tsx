import type { Meta, StoryObj } from "@storybook/nextjs";
import { ShippingMethodSelector } from "../../../components/checkout/ShippingMethodSelector";

const meta: Meta<typeof ShippingMethodSelector> = {
  title: "Checkout/ShippingMethodSelector",
  component: ShippingMethodSelector,
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
};

export default meta;
type Story = StoryObj<typeof ShippingMethodSelector>;

export const Default: Story = {
  args: {
    value: "home",
  },
};

export const Pickup: Story = {
  args: {
    value: "pickup",
  },
};
