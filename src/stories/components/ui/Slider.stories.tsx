import type { Meta, StoryObj } from "@storybook/nextjs";
import { Slider } from "../../../components/ui/Slider";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    value: [50, 50], // Range slider expects [min, max]
    min: 0,
    max: 100,
    step: 1,
    className: "w-[60%]",
    onValueChange: () => {},
  },
};

export const Range: Story = {
  args: {
    value: [25, 75],
    min: 0,
    max: 100,
    step: 1,
    className: "w-[60%]",
    onValueChange: () => {},
  },
};
