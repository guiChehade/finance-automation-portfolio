import { describe, expect, it } from "vitest";
import { cases } from "./cases";

describe("public portfolio cases", () => {
  it("publishes exactly three unique cases", () => {
    expect(cases).toHaveLength(3);
    expect(new Set(cases.map((item) => item.slug)).size).toBe(3);
  });

  it("keeps an explicit illustrative detail on every metric", () => {
    for (const item of cases) {
      expect(item.metrics).toHaveLength(4);
      for (const metric of item.metrics) {
        expect(metric.detail.toLowerCase()).toContain("illustrative");
      }
    }
  });

  it("does not expose employer names in public case content", () => {
    const publicContent = JSON.stringify(cases);
    for (const privateName of ["Kenvue", "Monks", "Bradesco", "Stone", "LATAM"]) {
      expect(publicContent).not.toContain(privateName);
    }
  });
});
