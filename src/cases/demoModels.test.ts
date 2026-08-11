import { describe, expect, it } from "vitest";
import {
  calculateForecast,
  forecastPresets,
  getForecastChanges,
  getPipelineQualityChecks,
  getPnlDrivers,
  getPnlSnapshot,
} from "./demoModels";

describe("interactive portfolio models", () => {
  it("keeps every P&L driver bridge reconciled to the selected variance", () => {
    const snapshot = getPnlSnapshot("Forecast", "Market", "All markets");
    for (const row of snapshot.rows) {
      const bridge = getPnlDrivers(row.id, row.variance);
      const bridgeTotal = bridge.reduce((sum, driver) => sum + driver.amount, 0);
      expect(bridgeTotal).toBeCloseTo(row.variance, 8);
    }
  });

  it("links forecast drivers to financial outcomes and change review", () => {
    const base = calculateForecast(forecastPresets.Base);
    const upside = calculateForecast(forecastPresets.Upside);
    expect(upside.revenue).toBeGreaterThan(base.revenue);
    expect(getForecastChanges(forecastPresets.Base, forecastPresets.Upside)).toHaveLength(5);
  });

  it("blocks the relevant pipeline control for each incident", () => {
    expect(getPipelineQualityChecks("healthy").every((check) => check.status !== "Failed")).toBe(true);
    for (const incident of ["schema", "mapping", "duplicate"] as const) {
      expect(getPipelineQualityChecks(incident).some((check) => check.status === "Failed")).toBe(true);
    }
  });
});
