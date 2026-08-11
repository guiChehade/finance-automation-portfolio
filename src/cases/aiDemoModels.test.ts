import { describe, expect, it } from "vitest";
import {
  agentToolPermissions,
  getAgentCases,
  getAgentMetrics,
  getAgentTrace,
  getCopilotOutput,
} from "./aiDemoModels";

describe("AI variance copilot model", () => {
  it("requires cited and current evidence before approval", () => {
    const result = getCopilotOutput("revenue", "complete", "CFO Brief");

    expect(result.approvalReady).toBe(true);
    expect(result.citationCoverage).toBe(100);
    expect(result.claims.every((claim) => claim.evidenceIds.length > 0)).toBe(true);
    expect(result.evidence.every((item) => item.status === "Ready")).toBe(true);
  });

  it("blocks approval when evidence is stale or missing", () => {
    expect(getCopilotOutput("revenue", "stale", "CFO Brief").approvalReady).toBe(false);
    expect(getCopilotOutput("personnel", "missing-owner", "Regional Review").approvalReady).toBe(false);
  });
});

describe("AI finance controls agent model", () => {
  it("filters the review queue using the selected risk threshold", () => {
    const broadQueue = getAgentCases("baseline", 50);
    const narrowQueue = getAgentCases("baseline", 90);

    expect(broadQueue.length).toBeGreaterThan(narrowQueue.length);
    expect(narrowQueue.every((item) => item.risk >= 90)).toBe(true);
  });

  it("blocks prompt injection and never exposes a write permission", () => {
    const securityCase = getAgentCases("prompt-injection", 70).find((item) => item.id === "SEC-001");

    expect(securityCase?.status).toBe("Blocked");
    expect(getAgentTrace(securityCase!)[0].status).toBe("Blocked");
    expect(agentToolPermissions.some((permission) => permission.access.toLowerCase().includes("write"))).toBe(false);
  });

  it("keeps all close postings under human control", () => {
    expect(getAgentMetrics(getAgentCases("duplicate", 70)).autonomousPostings).toBe(0);
  });
});
