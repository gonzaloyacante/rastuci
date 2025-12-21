import type { Meta, StoryObj } from "@storybook/nextjs";
import Typography from "../../../components/ui/Typography";

const meta: Meta<typeof Typography> = {
  title: "UI/Typography",
  component: Typography,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "body", "caption"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Heading1: Story = {
  args: {
    variant: "h1",
    children: "Heading 1: The Quick Brown Fox",
  },
};

export const Heading2: Story = {
  args: {
    variant: "h2",
    children: "Heading 2: Jumps Over The Lazy Dog",
  },
};

export const Heading3: Story = {
  args: {
    variant: "h3",
    children: "Heading 3: Lorem Ipsum Dolor",
  },
};

export const Body: Story = {
  args: {
    variant: "body",
    children:
      "Body Text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
};

export const Caption: Story = {
  args: {
    variant: "caption",
    children: "Caption: Subtle information or metadata.",
  },
};
