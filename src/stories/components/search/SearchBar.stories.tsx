import type { Meta, StoryObj } from "@storybook/nextjs";
import { SearchBar } from "../../../components/search/SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Public/Search/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
    onSearch: { action: "searched" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {
    placeholder: "Buscar...",
    value: "",
  },
};

export const WithValue: Story = {
  args: {
    placeholder: "Buscar...",
    value: "T-shirt",
  },
};
