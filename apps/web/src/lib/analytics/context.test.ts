import { afterEach, describe, expect, it, vi } from "vitest";
import { deviceContext } from "./context";

afterEach(() => vi.unstubAllGlobals());

describe("deviceContext", () => {
  it("is empty outside the browser", () => {
    expect(deviceContext()).toEqual({});
  });

  it("reads display mode, scheme and network details", () => {
    const matches = new Set(["(display-mode: standalone)", "(prefers-color-scheme: dark)"]);
    vi.stubGlobal("window", {
      matchMedia: (query: string) => ({ matches: matches.has(query) }),
      devicePixelRatio: 2,
    });
    vi.stubGlobal("navigator", {
      maxTouchPoints: 5,
      hardwareConcurrency: 8,
      onLine: true,
      deviceMemory: 4,
      connection: { effectiveType: "4g", saveData: false },
    });
    expect(deviceContext()).toEqual({
      display_mode: "pwa",
      color_scheme: "dark",
      reduced_motion: false,
      touch_device: true,
      pixel_ratio: 2,
      cpu_cores: 8,
      online: true,
      connection_type: "4g",
      save_data: false,
      device_memory_gb: 4,
    });
  });
});
