import type { Meta, StoryObj } from "@storybook/nextjs";
import { AdminTable } from "../../../components/admin/AdminTable";
import { Edit, Trash2 } from "lucide-react";

const meta: Meta<typeof AdminTable> = {
  title: "Admin/AdminTable",
  component: AdminTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AdminTable>;

const mockData = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "Active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "Pending" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "Inactive" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

export const Default: Story = {
  args: {
    title: "Users",
    columns: columns,
    data: mockData,
  },
};

export const WithActions: Story = {
  args: {
    title: "Users",
    columns: columns,
    data: mockData,
    actions: [
      {
        label: "Edit",
        onClick: (row) => console.log("Edit", row),
        variant: "outline",
        icon: <Edit className="h-4 w-4" />,
      },
      {
        label: "Delete",
        onClick: (row) => console.log("Delete", row),
        variant: "destructive",
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    title: "Loading Data",
    columns: columns,
    data: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    title: "No Data",
    columns: columns,
    data: [],
    emptyMessage: "No users found",
  },
};
