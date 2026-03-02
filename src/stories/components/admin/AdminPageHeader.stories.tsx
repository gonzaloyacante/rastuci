/* eslint-disable no-console */
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Plus, Settings } from "lucide-react";

import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";

const meta: Meta<typeof AdminPageHeader> = {
  title: "Admin/AdminPageHeader",
  component: AdminPageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AdminPageHeader>;

export const Default: Story = {
  args: {
    title: "Dashboard",
    subtitle: "Overview of your store performance",
  },
};

export const WithActions: Story = {
  args: {
    title: "Products",
    subtitle: "Manage your product catalog",
    actions: [
      {
        label: "Add Product",
        onClick: () => console.log("Add clicked"),
        variant: "primary",
        icon: <Plus className="h-4 w-4" />,
      },
      {
        label: "Settings",
        onClick: () => console.log("Settings clicked"),
        variant: "outline",
        icon: <Settings className="h-4 w-4" />,
      },
    ],
  },
};
