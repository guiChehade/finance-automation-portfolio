import { describe, expect, it } from "vitest";
import {
  agentTrace,
  calculateIntegratedForecast,
  evaluateCopilot,
  forecastPresets,
  getCopilotCase,
  getPipelineRun,
  getPnlBridge,
  getPnlView,
  makeSecurityCase,
  pnlFacts,
} from "./portfolioModels";

describe("portfolio v4 financial models", () => {
  it("builds the P&L from granular dimensional facts", () => {
    expect(pnlFacts).toHaveLength(12 * 9 * 4 * 6);
    const view = getPnlView("Jun YTD", "Forecast", { market: "All markets", brand: "All brands", channel: "All channels" });
    const grossProfit = view.rows.find((row) => row.id === "gross-profit")!;
    const revenue = view.rows.find((row) => row.id === "revenue")!;
    const cogs = view.rows.find((row) => row.id === "cogs")!;
    const operatingIncome = view.rows.find((row) => row.id === "operating-income")!;
    expect(grossProfit.actual).toBeCloseTo(revenue.actual + cogs.actual, 4);
    expect(operatingIncome.actual / revenue.actual).toBeGreaterThan(0.05);
    expect(operatingIncome.actual / revenue.actual).toBeLessThan(0.3);
    expect(view.recordCount).toBe(6 * 9 * 4 * 6);
  });

  it("reconciles every variance bridge to the selected P&L line", () => {
    const filters = { market: "North", brand: "Elevate", channel: "E-commerce" };
    const view = getPnlView("June", "Budget", filters);
    for (const row of view.rows) {
      const bridge = getPnlBridge(row.id, row.variance, filters);
      expect(bridge.reduce((sum, driver) => sum + driver.amount, 0)).toBeCloseTo(row.variance, 5);
    }
  });

  it("connects workforce, capacity, revenue and costs in the forecast", () => {
    const base = calculateIntegratedForecast(forecastPresets.Base);
    const higherUtilization = calculateIntegratedForecast({ ...forecastPresets.Base, utilization: 82 });
    const higherWages = calculateIntegratedForecast({ ...forecastPresets.Base, wageInflation: 8 });
    expect(base.months).toHaveLength(12);
    expect(higherUtilization.totals.revenue).toBeGreaterThanOrEqual(base.totals.revenue);
    expect(higherWages.totals.employeeCost).toBeGreaterThan(base.totals.employeeCost);
    expect(base.totals.ebitda).toBeCloseTo(base.totals.revenue - base.totals.employeeCost - base.totals.contractorCost - base.totals.indirectCost, 4);
  });

  it("holds a failed pipeline and clears it after governed remediation", () => {
    const blocked = getPipelineRun("mapping", { schemaAlias: false, mappingResolved: false, dedupeRule: "none" });
    const remediated = getPipelineRun("mapping", { schemaAlias: false, mappingResolved: true, dedupeRule: "none" });
    expect(blocked.blocked).toBe(true);
    expect(blocked.reconciliation.some((row) => row.status === "Held")).toBe(true);
    expect(remediated.blocked).toBe(false);
    expect(remediated.checks.every((check) => check.status === "Passed")).toBe(true);
  });

  it("blocks Copilot distribution when evidence is stale or conflicting", () => {
    const complete = getCopilotCase("complete", "CFO Brief");
    const stale = getCopilotCase("stale", "CFO Brief");
    const conflicting = getCopilotCase("conflicting", "CFO Brief");
    expect(evaluateCopilot(complete.claims, complete.evidence).approvalReady).toBe(true);
    expect(evaluateCopilot(stale.claims, stale.evidence).approvalReady).toBe(false);
    expect(evaluateCopilot(conflicting.claims, conflicting.evidence).numericFailures).toHaveLength(1);
  });

  it("blocks prompt injection and exposes no write-capable action", () => {
    const securityCase = makeSecurityCase();
    const trace = agentTrace(securityCase);
    expect(securityCase.status).toBe("Blocked");
    expect(trace[0].status).toBe("Blocked");
    expect(trace.map((entry) => entry.detail).join(" ").toLowerCase()).not.toContain("posted journal");
  });
});
