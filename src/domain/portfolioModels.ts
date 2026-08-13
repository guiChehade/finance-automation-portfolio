export type Scenario = "Actual" | "Forecast" | "Budget" | "Prior year";
export type PnlLineId = "revenue" | "cogs" | "gross-profit" | "marketing" | "personnel" | "other-opex" | "operating-income";
export type PnlPeriod = "June" | "Jun YTD" | "FY Outlook";
export type PnlComparison = "Forecast" | "Budget" | "Prior year";
export type DriverClassification = "Recurring" | "Timing" | "One-off";

export const pnlLines: Array<{ id: PnlLineId; label: string; derived?: boolean }> = [
  { id: "revenue", label: "Net revenue" },
  { id: "cogs", label: "Cost of goods sold" },
  { id: "gross-profit", label: "Gross profit", derived: true },
  { id: "marketing", label: "Marketing investment" },
  { id: "personnel", label: "Personnel costs" },
  { id: "other-opex", label: "Other operating expenses" },
  { id: "operating-income", label: "Operating income", derived: true },
];

export const markets = [
  { name: "North", weight: 0.18, price: 0.018, volume: 0.035, fx: 0.012, cost: 0.006 },
  { name: "Northeast", weight: 0.13, price: 0.006, volume: 0.052, fx: -0.008, cost: 0.012 },
  { name: "Central", weight: 0.16, price: 0.027, volume: -0.018, fx: 0.018, cost: 0.021 },
  { name: "Southeast", weight: 0.17, price: 0.031, volume: 0.021, fx: 0.004, cost: 0.009 },
  { name: "South", weight: 0.11, price: -0.004, volume: -0.041, fx: -0.013, cost: 0.026 },
  { name: "Coastal", weight: 0.08, price: 0.014, volume: 0.064, fx: 0.022, cost: 0.004 },
  { name: "Andes", weight: 0.07, price: 0.009, volume: -0.027, fx: -0.025, cost: 0.018 },
  { name: "Atlantic", weight: 0.06, price: 0.024, volume: 0.012, fx: 0.031, cost: 0.015 },
  { name: "Pacific", weight: 0.04, price: -0.011, volume: 0.083, fx: -0.019, cost: 0.029 },
] as const;

export const brands = [
  { name: "Elevate", weight: 0.37, price: 54, trend: 0.032, cogs: 0.47, marketing: 0.09 },
  { name: "ClearSpring", weight: 0.28, price: 43, trend: 0.008, cogs: 0.51, marketing: 0.075 },
  { name: "LumaCare", weight: 0.21, price: 38, trend: -0.024, cogs: 0.55, marketing: 0.068 },
  { name: "NovaDerm", weight: 0.14, price: 67, trend: 0.049, cogs: 0.43, marketing: 0.11 },
] as const;

export const channels = [
  { name: "Pharmacy", weight: 0.31, trend: 0.044, discount: 0.975 },
  { name: "Grocery", weight: 0.22, trend: -0.018, discount: 0.94 },
  { name: "E-commerce", weight: 0.17, trend: 0.092, discount: 1.015 },
  { name: "Wholesale", weight: 0.14, trend: -0.034, discount: 0.89 },
  { name: "Specialty", weight: 0.10, trend: 0.026, discount: 1.08 },
  { name: "Direct", weight: 0.06, trend: 0.061, discount: 1.12 },
] as const;

type BaseLineValues = Record<Exclude<PnlLineId, "gross-profit" | "operating-income">, number>;
type FullLineValues = Record<PnlLineId, number>;
type PnlFact = {
  month: number;
  market: string;
  brand: string;
  channel: string;
  values: Record<Scenario, BaseLineValues>;
};

const seasonality = [0.91, 0.94, 0.99, 1.02, 1.07, 1.13, 0.96, 0.98, 1.03, 1.08, 1.12, 1.18];

function round(value: number, precision = 6) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function makeValues(
  month: number,
  market: (typeof markets)[number],
  brand: (typeof brands)[number],
  channel: (typeof channels)[number],
  scenario: Scenario,
): BaseLineValues {
  const scenarioConfig = {
    Actual: { price: 1 + market.price + market.fx, volume: 1 + market.volume + brand.trend + channel.trend, cost: 1 + market.cost, marketing: 1.02 },
    Forecast: { price: 1.021, volume: 1 + brand.trend * 0.55 + channel.trend * 0.45, cost: 1.012, marketing: 1 },
    Budget: { price: 1.016, volume: 1.018, cost: 0.998, marketing: 0.985 },
    "Prior year": { price: 0.974, volume: 0.981, cost: 0.97, marketing: 0.94 },
  }[scenario];
  const mix = market.weight * brand.weight * channel.weight;
  const monthlyVolume = 0.475 * mix * seasonality[month - 1] * scenarioConfig.volume;
  const price = brand.price * channel.discount * scenarioConfig.price;
  const revenue = monthlyVolume * price;
  const cogs = -revenue * brand.cogs * scenarioConfig.cost;
  const marketing = -revenue * brand.marketing * scenarioConfig.marketing;
  const personnel = -(4.55 * market.weight * brand.weight * channel.weight * (0.92 + month * 0.014)) * (scenario === "Actual" ? 1.018 : scenario === "Prior year" ? 0.94 : 1);
  const otherOpex = -(2.15 * market.weight * brand.weight * channel.weight * (0.96 + channel.weight * 0.7)) * (scenario === "Actual" ? 1.006 : scenario === "Budget" ? 0.985 : scenario === "Prior year" ? 0.93 : 1);
  return { revenue: round(revenue), cogs: round(cogs), marketing: round(marketing), personnel: round(personnel), "other-opex": round(otherOpex) };
}

export const pnlFacts: PnlFact[] = Array.from({ length: 12 }, (_, index) => index + 1).flatMap((month) =>
  markets.flatMap((market) => brands.flatMap((brand) => channels.map((channel) => ({
    month,
    market: market.name,
    brand: brand.name,
    channel: channel.name,
    values: {
      Actual: makeValues(month, market, brand, channel, "Actual"),
      Forecast: makeValues(month, market, brand, channel, "Forecast"),
      Budget: makeValues(month, market, brand, channel, "Budget"),
      "Prior year": makeValues(month, market, brand, channel, "Prior year"),
    },
  })))),
);

export type PnlFilters = { market: string; brand: string; channel: string };

function periodMonths(period: PnlPeriod) {
  if (period === "June") return [6];
  if (period === "Jun YTD") return [1, 2, 3, 4, 5, 6];
  return Array.from({ length: 12 }, (_, index) => index + 1);
}

function addDerived(values: BaseLineValues): FullLineValues {
  const grossProfit = values.revenue + values.cogs;
  const operatingIncome = grossProfit + values.marketing + values.personnel + values["other-opex"];
  return { ...values, "gross-profit": round(grossProfit), "operating-income": round(operatingIncome) };
}

function aggregateFacts(facts: PnlFact[], scenario: Scenario, period: PnlPeriod): FullLineValues {
  const base: BaseLineValues = { revenue: 0, cogs: 0, marketing: 0, personnel: 0, "other-opex": 0 };
  const values = facts.reduce((sum, fact) => {
    const selectedScenario: Scenario = period === "FY Outlook" && fact.month > 6 && scenario === "Actual" ? "Forecast" : scenario;
    const current = fact.values[selectedScenario];
    sum.revenue += current.revenue;
    sum.cogs += current.cogs;
    sum.marketing += current.marketing;
    sum.personnel += current.personnel;
    sum["other-opex"] += current["other-opex"];
    return sum;
  }, base);
  return addDerived({
    revenue: round(values.revenue),
    cogs: round(values.cogs),
    marketing: round(values.marketing),
    personnel: round(values.personnel),
    "other-opex": round(values["other-opex"]),
  });
}

export function getPnlView(period: PnlPeriod, comparison: PnlComparison, filters: PnlFilters) {
  const months = periodMonths(period);
  const filtered = pnlFacts.filter((fact) => months.includes(fact.month)
    && (filters.market === "All markets" || fact.market === filters.market)
    && (filters.brand === "All brands" || fact.brand === filters.brand)
    && (filters.channel === "All channels" || fact.channel === filters.channel));
  const actual = aggregateFacts(filtered, "Actual", period);
  const plan = aggregateFacts(filtered, comparison, period);
  const rows = pnlLines.map((line) => ({
    ...line,
    actual: actual[line.id],
    plan: plan[line.id],
    variance: round(actual[line.id] - plan[line.id]),
    variancePercent: Math.abs(plan[line.id]) > 0.001 ? ((actual[line.id] - plan[line.id]) / Math.abs(plan[line.id])) * 100 : 0,
  }));
  const trend = periodMonths("FY Outlook").map((month) => {
    const monthFacts = pnlFacts.filter((fact) => fact.month === month
      && (filters.market === "All markets" || fact.market === filters.market)
      && (filters.brand === "All brands" || fact.brand === filters.brand)
      && (filters.channel === "All channels" || fact.channel === filters.channel));
    const actualMonth = aggregateFacts(monthFacts, month <= 6 ? "Actual" : "Forecast", "June");
    const comparisonMonth = aggregateFacts(monthFacts, comparison, "June");
    return { month: new Date(2026, month - 1).toLocaleString("en-US", { month: "short" }), Actual: actualMonth.revenue, Comparison: comparisonMonth.revenue };
  });
  return { rows, actual, plan, trend, recordCount: filtered.length };
}

export type PnlBridgeDriver = {
  id: string;
  label: string;
  amount: number;
  owner: string;
  evidence: string;
  action: string;
  defaultClassification: DriverClassification;
};

export function getPnlBridge(lineId: PnlLineId, variance: number, filters: PnlFilters): PnlBridgeDriver[] {
  const context = filters.market !== "All markets" ? filters.market : filters.brand !== "All brands" ? filters.brand : "portfolio";
  const templates: Record<PnlLineId, Array<Omit<PnlBridgeDriver, "amount"> & { share: number }>> = {
    revenue: [
      { id: "price", label: "Realized price", share: 0.42, owner: "Commercial Finance", evidence: `Invoice-level price realization in ${context}`, action: "Validate persistence by customer group", defaultClassification: "Recurring" },
      { id: "volume", label: "Volume", share: 0.31, owner: "Demand Planning", evidence: `Units and service level by channel in ${context}`, action: "Reconcile sell-in with customer inventory", defaultClassification: "Recurring" },
      { id: "mix", label: "Portfolio mix", share: -0.14, owner: "Category Finance", evidence: "Premium mix and channel contribution", action: "Rebalance campaign and channel mix", defaultClassification: "Recurring" },
      { id: "fx", label: "FX translation", share: 0.41, owner: "Regional FP&A", evidence: "Reported and constant-currency bridge", action: "Separate translation from operational guidance", defaultClassification: "One-off" },
    ],
    cogs: [
      { id: "materials", label: "Materials", share: 0.49, owner: "Supply Finance", evidence: "Purchase price variance by material family", action: "Refresh the input-cost curve", defaultClassification: "Recurring" },
      { id: "freight", label: "Premium freight", share: 0.27, owner: "Logistics Finance", evidence: "Expedite cost across affected lanes", action: "Confirm normalization after service recovery", defaultClassification: "Timing" },
      { id: "productivity", label: "Productivity", share: -0.22, owner: "Manufacturing Finance", evidence: "Yield and labor efficiency by site", action: "Validate replication at lower-performing sites", defaultClassification: "Recurring" },
      { id: "sourcing", label: "Sourcing mix", share: 0.46, owner: "Procurement Finance", evidence: "Outsourced SKU conversion cost", action: "Update the sourcing baseline", defaultClassification: "Recurring" },
    ],
    "gross-profit": [], marketing: [], personnel: [], "other-opex": [], "operating-income": [],
  };
  const lineTemplates = templates[lineId].length ? templates[lineId] : [
    { id: "commercial", label: lineId === "operating-income" ? "Commercial delivery" : "Run-rate movement", share: 0.38, owner: "Commercial Finance", evidence: "Reconciled revenue and margin detail", action: "Validate persistence in the latest estimate", defaultClassification: "Recurring" as const },
    { id: "cost", label: "Cost performance", share: 0.27, owner: "Operations Finance", evidence: "Rate, volume and productivity bridge", action: "Lock confirmed savings into the baseline", defaultClassification: "Recurring" as const },
    { id: "phasing", label: "Timing / phasing", share: 0.19, owner: "Regional FP&A", evidence: "Monthly phasing and commitment calendar", action: "Rephase the remaining forecast", defaultClassification: "Timing" as const },
    { id: "one-off", label: "One-off items", share: 0.16, owner: "Corporate FP&A", evidence: "Journal and contract-level review", action: "Exclude from run-rate guidance", defaultClassification: "One-off" as const },
  ];
  let allocated = 0;
  return lineTemplates.map((template, index) => {
    const amount = index === lineTemplates.length - 1 ? round(variance - allocated) : round(variance * template.share);
    allocated += amount;
    const { share: _share, ...rest } = template;
    return { ...rest, amount };
  });
}

export type ForecastDrivers = {
  priceGrowth: number;
  pipelineConversion: number;
  utilization: number;
  plannedHires: number;
  attrition: number;
  wageInflation: number;
  contractorMix: number;
  discretionarySpend: number;
};

export type ForecastPreset = "Base" | "Upside" | "Downside";

export const forecastPresets: Record<ForecastPreset, ForecastDrivers> = {
  Base: { priceGrowth: 3.5, pipelineConversion: 42, utilization: 74, plannedHires: 24, attrition: 9, wageInflation: 4, contractorMix: 14, discretionarySpend: 3.2 },
  Upside: { priceGrowth: 5, pipelineConversion: 51, utilization: 81, plannedHires: 34, attrition: 7, wageInflation: 4.5, contractorMix: 11, discretionarySpend: 3.5 },
  Downside: { priceGrowth: 1, pipelineConversion: 31, utilization: 67, plannedHires: 10, attrition: 13, wageInflation: 5.5, contractorMix: 23, discretionarySpend: 2.4 },
};

const actualMonths = [
  { month: "Jan", revenue: 7.1, employeeCost: 3.73, contractorCost: 0.68, indirectCost: 1.46, headcount: 408 },
  { month: "Feb", revenue: 7.4, employeeCost: 3.78, contractorCost: 0.66, indirectCost: 1.45, headcount: 412 },
  { month: "Mar", revenue: 7.7, employeeCost: 3.81, contractorCost: 0.71, indirectCost: 1.49, headcount: 415 },
  { month: "Apr", revenue: 7.9, employeeCost: 3.86, contractorCost: 0.72, indirectCost: 1.51, headcount: 419 },
  { month: "May", revenue: 8.2, employeeCost: 3.91, contractorCost: 0.73, indirectCost: 1.53, headcount: 423 },
  { month: "Jun", revenue: 8.5, employeeCost: 3.96, contractorCost: 0.75, indirectCost: 1.54, headcount: 428 },
];

export function calculateIntegratedForecast(drivers: ForecastDrivers) {
  let headcount = 428;
  const futureMonths = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => {
    const hires = drivers.plannedHires / 6;
    const exits = headcount * (drivers.attrition / 100 / 12);
    headcount = headcount + hires - exits;
    const contractorFte = headcount * drivers.contractorMix / 100;
    const availableCapacity = (headcount + contractorFte) * 168 * drivers.utilization / 100;
    const baseDemand = 8.55 + index * 0.24;
    const commercialDemand = baseDemand * (1 + drivers.priceGrowth / 100) * (0.79 + drivers.pipelineConversion / 200);
    const capacityRevenue = availableCapacity * 0.000159;
    const revenue = Math.min(commercialDemand, capacityRevenue);
    const employeeCost = headcount * 0.00935 * (1 + drivers.wageInflation / 100);
    const contractorCost = contractorFte * 0.0131;
    const indirectCost = 1.36 + revenue * 0.018 + drivers.discretionarySpend / 6;
    const ebitda = revenue - employeeCost - contractorCost - indirectCost;
    return {
      month, revenue: round(revenue), demand: round(commercialDemand), capacityRevenue: round(capacityRevenue), employeeCost: round(employeeCost),
      contractorCost: round(contractorCost), indirectCost: round(indirectCost), ebitda: round(ebitda), headcount: Math.round(headcount), utilization: drivers.utilization,
    };
  });
  const months = [...actualMonths.map((month) => ({ ...month, demand: month.revenue, capacityRevenue: month.revenue, ebitda: round(month.revenue - month.employeeCost - month.contractorCost - month.indirectCost), utilization: 73 })), ...futureMonths];
  const totals = months.reduce((sum, month) => ({
    revenue: sum.revenue + month.revenue,
    employeeCost: sum.employeeCost + month.employeeCost,
    contractorCost: sum.contractorCost + month.contractorCost,
    indirectCost: sum.indirectCost + month.indirectCost,
    ebitda: sum.ebitda + month.ebitda,
  }), { revenue: 0, employeeCost: 0, contractorCost: 0, indirectCost: 0, ebitda: 0 });
  const margin = totals.revenue ? totals.ebitda / totals.revenue * 100 : 0;
  const capacityGap = futureMonths.reduce((sum, month) => sum + (month.capacityRevenue - month.demand), 0);
  const guardrails = [
    { id: "margin", label: "EBITDA margin >= 14%", pass: margin >= 14, value: `${margin.toFixed(1)}%` },
    { id: "utilization", label: "Utilization between 68% and 82%", pass: drivers.utilization >= 68 && drivers.utilization <= 82, value: `${drivers.utilization}%` },
    { id: "capacity", label: "Capacity funds commercial demand", pass: capacityGap >= -0.4, value: `${capacityGap >= 0 ? "+" : ""}${capacityGap.toFixed(1)}M` },
  ];
  return { months, totals: { ...totals, margin, productivity: totals.revenue * 1000 / futureMonths.at(-1)!.headcount }, guardrails, capacityGap };
}

export function getForecastChanges(previous: ForecastDrivers, current: ForecastDrivers) {
  const labels: Record<keyof ForecastDrivers, { label: string; unit: string }> = {
    priceGrowth: { label: "Price growth", unit: "%" }, pipelineConversion: { label: "Pipeline conversion", unit: "%" }, utilization: { label: "Utilization", unit: "%" },
    plannedHires: { label: "Planned hires", unit: " FTE" }, attrition: { label: "Attrition", unit: "%" }, wageInflation: { label: "Wage inflation", unit: "%" },
    contractorMix: { label: "Contractor mix", unit: "%" }, discretionarySpend: { label: "Discretionary spend", unit: "M" },
  };
  return (Object.keys(labels) as Array<keyof ForecastDrivers>).filter((key) => previous[key] !== current[key]).map((key) => ({ key, ...labels[key], previous: previous[key], current: current[key] }));
}

export type PipelineScenario = "healthy" | "schema" | "mapping" | "duplicate";
export type PipelineRemediation = { schemaAlias: boolean; mappingResolved: boolean; dedupeRule: "none" | "latest-approved" | "source-priority" };

export const pipelineScenarioLabels: Record<PipelineScenario, string> = { healthy: "Healthy run", schema: "Schema drift", mapping: "Missing mappings", duplicate: "Duplicate business keys" };

export function getPipelineRun(scenario: PipelineScenario, remediation: PipelineRemediation) {
  const schemaFailed = scenario === "schema" && !remediation.schemaAlias;
  const mappingFailed = scenario === "mapping" && !remediation.mappingResolved;
  const duplicateFailed = scenario === "duplicate" && remediation.dedupeRule === "none";
  const blocked = schemaFailed || mappingFailed || duplicateFailed;
  const checks = [
    { id: "freshness", label: "Source freshness", status: "Passed", evidence: "5/5 contracts under 30 minutes", impact: 0 },
    { id: "schema", label: "Schema conformance", status: schemaFailed ? "Failed" : "Passed", evidence: schemaFailed ? "2 incompatible Workday fields" : remediation.schemaAlias ? "2 aliases approved" : "126/126 fields accepted", impact: schemaFailed ? 0.46 : 0 },
    { id: "uniqueness", label: "Business-key uniqueness", status: duplicateFailed ? "Failed" : "Passed", evidence: duplicateFailed ? "14 duplicated CRM opportunities" : remediation.dedupeRule !== "none" ? `14 resolved by ${remediation.dedupeRule}` : "3 late duplicates quarantined", impact: duplicateFailed ? 0.66 : 0 },
    { id: "mapping", label: "Master-data coverage", status: mappingFailed ? "Failed" : "Passed", evidence: mappingFailed ? "23 cost centers without owner" : remediation.mappingResolved ? "23 mappings completed" : "100% hierarchy coverage", impact: mappingFailed ? 0.66 : 0 },
    { id: "reconciliation", label: "Financial reconciliation", status: blocked ? "Held" : "Passed", evidence: blocked ? "Last approved snapshot retained" : "99.98% auto-matched; 7 reviewed", impact: blocked ? 0.66 : 0.02 },
  ] as const;
  const reconciliation = [
    { area: "Net revenue", source: 96.42, mart: duplicateFailed ? 97.08 : 96.42, exceptions: duplicateFailed ? 14 : 0 },
    { area: "Personnel costs", source: 47.18, mart: schemaFailed ? 46.72 : 47.18, exceptions: schemaFailed ? 2 : 0 },
    { area: "Indirect costs", source: 34.77, mart: mappingFailed ? 34.11 : 34.77, exceptions: mappingFailed ? 23 : 0 },
    { area: "Intercompany markup", source: 8.26, mart: 8.26, exceptions: 0 },
  ].map((row) => ({ ...row, delta: round(row.mart - row.source), status: Math.abs(row.mart - row.source) <= 0.02 ? "Matched" : "Held" }));
  return { blocked, checks, reconciliation, version: blocked ? "2026.06.2" : "2026.06.3", rowsProcessed: 2_842_116 };
}

export const mappingRecords = Array.from({ length: 23 }, (_, index) => ({
  id: `CC-${7410 + index}`,
  entity: ["North Operations", "Central Services", "Corporate"][index % 3],
  department: ["Customer Growth", "Delivery", "Technology", "People"][index % 4],
  owner: index < 4 ? "" : ["A. Rivera", "M. Chen", "S. Patel"][index % 3],
  effectiveDate: index < 2 ? "" : "2026-06-01",
}));

export type EvidenceStatus = "Ready" | "Stale" | "Missing" | "Conflicting";
export type CopilotScenario = "complete" | "stale" | "missing-owner" | "conflicting";
export type CopilotMode = "CFO Brief" | "Regional Review" | "Email Summary";
export type CopilotClaim = { id: string; text: string; value: number; evidenceIds: string[]; material: boolean };

export function getCopilotCase(scenario: CopilotScenario, mode: CopilotMode) {
  const evidence = [
    { id: "E-401", source: "P&L mart", detail: "Operating income actual and forecast", value: 2.1, refreshed: "08:42 UTC", status: "Ready" as EvidenceStatus },
    { id: "E-402", source: "Driver model", detail: "Price, volume and productivity bridge", value: 1.5, refreshed: "08:37 UTC", status: "Ready" as EvidenceStatus },
    { id: "E-403", source: "Supply workpaper", detail: "Site-level yield and conversion cost", value: 0.8, refreshed: "08:34 UTC", status: "Ready" as EvidenceStatus },
    { id: "E-404", source: "Business input", detail: "Owner assessment and outlook implication", value: -0.4, refreshed: "08:31 UTC", status: "Ready" as EvidenceStatus },
    { id: "E-405", source: "Close controls", detail: "Reconciliation and materiality result", value: 2.1, refreshed: "08:44 UTC", status: "Ready" as EvidenceStatus },
  ];
  if (scenario === "stale") evidence[3] = { ...evidence[3], refreshed: "8 days ago", status: "Stale" };
  if (scenario === "missing-owner") evidence[3] = { ...evidence[3], detail: "Owner assessment not submitted", refreshed: "Not available", status: "Missing" };
  if (scenario === "conflicting") evidence[2] = { ...evidence[2], value: 0.2, detail: "Site workpaper conflicts with approved driver model", status: "Conflicting" };
  const modeLead = mode === "CFO Brief" ? "Operating income finished $2.1M above forecast" : mode === "Regional Review" ? "North and Central drove the operating-income upside" : "June performance closed above forecast";
  const claims: CopilotClaim[] = [
    { id: "C-01", text: `${modeLead}, with commercial delivery outweighing cost timing.`, value: 2.1, evidenceIds: ["E-401", "E-405"], material: true },
    { id: "C-02", text: "Price and volume contributed $1.5M of incremental operating income.", value: 1.5, evidenceIds: ["E-402"], material: true },
    { id: "C-03", text: "Supply productivity contributed $0.8M and is supported by site-level yield data.", value: 0.8, evidenceIds: ["E-403"], material: true },
    { id: "C-04", text: "Earlier marketing activity reduced the period benefit by $0.4M.", value: -0.4, evidenceIds: ["E-404"], material: false },
  ];
  return { evidence, claims, action: "Separate structural improvements from timing before updating full-year guidance." };
}

export function evaluateCopilot(claims: CopilotClaim[], evidence: ReturnType<typeof getCopilotCase>["evidence"]) {
  const evidenceMap = new Map(evidence.map((item) => [item.id, item]));
  const missingIds = claims.flatMap((claim) => claim.evidenceIds.filter((id) => !evidenceMap.has(id)));
  const invalidEvidence = evidence.filter((item) => item.status !== "Ready");
  const numericFailures = claims.filter((claim) => claim.evidenceIds.every((id) => {
    const item = evidenceMap.get(id);
    return !item || Math.abs(Math.abs(item.value) - Math.abs(claim.value)) > 0.31;
  }));
  const citationCoverage = claims.length ? claims.filter((claim) => claim.evidenceIds.every((id) => evidenceMap.has(id))).length / claims.length * 100 : 0;
  const approvalReady = missingIds.length === 0 && invalidEvidence.length === 0 && numericFailures.length === 0;
  return {
    approvalReady,
    missingIds,
    invalidEvidence,
    numericFailures,
    scores: [
      { label: "Groundedness", score: invalidEvidence.length ? 78 : 98, target: 95 },
      { label: "Citation coverage", score: citationCoverage, target: 100 },
      { label: "Numerical consistency", score: numericFailures.length ? 62 : 100, target: 100 },
      { label: "Materiality", score: 97, target: 90 },
      { label: "Data safety", score: 100, target: 100 },
    ],
  };
}

export type AgentCaseStatus = "Ready for review" | "Needs evidence" | "Waiting for evidence" | "Escalated" | "Approved" | "False positive" | "Blocked";
export type AgentCase = { id: string; type: string; entity: string; amount: number; risk: number; status: AgentCaseStatus; description: string; recommendation: string; evidence: string[] };

const agentTypes = [
  ["Potential duplicate", "Two invoices share supplier, amount and service period.", "Hold the newer invoice and confirm the source document with AP."],
  ["Accrual mismatch", "Service receipt is above the posted month-end accrual.", "Review an accrual increase with the cost-center owner."],
  ["Account mapping", "A software charge is mapped to professional services.", "Request contract metadata before proposing reclassification."],
  ["FX outlier", "Intercompany translation differs from the approved close rate.", "Recalculate with the approved treasury rate and compare the journal delta."],
  ["PO timing", "An open purchase order has no current-period receipt.", "Confirm delivery timing; no close adjustment is supported yet."],
] as const;

export const initialAgentCases: AgentCase[] = Array.from({ length: 18 }, (_, index) => {
  const template = agentTypes[index % agentTypes.length];
  const risk = 96 - index * 3;
  return {
    id: `${["DUP", "ACC", "MAP", "FX", "PO"][index % 5]}-${204 + index}`,
    type: template[0], entity: ["North Operations", "Central Services", "Corporate", "South Trading"][index % 4], amount: 28_000 + index * 13_000,
    risk, status: index % 4 === 2 ? "Needs evidence" : "Ready for review", description: template[1], recommendation: template[2],
    evidence: ["ERP journal and source-document match", "Approved policy retrieved", "Prior reviewer decision available"],
  };
});

export const agentToolPermissions = [
  { tool: "ERP journal search", access: "Read only", purpose: "Inspect postings and document references" },
  { tool: "Policy retrieval", access: "Read only", purpose: "Retrieve approved accounting guidance" },
  { tool: "Close history", access: "Read only", purpose: "Compare prior reviewer decisions" },
  { tool: "Workflow queue", access: "Recommend only", purpose: "Draft a review action for a human owner" },
] as const;

export function agentTrace(item: AgentCase) {
  if (item.id === "SEC-001") return [
    { step: "Detect", detail: "Classified untrusted instruction inside supplier-provided content.", status: "Blocked" },
    { step: "Isolate", detail: "Removed the document from retrieval context.", status: "Complete" },
    { step: "Enforce", detail: "Rejected the requested journal action because no write tool exists.", status: "Complete" },
    { step: "Escalate", detail: "Prepared a security event for human review.", status: "Ready" },
  ];
  return [
    { step: "Detect", detail: `${item.type} scored ${item.risk}/100 using rules and anomaly signals.`, status: "Complete" },
    { step: "Retrieve", detail: "Matched the exception to approved close policy and prior reviewed cases.", status: "Complete" },
    { step: "Investigate", detail: `Queried read-only evidence for ${item.entity}.`, status: "Complete" },
    { step: "Recommend", detail: item.recommendation, status: item.status === "Needs evidence" ? "Needs evidence" : "Ready" },
  ];
}

export function makeSecurityCase(): AgentCase {
  return { id: "SEC-001", type: "Prompt injection", entity: "External document", amount: 0, risk: 100, status: "Blocked", description: "A supplier memo attempted to override policy and request a journal posting.", recommendation: "Quarantine the document and escalate the security event. Do not execute instructions.", evidence: ["Untrusted instruction detected", "Write action outside permissions", "Input isolated before retrieval"] };
}
