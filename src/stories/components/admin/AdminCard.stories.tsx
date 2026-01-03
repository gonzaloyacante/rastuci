import type { Meta, StoryObj } from "@storybook/nextjs";
import { AdminCard, StatCard, AdminColor } from "../../../components/admin/AdminCards";
import { DollarSign, Users } from "lucide-react";

// AdminCard stories
const metaAdminCard: Meta<typeof AdminCard> = {
  title: "Admin/AdminCard",
  component: AdminCard,
  tags: ["autodocs"],
};

export default metaAdminCard;
type StoryAdminCard = StoryObj<typeof AdminCard>;

export const Default: StoryAdminCard = {
  args: {
    children: <p className="text-lg">This is content inside the admin card.</p>,
  },
};

export const WithHoverGradient: StoryAdminCard = {
  args: {
    hoverGradient: "blue",
    children: <p className="text-lg">Hover over me for gradient effect!</p>,
  },
};

// StatCard stories
const _metaStatCard: Meta<typeof StatCard> = {
  title: "Admin/StatCard",
  component: StatCard,
  tags: ["autodocs"],
};

export const RevenueStat: StoryObj<typeof StatCard> = {
  args: {
    stat: {
      icon: DollarSign,
      label: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      color: "blue" as AdminColor,
    },
  },
};

export const UsersStat: StoryObj<typeof StatCard> = {
  args: {
    stat: {
      icon: Users,
      label: "Active Users",
      value: "2,350",
      change: "-5%",
      color: "emerald" as AdminColor,
    },
  },
};
