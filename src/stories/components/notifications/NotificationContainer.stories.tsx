import type { Meta, StoryObj } from "@storybook/nextjs";
import { NotificationContainer } from "../../../components/notifications/NotificationContainer";
import {
  NotificationProvider,
  useNotifications,
} from "../../../context/NotificationContext";
import { useEffect } from "react";

const NotificationTrigger = () => {
  const { addNotification } = useNotifications();
  useEffect(() => {
    addNotification({
      type: "success",
      title: "Operación Exitosa",
      message: "Los cambios se guardaron correctamente.",
    });
    setTimeout(() => {
      addNotification({
        type: "error",
        title: "Error de Conexión",
        message: "No se pudo conectar con el servidor.",
      });
    }, 500);
    setTimeout(() => {
      addNotification({
        type: "info",
        message: "Tienes un mensaje nuevo.",
      });
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4">Las notificaciones aparecen automáticamente...</div>
  );
};

const meta: Meta<typeof NotificationContainer> = {
  title: "Public/Notifications/NotificationContainer",
  component: NotificationContainer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NotificationProvider>
        <Story />
        <NotificationTrigger />
      </NotificationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NotificationContainer>;

export const Demo: Story = {
  args: {},
};
