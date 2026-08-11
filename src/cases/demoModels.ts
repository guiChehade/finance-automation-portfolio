export type PnlComparison = "Forecast" | "Budget";
export type PnlDimension = "Market" | "Brand" | "Owner";
export type PnlLineId =
  | "revenue"
  | "cogs"
  | "gross-profit"
  | "marketing"
  | "personnel"
  | "other-opex"
  | "operating-income";

type ScopeMember = {
  label: string;
  multiplier: number;
};

export const pnlDimensionMembers: Record<PnlDimension, ScopeMember[]> = {
  Market: [
    { label: "All markets", multiplier: 1 },
    { label: "North", multiplier: 0.42 },
    { label: "Central", multiplier: 0.33 },
    { label: "South", multiplier: 0.25 },
  ],
  Brand: [
    { label: "All brands", multiplier: 1 },
    { label: "Elevate", multiplier: 0.37 },
    { label: "ClearSpring", multiplier: 0.28 },
    { label: "LumaCare", multiplier: 0.21 },
    { label: "NovaDerm", multiplier: 0.14 },
  ],
  Owner: [
    { label: "All owners", multiplier: 1 },
    { label: "Commercial", multiplier: 0.32 },
    { label: "Supply", multiplier: 0.29 },
    { label: "Marketing", multiplier: 0.22 },
    { label: "G&A", multiplier: 0.17 },
  ],
};

type StatementValues = Record<PnlLineId, number>;

const actualStatement: StatementValues = {
  revenue: 128.4,
  cogs: -69.3,
  "gross-profit": 59.1,
  marketing: -14.8,
  personnel: -16.4,
  "other-opex": -8.7,
  "operating-income": 19.2,
};

const comparisonStatements: Record<PnlComparison, StatementValues> = {
  Forecast: {
    revenue: 124.5,
    cogs: -68.1,
    "gross-profit": 56.4,
    marketing: -14.4,
    personnel: -16.1,
    "other-opex": -8.8,
    "operating-income": 17.1,
  },
  Budget: {
    revenue: 122.9,
    cogs: -67.0,
    "gross-profit": 55.9,
    marketing: -14.1,
    personnel: -15.8,
    "other-opex": -8.6,
    "operating-income": 17.4,
  },
};

const pnlLineConfig: Array<{ id: PnlLineId; label: string; weight: 0 | 1 | 2 }> = [
  { id: "revenue", label: "Net revenue", weight: 1 },
  { id: "cogs", label: "Cost of goods sold", weight: 0 },
  { id: "gross-profit", label: "Gross profit", weight: 1 },
  { id: "marketing", label: "Marketing investment", weight: 0 },
  { id: "personnel", label: "Personnel costs", weight: 0 },
  { id: "other-opex", label: "Other operating expenses", weight: 0 },
  { id: "operating-income", label: "Operating income", weight: 2 },
];

const monthlyRevenue = [
  { month: "Jan", actual: 18.4, Forecast: 17.8, Budget: 18.2 },
  { month: "Feb", actual: 19.6, Forecast: 19.1, Budget: 18.9 },
  { month: "Mar", actual: 20.8, Forecast: 20.2, Budget: 20.0 },
  { month: "Apr", actual: 21.2, Forecast: 21.5, Budget: 20.9 },
  { month: "May", actual: 23.1, Forecast: 22.0, Budget: 21.7 },
  { month: "Jun", actual: 25.3, Forecast: 23.9, Budget: 23.4 },
] as const;

function scopeMultiplier(dimension: PnlDimension, member: string): number {
  return pnlDimensionMembers[dimension].find((item) => item.label === member)?.multiplier ?? 1;
}

export function getPnlSnapshot(comparison: PnlComparison, dimension: PnlDimension, member: string) {
  const multiplier = scopeMultiplier(dimension, member);
  const rows = pnlLineConfig.map((line) => {
    const actual = actualStatement[line.id] * multiplier;
    const plan = comparisonStatements[comparison][line.id] * multiplier;
    return {
      ...line,
      actual,
      plan,
      variance: actual - plan,
    };
  });
  const chartData = monthlyRevenue.map((row) => ({
    month: row.month,
    Actual: Number((row.actual * multiplier).toFixed(2)),
    Comparison: Number((row[comparison] * multiplier).toFixed(2)),
  }));
  return { rows, chartData, multiplier };
}

type DriverTemplate = {
  label: string;
  share: number;
  owner: string;
  evidence: string;
  interpretation: string;
  action: string;
};

const commonDrivers: Record<PnlLineId, DriverTemplate[]> = {
  revenue: [
    { label: "Price", share: 0.44, owner: "Commercial Finance", evidence: "Average selling price +2.8% vs plan", interpretation: "List-price execution more than offset targeted promotions.", action: "Protect realized pricing in the next customer review." },
    { label: "Volume", share: 0.31, owner: "Demand Planning", evidence: "Units +1.9% in pharmacy channel", interpretation: "Replenishment improved after the April service recovery.", action: "Confirm whether the service gain is sustainable in Q3." },
    { label: "Mix", share: -0.12, owner: "Category Finance", evidence: "Premium-brand mix -70 bps", interpretation: "Growth skewed toward lower-margin entry products.", action: "Rebalance the campaign toward premium bundles." },
    { label: "FX", share: 0.37, owner: "Regional FP&A", evidence: "Translation tailwind in two markets", interpretation: "Currency explains part of the reported upside but not the operational trend.", action: "Separate constant-currency performance in the steering pack." },
  ],
  cogs: [
    { label: "Materials", share: 0.58, owner: "Supply Finance", evidence: "Input index +4.1% vs locked rate", interpretation: "Commodity inflation arrived earlier than the sourcing assumption.", action: "Refresh the material-cost curve with Procurement." },
    { label: "Freight", share: 0.34, owner: "Logistics Finance", evidence: "Expedite cost across 3 lanes", interpretation: "Service recovery protected revenue but added premium freight.", action: "Track the exit rate after inventory normalizes." },
    { label: "Productivity", share: -0.27, owner: "Manufacturing Finance", evidence: "Yield +60 bps at Site 2", interpretation: "Line efficiency partially absorbed inflation and freight pressure.", action: "Validate replication opportunity at Site 1." },
    { label: "Mix", share: 0.35, owner: "Category Finance", evidence: "Higher share of outsourced SKUs", interpretation: "Portfolio mix increased unit conversion cost.", action: "Include sourcing mix in the next forecast." },
  ],
  "gross-profit": [
    { label: "Price", share: 0.46, owner: "Commercial Finance", evidence: "Realized pricing ahead of forecast", interpretation: "Pricing discipline remained the largest gross-profit driver.", action: "Carry validated price realization into the outlook." },
    { label: "Volume", share: 0.29, owner: "Demand Planning", evidence: "Pharmacy sell-in +1.9%", interpretation: "Incremental units added contribution despite softer mix.", action: "Reconcile sell-in with customer inventory." },
    { label: "Mix", share: -0.14, owner: "Category Finance", evidence: "Premium mix -70 bps", interpretation: "Lower-margin products diluted part of the revenue upside.", action: "Model recovery options by campaign." },
    { label: "Cost", share: 0.39, owner: "Supply Finance", evidence: "Net cost pressure below downside case", interpretation: "Productivity limited the conversion-cost headwind.", action: "Lock the updated cost baseline for Q3." },
  ],
  marketing: [
    { label: "Media", share: 0.55, owner: "Marketing Finance", evidence: "Digital campaign launched 2 weeks early", interpretation: "Spend timing moved forward to support the seasonal window.", action: "Confirm phasing rather than annual overspend." },
    { label: "Agency", share: 0.25, owner: "Brand Finance", evidence: "Two production scopes expanded", interpretation: "Creative adaptation costs were not in the original brief.", action: "Require approved scope change for future additions." },
    { label: "Savings", share: -0.20, owner: "Procurement", evidence: "Rate-card saving on paid search", interpretation: "Negotiated rates offset part of the production increase.", action: "Extend the rate card to the remaining markets." },
    { label: "Phasing", share: 0.40, owner: "Regional FP&A", evidence: "Q3 activity pulled into June", interpretation: "Most of the variance is timing, not a full-year risk.", action: "Rephase the second-half forecast." },
  ],
  personnel: [
    { label: "Headcount", share: 0.50, owner: "Finance Ops", evidence: "6 hires started ahead of plan", interpretation: "Earlier onboarding increased YTD cost but supports the capacity plan.", action: "Align start dates with the hiring tracker." },
    { label: "Merit", share: 0.32, owner: "HR Finance", evidence: "Merit effective one month early", interpretation: "Calendar timing explains part of the run-rate change.", action: "Update the monthly salary curve." },
    { label: "Vacancies", share: -0.18, owner: "Business Finance", evidence: "4 roles remain open", interpretation: "Open roles partially offset early starts elsewhere.", action: "Challenge probability and timing by role." },
    { label: "Bonus", share: 0.36, owner: "Corporate FP&A", evidence: "Performance accrual above target", interpretation: "Improved outlook increased variable-compensation cost.", action: "Reconcile the accrual with the latest outlook." },
  ],
  "other-opex": [
    { label: "Technology", share: 0.42, owner: "G&A Finance", evidence: "Cloud consumption below plan", interpretation: "Optimization reduced the recurring run rate.", action: "Carry the saving into the next budget baseline." },
    { label: "Travel", share: 0.30, owner: "Regional Finance", evidence: "Two meetings moved to virtual", interpretation: "The underspend is structural for the current quarter.", action: "Release unused travel reserve." },
    { label: "Professional fees", share: -0.12, owner: "Corporate Finance", evidence: "Compliance review added in June", interpretation: "An unplanned review offset part of the savings.", action: "Confirm whether follow-up work is required." },
    { label: "Facilities", share: 0.40, owner: "Workplace Finance", evidence: "Lease credit received", interpretation: "A one-time credit improved the period but should not annualize.", action: "Exclude the credit from run-rate guidance." },
  ],
  "operating-income": [
    { label: "Net revenue", share: 0.38, owner: "Commercial Finance", evidence: "Price and volume above outlook", interpretation: "Commercial delivery is the largest operating-income bridge.", action: "Validate Q3 persistence by channel." },
    { label: "Gross margin", share: 0.27, owner: "Supply Finance", evidence: "Productivity offset cost inflation", interpretation: "Operational savings protected conversion margin.", action: "Embed confirmed savings in the latest estimate." },
    { label: "Marketing timing", share: 0.15, owner: "Marketing Finance", evidence: "Spend pulled forward into June", interpretation: "The current drag is mostly timing and reverses in Q3.", action: "Rephase spend with campaign owners." },
    { label: "G&A savings", share: 0.20, owner: "Corporate FP&A", evidence: "Technology and travel below plan", interpretation: "Recurring savings exist, with a small one-time lease credit.", action: "Separate structural savings from one-offs." },
  ],
};

export function getPnlDrivers(lineId: PnlLineId, variance: number) {
  return commonDrivers[lineId].map((driver) => ({
    ...driver,
    amount: variance * driver.share,
  }));
}

export type ForecastDrivers = {
  revenueGrowth: number;
  utilization: number;
  headcount: number;
  wageInflation: number;
  contractorMix: number;
};

export type ForecastPreset = "Base" | "Upside" | "Downside";

export const forecastPresets: Record<ForecastPreset, ForecastDrivers> = {
  Base: { revenueGrowth: 4.5, utilization: 74, headcount: 428, wageInflation: 4, contractorMix: 14 },
  Upside: { revenueGrowth: 9, utilization: 81, headcount: 444, wageInflation: 4.5, contractorMix: 12 },
  Downside: { revenueGrowth: -2, utilization: 68, headcount: 405, wageInflation: 5.5, contractorMix: 22 },
};

export function calculateForecast(drivers: ForecastDrivers) {
  const baseline = forecastPresets.Base;
  const revenueFactor = 1
    + (drivers.revenueGrowth - baseline.revenueGrowth) / 100
    + (drivers.utilization - baseline.utilization) * 0.006;
  const revenue = 89.8 * revenueFactor;
  const personnelCost = 42.7
    + (drivers.headcount - baseline.headcount) * 0.075
    + (drivers.wageInflation - baseline.wageInflation) * 0.25;
  const contractorCost = 6.8 + (drivers.contractorMix - baseline.contractorMix) * 0.12;
  const indirectCost = 26.6;
  const ebitda = revenue - personnelCost - contractorCost - indirectCost;
  const margin = revenue ? (ebitda / revenue) * 100 : 0;
  const productivity = (revenue * 1000) / drivers.headcount;
  const monthlyBase = [5.7, 6.0, 6.4, 6.8, 7.1, 7.5, 7.7, 7.9, 8.2, 8.5, 8.8, 9.2];
  const chartData = monthlyBase.map((value, index) => ({
    month: new Date(2026, index).toLocaleString("en-US", { month: "short" }),
    Actual: index < 6 ? value : null,
    Forecast: index >= 5 ? Number((value * revenueFactor).toFixed(2)) : null,
  }));
  return { revenue, personnelCost, contractorCost, indirectCost, ebitda, margin, productivity, chartData };
}

type ForecastChange = {
  key: keyof ForecastDrivers;
  label: string;
  previous: number;
  current: number;
  unit: string;
  ebitdaImpact: number;
};

const driverLabels: Record<keyof ForecastDrivers, { label: string; unit: string; sensitivity: number }> = {
  revenueGrowth: { label: "Revenue growth", unit: "%", sensitivity: 0.9 },
  utilization: { label: "Utilization", unit: "%", sensitivity: 0.54 },
  headcount: { label: "Year-end headcount", unit: " FTE", sensitivity: -0.075 },
  wageInflation: { label: "Wage inflation", unit: "%", sensitivity: -0.25 },
  contractorMix: { label: "Contractor mix", unit: "%", sensitivity: -0.12 },
};

export function getForecastChanges(previous: ForecastDrivers, current: ForecastDrivers): ForecastChange[] {
  return (Object.keys(driverLabels) as Array<keyof ForecastDrivers>)
    .filter((key) => previous[key] !== current[key])
    .map((key) => ({
      key,
      label: driverLabels[key].label,
      previous: previous[key],
      current: current[key],
      unit: driverLabels[key].unit,
      ebitdaImpact: (current[key] - previous[key]) * driverLabels[key].sensitivity,
    }));
}

export type PipelineIncident = "healthy" | "schema" | "mapping" | "duplicate";
export type PipelineControlStatus = "Passed" | "Warning" | "Failed";

export const pipelineIncidentLabels: Record<PipelineIncident, string> = {
  healthy: "Healthy run",
  schema: "Schema drift",
  mapping: "Missing mappings",
  duplicate: "Duplicate records",
};

export function getPipelineQualityChecks(incident: PipelineIncident) {
  return [
    {
      id: "freshness",
      control: "Source freshness",
      scope: "5 source contracts",
      status: "Passed" as PipelineControlStatus,
      evidence: "Latest extract < 30 min",
      response: "No action required",
    },
    {
      id: "schema",
      control: "Schema conformance",
      scope: "126 required fields",
      status: (incident === "schema" ? "Failed" : "Passed") as PipelineControlStatus,
      evidence: incident === "schema" ? "2 unexpected Workday fields" : "0 unexpected changes",
      response: incident === "schema" ? "Quarantine changed payload and update contract" : "Contract version accepted",
    },
    {
      id: "uniqueness",
      control: "Primary-key uniqueness",
      scope: "2.8M monthly rows",
      status: (incident === "duplicate" ? "Failed" : "Passed") as PipelineControlStatus,
      evidence: incident === "duplicate" ? "14 duplicate CRM opportunities" : "3 duplicates safely quarantined",
      response: incident === "duplicate" ? "Apply source-key precedence before merge" : "Quarantine threshold respected",
    },
    {
      id: "mapping",
      control: "Master-data coverage",
      scope: "Cost centers and entities",
      status: (incident === "mapping" ? "Failed" : "Passed") as PipelineControlStatus,
      evidence: incident === "mapping" ? "23 cost centers without owner" : "100% mapped to reporting hierarchy",
      response: incident === "mapping" ? "Assign owner and effective date" : "Reference table current",
    },
    {
      id: "reconciliation",
      control: "Financial reconciliation",
      scope: "Actuals and allocations",
      status: (incident === "healthy" ? "Passed" : "Warning") as PipelineControlStatus,
      evidence: incident === "healthy" ? "99.8% auto-matched" : "Publishing held until failed control clears",
      response: incident === "healthy" ? "Release governed marts" : "Retain last validated snapshot",
    },
  ];
}

export function getPipelineIncidentDetail(incident: PipelineIncident) {
  const details: Record<PipelineIncident, { source: string; title: string; description: string }> = {
    healthy: { source: "All sources", title: "All publishing controls passed", description: "The current run can replace the validated finance snapshot." },
    schema: { source: "Workday", title: "Source contract changed", description: "Two fields arrived with a new type. The payload is isolated before it can alter personnel-cost logic." },
    mapping: { source: "NetSuite", title: "Reporting ownership is incomplete", description: "Twenty-three cost centers have no effective owner, so allocation and responsibility views cannot publish." },
    duplicate: { source: "Salesforce", title: "Duplicate business keys detected", description: "Fourteen opportunities share source keys across snapshots. Revenue pipeline totals are held until precedence is resolved." },
  };
  return details[incident];
}

export function getPipelineQuarantine(incident: PipelineIncident) {
  if (incident === "schema") {
    return [
      { record: "WD-84021", source: "Workday", reason: "cost_center changed from STRING to RECORD", disposition: "Contract review" },
      { record: "WD-84022", source: "Workday", reason: "legal_entity field renamed", disposition: "Alias pending" },
    ];
  }
  if (incident === "mapping") {
    return [
      { record: "CC-7410", source: "NetSuite", reason: "No responsibility owner", disposition: "Finance mapping" },
      { record: "CC-7418", source: "NetSuite", reason: "Entity effective date missing", disposition: "Finance mapping" },
      { record: "CC-7431", source: "NetSuite", reason: "Department hierarchy conflict", disposition: "Master-data review" },
    ];
  }
  if (incident === "duplicate") {
    return [
      { record: "OPP-18441", source: "Salesforce", reason: "Duplicate source key in current snapshot", disposition: "Precedence rule" },
      { record: "OPP-18477", source: "Salesforce", reason: "Conflicting close probability", disposition: "Sales Ops review" },
    ];
  }
  return [
    { record: "OPP-17302", source: "Salesforce", reason: "Superseded snapshot duplicate", disposition: "Auto-resolved" },
    { record: "EMP-80311", source: "Workday", reason: "Late-arriving termination", disposition: "Next snapshot" },
  ];
}

export function getPipelineReconciliation(incident: PipelineIncident) {
  return [
    { area: "Net revenue", source: 96.42, mart: incident === "duplicate" ? 97.08 : 96.42, exceptions: incident === "duplicate" ? 14 : 0, status: incident === "duplicate" ? "Held" : "Matched" },
    { area: "Personnel costs", source: 47.18, mart: incident === "schema" ? 46.72 : 47.14, exceptions: incident === "schema" ? 2 : 7, status: incident === "schema" ? "Held" : "Reviewed" },
    { area: "Indirect costs", source: 34.77, mart: incident === "mapping" ? 34.11 : 34.77, exceptions: incident === "mapping" ? 23 : 0, status: incident === "mapping" ? "Held" : "Matched" },
    { area: "Intercompany markup", source: 8.26, mart: 8.26, exceptions: 0, status: "Matched" },
  ];
}
