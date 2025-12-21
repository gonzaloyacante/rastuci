import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  ProgressBar,
  FloatingNotification,
  PulseHighlight,
  AnimatedCounter,
  SkeletonLoader,
} from "../../../components/checkout/CheckoutTransitions";
import { Button } from "../../../components/ui/Button";

// ProgressBar Story
const metaProgress: Meta<typeof ProgressBar> = {
  title: "Checkout/Utils/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
};
export const ProgressDefault: StoryObj<typeof ProgressBar> = {
  args: { progress: 50, showPercentage: true },
  render: (args) => (
    <div className="w-96">
      <ProgressBar {...args} />
    </div>
  ),
};

// FloatingNotification Story
const metaNotification: Meta<typeof FloatingNotification> = {
  title: "Checkout/Utils/FloatingNotification",
  component: FloatingNotification,
  tags: ["autodocs"],
};
export const NotificationSuccess: StoryObj<typeof FloatingNotification> = {
  args: { isVisible: true, message: "Operation successful!", type: "success" },
};
export const NotificationError: StoryObj<typeof FloatingNotification> = {
  args: { isVisible: true, message: "Something went wrong", type: "error" },
};

// PulseHighlight Story
const metaPulse: Meta<typeof PulseHighlight> = {
  title: "Checkout/Utils/PulseHighlight",
  component: PulseHighlight,
  tags: ["autodocs"],
};
export const PulseDefault: StoryObj<typeof PulseHighlight> = {
  args: { isActive: true, children: <Button>Click me</Button> },
};

// AnimatedCounter Story
const metaCounter: Meta<typeof AnimatedCounter> = {
  title: "Checkout/Utils/AnimatedCounter",
  component: AnimatedCounter,
  tags: ["autodocs"],
};
export const CounterDefault: StoryObj<typeof AnimatedCounter> = {
  args: { from: 0, to: 1000, duration: 2000, prefix: "$" },
};

// SkeletonLoader Story
const metaSkeleton: Meta<typeof SkeletonLoader> = {
  title: "Checkout/Utils/SkeletonLoader",
  component: SkeletonLoader,
  tags: ["autodocs"],
};
export const SkeletonDefault: StoryObj<typeof SkeletonLoader> = {
  args: { lines: 3, className: "w-96" },
};

export default {
  title: "Checkout/Utils",
};
