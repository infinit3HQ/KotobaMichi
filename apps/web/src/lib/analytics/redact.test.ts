import { describe, expect, it } from "vitest";
import { redactEvent, redactUrl } from "./redact";

describe("redactUrl", () => {
  it("redacts reset and verify tokens", () => {
    expect(redactUrl("https://x.dev/reset-password?token=abc123")).toBe("https://x.dev/reset-password?token=REDACTED");
    expect(redactUrl("/verify-email?lang=en&token=abc#top")).toBe("/verify-email?lang=en&token=REDACTED#top");
  });

  it("redacts oauth codes and keeps other params", () => {
    expect(redactUrl("/cb?code=xyz&state=1")).toBe("/cb?code=REDACTED&state=1");
  });

  it("leaves unrelated urls and look-alike params alone", () => {
    expect(redactUrl("/words?q=token")).toBe("/words?q=token");
    expect(redactUrl("/x?mytoken=1")).toBe("/x?mytoken=1");
  });
});

describe("redactEvent", () => {
  it("scrubs properties and person props without touching the input", () => {
    const event = {
      event: "$pageview",
      properties: { $current_url: "https://x.dev/verify-email?token=t1", count: 2 },
      $set_once: { $initial_current_url: "https://x.dev/reset-password?token=t2" },
    };
    const out = redactEvent(event);
    expect(out.properties?.$current_url).toBe("https://x.dev/verify-email?token=REDACTED");
    expect(out.properties?.count).toBe(2);
    expect(out.$set_once?.$initial_current_url).toBe("https://x.dev/reset-password?token=REDACTED");
    expect(event.properties.$current_url).toBe("https://x.dev/verify-email?token=t1");
  });
});
