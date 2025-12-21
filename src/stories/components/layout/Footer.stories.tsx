import type { Meta, StoryObj } from "@storybook/nextjs";
import Footer from "../../../components/layout/Footer";

const meta: Meta<typeof Footer> = {
  title: "Public/Layout/Footer",
  component: Footer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    home: undefined,
  },
};

export const CustomFooter: Story = {
  args: {
    home: {
      footer: {
        brand: "Rastući Premium",
        tagline: "Quality Kids Wear since 2024",
        email: "contact@rastuci.com",
        phone: "+54 11 9999-9999",
        logoUrl: "",
        socialLinks: {
          instagram: "https://instagram.com",
          facebook: "https://facebook.com",
          twitter: "https://twitter.com",
        },
      },
    } as any,
  },
};
