import type { Meta, StoryObj } from "@storybook/nextjs";
import Select from "../../../components/ui/Select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grape", label: "Grape" },
  { value: "pineapple", label: "Pineapple" },
];

export const Default: Story = {
  args: {
    options,
    placeholder: "Select a fruit",
    value: "",
    onChange: (val) => console.log(val),
  },
};

export const Disabled: Story = {
  args: {
    options,
    placeholder: "Select a fruit",
    disabled: true,
    value: "",
  },
};

export const WithValue: Story = {
  args: {
    options,
    value: "apple",
    onChange: (val) => console.log(val),
  },
};
