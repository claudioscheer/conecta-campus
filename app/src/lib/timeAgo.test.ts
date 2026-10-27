import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "./timeAgo";

describe("formatTimeAgo", () => {
  const base = new Date("2026-10-26T20:00:00Z");

  it("returns 'agora' for timestamps within the last minute", () => {
    const recent = new Date("2026-10-26T19:59:45Z");
    expect(formatTimeAgo(recent, base)).toBe("agora");
  });

  it("returns minutes for timestamps within the last hour", () => {
    const min15 = new Date("2026-10-26T19:45:00Z");
    expect(formatTimeAgo(min15, base)).toBe("há 15 min");
  });

  it("returns hours for timestamps within the last 24 hours", () => {
    const hours3 = new Date("2026-10-26T17:00:00Z");
    expect(formatTimeAgo(hours3, base)).toBe("há 3h");
  });

  it("returns days for timestamps within the last week", () => {
    const days2 = new Date("2026-10-24T20:00:00Z");
    expect(formatTimeAgo(days2, base)).toBe("há 2d");
  });

  it("returns weeks for timestamps within the last 30 days", () => {
    const weeks2 = new Date("2026-10-12T20:00:00Z");
    expect(formatTimeAgo(weeks2, base)).toBe("há 2 sem");
  });

  it("returns formatted date for older timestamps", () => {
    const older = new Date("2026-05-10T12:00:00Z");
    expect(formatTimeAgo(older, base)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("handles string input safely", () => {
    expect(formatTimeAgo("2026-10-26T19:30:00Z", base)).toBe("há 30 min");
  });

  it("handles invalid date gracefully", () => {
    expect(formatTimeAgo("invalid-date", base)).toBe("");
  });
});
