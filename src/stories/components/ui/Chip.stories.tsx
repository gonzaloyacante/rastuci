import type { Meta, StoryObj } from "@storybook/nextjs";
import { Chip } from "../../../components/ui/Chip";

const meta: Meta<typeof Chip> = {
  title: "UI/Chip",
  component: Chip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    children: "React",
  },
};

export const Removable: Story = {
  args: {
    children: "Filter: Size M",
    removable: true,
    onRemove: () => alert("Remove clicked"),
  },
};

export const Selected: Story = {
  args: {
    children: "Selected Filter",
    selected: true,
  },
};
