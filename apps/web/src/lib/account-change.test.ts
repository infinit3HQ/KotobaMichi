import { describe, expect, it } from "vitest";
import { accountChanged } from "@/lib/account-change";

const alice = { id: "a", email: "a@example.test", role: "USER" as const };
const bob = { id: "b", email: "b@example.test", role: "USER" as const };

describe("accountChanged", () => {
  it("ignores restoring the saved session on load", () => {
    expect(accountChanged({ user: null, hydrated: false }, { user: alice, hydrated: false })).toBe(false);
  });

  it("detects sign-out", () => {
    expect(accountChanged({ user: alice, hydrated: true }, { user: null, hydrated: true })).toBe(true);
  });

  it("detects a different account signing in", () => {
    expect(accountChanged({ user: null, hydrated: true }, { user: bob, hydrated: true })).toBe(true);
    expect(accountChanged({ user: alice, hydrated: true }, { user: bob, hydrated: true })).toBe(true);
  });

  it("ignores updates to the same account", () => {
    expect(accountChanged({ user: alice, hydrated: true }, { user: { ...alice }, hydrated: true })).toBe(false);
  });
});
