/**
 * API: Health Check
 *
 * Tests for system health and connectivity logic.
 */

import { describe, it, expect } from "vitest";

describe("Health Check Tests", () => {
  interface ServiceHealth {
    status: "UP" | "DOWN" | "DEGRADED";
    latency: number;
  }

  const checkHealth = (services: ServiceHealth[]): "HEALTHY" | "UNHEALTHY" => {
    const isAnyDown = services.some((s) => s.status === "DOWN");
    if (isAnyDown) return "UNHEALTHY";
    return "HEALTHY";
  };

  const getAverageLatency = (services: ServiceHealth[]) => {
    if (!services.length) return 0;
    return services.reduce((acc, s) => acc + s.latency, 0) / services.length;
  };

  it("should report healthy if all up", () => {
    const services: ServiceHealth[] = [
      { status: "UP", latency: 50 },
      { status: "UP", latency: 30 },
    ];
    expect(checkHealth(services)).toBe("HEALTHY");
  });

  it("should report unhealthy if one down", () => {
    const services: ServiceHealth[] = [
      { status: "UP", latency: 50 },
      { status: "DOWN", latency: 0 },
    ];
    expect(checkHealth(services)).toBe("UNHEALTHY");
  });

  it("should report healthy even if degraded", () => {
    const services: ServiceHealth[] = [
      { status: "DEGRADED", latency: 500 },
      { status: "UP", latency: 30 },
    ];
    expect(checkHealth(services)).toBe("HEALTHY");
  });

  it("should calculate average latency", () => {
    const services: ServiceHealth[] = [
      { status: "UP", latency: 100 },
      { status: "UP", latency: 200 },
    ];
    expect(getAverageLatency(services)).toBe(150);
  });

  it("should handle empty services list", () => {
    expect(getAverageLatency([])).toBe(0);
  });
});
