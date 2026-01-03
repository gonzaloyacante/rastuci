import type { Meta, StoryObj } from "@storybook/nextjs";
import ToastProvider, { useToast } from "../../../components/ui/Toast";
import { Button } from "../../../components/ui/Button";

// Mock component to test hook
const ToastDemo = () => {
  const { show, dismiss: _dismiss } = useToast();

  return (
    <div className="flex flex-col gap-2 p-4 border rounded">
      <p>Click buttons to trigger toasts</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() =>
            show({
              type: "success",
              title: "Success",
              message: "Operation completed successfully",
            })
          }
        >
          Success Toast
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            show({
              type: "error",
              title: "Error",
              message: "Something went wrong",
            })
          }
        >
          Error Toast
        </Button>
        <Button
          onClick={() =>
            show({ type: "info", message: "Just a simple info message" })
          }
        >
          Info Toast
        </Button>
      </div>
    </div>
  );
};

const meta: Meta<typeof ToastProvider> = {
  title: "UI/Toast",
  component: ToastProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const Interactive: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
