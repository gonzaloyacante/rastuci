import type { Meta, StoryObj } from "@storybook/nextjs";
import { UserForm } from "../../../components/forms/UserForm";

const meta: Meta<typeof UserForm> = {
  title: "Admin/Forms/UserForm",
  component: UserForm,
  tags: ["autodocs"],
  argTypes: {
    onSubmit: { action: "submitted" },
    onCancel: { action: "cancelled" },
  },
};

export default meta;
type Story = StoryObj<typeof UserForm>;

export const CreateUser: Story = {
  args: {
    user: null,
    loading: false,
    isEdit: false,
  },
};

export const EditUser: Story = {
  args: {
    user: {
      id: "1",
      name: "Gonzalo Yacante",
      email: "gonzalo@example.com",
      isAdmin: true,
    },
    loading: false,
    isEdit: true,
  },
};

export const Loading: Story = {
  args: {
    user: null,
    loading: true,
    isEdit: false,
  },
};
