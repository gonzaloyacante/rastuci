import type { Meta, StoryObj } from "@storybook/nextjs";
import { TrackingValidator } from "../../../components/tracking/TrackingValidator";
import React from "react";

// Mock fetch for Tracking
const FetchDecorator = (Story: any) => {
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const u = url.toString();
      if (u.includes("/api/shipping/tracking")) {
        if (u.includes("12345")) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                exists: true,
                trackingNumber: "12345",
                status: "EN_TRANSITO",
                description: "En camino a sucursal",
                lastUpdate: new Date().toISOString(),
              },
            }),
          } as Response;
        } else {
          return {
            ok: true,
            json: async () => ({
              success: false,
              error: "Tracking no encontrado ",
            }),
          } as Response;
        }
      }
      return originalFetch(url, init);
    };
    return () => {
      global.fetch = originalFetch;
    };
  }, []);
  return <Story />;
};

const meta: Meta<typeof TrackingValidator> = {
  title: "Public/Tracking/TrackingValidator",
  component: TrackingValidator,
  tags: ["autodocs"],
  decorators: [FetchDecorator],
};

export default meta;
type Story = StoryObj<typeof TrackingValidator>;

export const Default: Story = {
  args: {},
};
