import type { Meta, StoryObj } from "@storybook/nextjs";
import Alert, { useAlert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
    isOpen: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    isOpen: true,
    title: "Information",
    message: "This is a neutral information alert.",
    variant: "info",
    onClose: () => console.log("Closed"),
  },
};

export const Success: Story = {
  args: {
    isOpen: true,
    title: "Payment Successful",
    message: "Your order has been processed correctly.",
    variant: "success",
    onClose: () => console.log("Closed"),
  },
};

export const Warning: Story = {
  args: {
    isOpen: true,
    title: "Low Stock",
    message: "Only 2 items remaining in stock.",
    variant: "warning",
    onClose: () => console.log("Closed"),
  },
};

export const Error: Story = {
  args: {
    isOpen: true,
    title: "Transaction Failed",
    message: "We could not process your credit card.",
    variant: "error",
    onClose: () => console.log("Closed"),
  },
};

// Interactive example using the hook
const InteractiveAlertExample = () => {
  const { showAlert, Alert } = useAlert();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() =>
            showAlert({
              title: "Success",
              message: "Operation completed",
              variant: "success",
              autoClose: 3000,
            })
          }
        >
          Trigger Success
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            showAlert({
              title: "Error",
              message: "Something went wrong",
              variant: "error",
            })
          }
        >
          Trigger Error
        </Button>
      </div>
      {Alert}
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveAlertExample />,
};
