import type { Meta, StoryObj } from "@storybook/nextjs";
import { Input } from "../../../components/ui/Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    error: { control: "text" },
    helpText: { control: "text" },
    icon: { control: "text" },
    iconPosition: {
      control: "radio",
      options: ["left", "right"],
    },
    allowPasswordToggle: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Type something...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Username",
    placeholder: "Enter your username",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    defaultValue: "invalid-email",
    error: "Invalid email address",
  },
};

export const WithHelpText: Story = {
  args: {
    label: "Password",
    type: "password",
    helpText: "Must be at least 8 characters",
  },
};

export const PasswordToggle: Story = {
  args: {
    label: "Password",
    type: "password",
    allowPasswordToggle: true,
  },
};

export const WithIconLeft: Story = {
  args: {
    label: "Search",
    icon: "search",
    iconPosition: "left",
    placeholder: "Search products...",
  },
};
