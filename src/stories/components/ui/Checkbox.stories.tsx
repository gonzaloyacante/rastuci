import type { Meta, StoryObj } from "@storybook/nextjs";
import { Checkbox } from "../../../components/ui/Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    id: "terms",
  },
  decorators: [
    (Story) => (
      <div className="flex items-center space-x-2">
        <Story />
        <label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="terms"
        >
          Accept terms and conditions
        </label>
      </div>
    ),
  ],
};

export const Checked: Story = {
  args: {
    id: "checked",
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    id: "disabled",
    disabled: true,
  },
};
