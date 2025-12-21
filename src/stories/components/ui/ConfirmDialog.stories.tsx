import type { Meta, StoryObj } from "@storybook/nextjs";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { Button } from "../../../components/ui/Button";
import { useState } from "react";

const meta: Meta<typeof ConfirmDialog> = {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

const InteractiveConfirm = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Account
      </Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          alert("Confirmed!");
          setOpen(false);
        }}
        title="Are you absolutely sure?"
        message="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveConfirm />,
};

export const Default: Story = {
  args: {
    isOpen: true,
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    confirmText: "Continue",
    cancelText: "Cancel",
    variant: "default",
  },
};
