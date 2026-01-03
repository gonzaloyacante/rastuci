import type { Meta, StoryObj } from "@storybook/nextjs";
import { SortPopover } from "../../../components/products/SortPopover";
import React, { useRef, useState } from "react";

const meta: Meta<typeof SortPopover> = {
  title: "Public/Products/SortPopover",
  component: SortPopover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SortPopover>;

const options = [
  { value: "price_asc", label: "Precio: Menor a Mayor" },
  { value: "price_desc", label: "Precio: Mayor a Menor" },
  { value: "newest", label: "Más Recientes" },
];

const PopoverWrapper = (args: Record<string, unknown>) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("newest");

  return (
    <div className="h-64 flex justify-center items-start pt-10">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border rounded hover:bg-gray-100"
      >
        Ordenar por: {options.find((o) => o.value === selected)?.label}
      </button>
      <SortPopover
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef as React.RefObject<HTMLElement>}
        selectedValue={selected}
        onSelect={setSelected}
        options={options}
      />
    </div>
  );
};

export const Interactive: Story = {
  args: {
    options: options,
  },
  render: (args) => <PopoverWrapper {...args} />,
};
