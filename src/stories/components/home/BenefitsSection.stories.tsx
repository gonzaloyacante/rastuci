import type { Meta, StoryObj } from "@storybook/nextjs";
import { BenefitsSection } from "../../../components/home/BenefitsSection";

const meta: Meta<typeof BenefitsSection> = {
  title: "Public/Home/BenefitsSection",
  component: BenefitsSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BenefitsSection>;

export const Default: Story = {
  args: {
    home: undefined,
  },
};

export const CustomBenefits: Story = {
  args: {
    home: {
      benefits: [
        {
          icon: "Star",
          title: "Premium Quality",
          description: "Only the best materials",
        },
        {
          icon: "Globe",
          title: "Worldwide Shipping",
          description: "We ship to over 100 countries",
        },
        {
          icon: "ShieldCheck",
          title: "Secure Payment",
          description: "100% secure checkout",
        },
      ],
    } as any,
  },
};
