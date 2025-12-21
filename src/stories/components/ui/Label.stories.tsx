import type { Meta, StoryObj } from "@storybook/nextjs";
import { Label } from "../../../components/ui/Label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Email Address",
    htmlFor: "email",
  },
};
