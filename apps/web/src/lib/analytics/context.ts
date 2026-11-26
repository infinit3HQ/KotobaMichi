type NavigatorExtras = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
  deviceMemory?: number;
  standalone?: boolean;
};

type Context = Record<string, string | number | boolean>;

/**
 * Device details PostHog does not collect itself. Browser, OS, device type, screen size,
 * language, timezone and GeoIP location (country, city) are added by PostHog already.
 */
export function deviceContext(): Context {
  if (typeof window === "undefined") return {};
  const nav = navigator as NavigatorExtras;
  const context: Context = {
    display_mode: window.matchMedia?.("(display-mode: standalone)").matches || nav.standalone ? "pwa" : "browser",
    color_scheme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    reduced_motion: Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
    touch_device: nav.maxTouchPoints > 0,
    pixel_ratio: window.devicePixelRatio || 1,
    cpu_cores: nav.hardwareConcurrency || 0,
    online: nav.onLine,
  };
  if (nav.connection?.effectiveType) context.connection_type = nav.connection.effectiveType;
  if (nav.connection?.saveData !== undefined) context.save_data = nav.connection.saveData;
  if (nav.deviceMemory) context.device_memory_gb = nav.deviceMemory;
  return context;
}
