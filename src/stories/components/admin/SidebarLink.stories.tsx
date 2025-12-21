import type { Meta, StoryObj } from "@storybook/nextjs";
import { SidebarLink } from "../../../components/admin/SidebarLink";
import { Home, Users, Settings } from "lucide-react";

const meta: Meta<typeof SidebarLink> = {
  title: "Admin/Navigation/SidebarLink",
  component: SidebarLink,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-64 bg-surface border rounded-lg p-2">
        <ul className="space-y-1">
          <Story />
        </ul>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SidebarLink>;

export const Default: Story = {
  args: {
    link: { name: "Dashboard", href: "/admin", icon: Home },
    isOpen: true,
    isActive: false,
    onClick: () => {},
  },
};

export const Active: Story = {
  args: {
    link: { name: "Users", href: "/admin/users", icon: Users },
    isOpen: true,
    isActive: true,
    onClick: () => {},
  },
};

export const Collapsed: Story = {
  args: {
    link: { name: "Settings", href: "/admin/settings", icon: Settings },
    isOpen: false,
    isActive: false,
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-16 bg-surface border rounded-lg p-2">
        <ul className="space-y-1">
          <Story />
        </ul>
      </div>
    ),
  ],
};
