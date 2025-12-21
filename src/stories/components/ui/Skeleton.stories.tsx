import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Skeleton,
  ProductCardSkeleton,
  DashboardCardSkeleton,
} from "../../../components/ui/Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    rounded: {
      control: "select",
      options: ["none", "sm", "md", "lg", "full"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: "w-[100px] h-[20px]",
    rounded: "md",
  },
};

export const Avatar: Story = {
  args: {
    className: "w-12 h-12",
    rounded: "full",
  },
};

export const TextBlock: Story = {
  render: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  ),
};

export const ProductCardLoading: Story = {
  render: () => (
    <div className="max-w-[300px]">
      <ProductCardSkeleton />
    </div>
  ),
};

export const DashboardCardLoading: Story = {
  render: () => (
    <div className="max-w-[300px]">
      <DashboardCardSkeleton />
    </div>
  ),
};
