import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { useState } from "react";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

const InteractiveDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Profile editing form would go here.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDialog />,
};

export const StaticOpen: Story = {
  args: {
    open: true,
    children: (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Static Dialog</DialogTitle>
          <DialogDescription>
            This is a static representation of an open dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="h-20" />
      </DialogContent>
    ),
  },
};
