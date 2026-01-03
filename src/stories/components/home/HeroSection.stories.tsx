import type { Meta, StoryObj } from "@storybook/nextjs";
import { HeroSection } from "../../../components/home/HeroSection";

const meta: Meta<typeof HeroSection> = {
  title: "Public/Home/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {
  args: {
    home: undefined, // uses defaults
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const CustomContent: Story = {
  args: {
    home: {
      heroSubtitle: "Summer Collection 2024",
      ctaPrimaryLabel: "Shop Summer",
      ctaSecondaryLabel: "New Arrivals",
      // other required fields mocked with defaults or partials if type allows
    } as unknown as Parameters<typeof HeroSection>[0]["home"],
  },
};
