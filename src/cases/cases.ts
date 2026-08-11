export type CaseMetric = {
  value: string;
  label: string;
  detail: string;
};

export type PortfolioCase = {
  number: string;
  slug: string;
  navLabel: string;
  title: string;
  client: string;
  industry: string;
  role: string;
  duration: string;
  summary: string;
  challengeTitle: string;
  problem: string;
  challengeSignals: string[];
  decisionRisk: string;
  approach: string[];
  metrics: CaseMetric[];
  stack: string[];
  keywords: string[];
  clientTranslation: string;
  theme: "pnl" | "forecast" | "pipeline";
};

export const cases: PortfolioCase[] = [
  {
    number: "01",
    slug: "pnl-performance-dashboard",
    navLabel: "P&L Dashboard",
    title: "P&L Performance Dashboard",
    client: "Northline Consumer",
    industry: "Consumer health · Multi-market FP&A",
    role: "Finance Systems & FP&A Lead",
    duration: "16-week transformation",
    summary:
      "A decision-ready P&L workspace that reconciles actuals, forecast and budget across markets, brands and responsibility centers.",
    challengeTitle: "The close ended before the explanation began.",
    problem:
      "The team could close the ledger, but management reporting began as a second manual process. Twelve local models used different sign conventions and hierarchies; product detail did not always reconcile to the executive P&L; and variance comments were assembled in slides after the numbers had already moved.",
    challengeSignals: [
      "Twelve linked reporting models with different hierarchies and signs.",
      "Executive totals could not be traced consistently to market, brand and owner.",
      "Price, volume, mix, FX and timing explanations lived outside the numbers.",
      "Actions agreed in performance reviews had no durable owner or evidence trail.",
    ],
    decisionRisk:
      "Leadership could not distinguish temporary timing from recurring margin erosion early enough to change pricing, spend or supply decisions.",
    approach: [
      "Designed a governed P&L hierarchy with management-reporting sign conventions.",
      "Built scenario, period, market and responsibility-center views from one reconciled model.",
      "Automated variance analysis, executive KPIs and reusable reporting exports.",
      "Added validation gates between source data, product detail and management totals.",
    ],
    metrics: [
      { value: "3 days → 4 hrs", label: "Reporting cycle", detail: "Illustrative monthly preparation time" },
      { value: "99.7%", label: "Auto-reconciled", detail: "Illustrative source-to-report match rate" },
      { value: "12 → 1", label: "Reporting models", detail: "Illustrative consolidation of local files" },
      { value: "9", label: "Markets", detail: "Illustrative decision scope" },
    ],
    stack: ["React", "TypeScript", "SQL", "Excel", "Power Query", "Recharts"],
    keywords: [
      "P&L / Income Statement",
      "Actuals vs Forecast",
      "Budgeting",
      "Variance Analysis",
      "Management Reporting",
      "Financial Modeling",
      "Executive Dashboards",
      "Data Reconciliation",
    ],
    clientTranslation:
      "For a global finance team, this pattern turns a spreadsheet-heavy close into one governed management-reporting product: faster preparation, clearer ownership and drill-down from executive variance to operational driver.",
    theme: "pnl",
  },
  {
    number: "02",
    slug: "forecast-planning-workspace",
    navLabel: "Forecast Workspace",
    title: "Forecast Planning Workspace",
    client: "Fieldstone Creative Network",
    industry: "Global services · Multi-entity planning",
    role: "Senior FP&A Data & Systems Specialist",
    duration: "Two planning cycles",
    summary:
      "A collaborative planning workspace connecting revenue, personnel costs and indirect costs with controlled edits, approvals and change history.",
    challengeTitle: "Every region had a forecast. Finance had no single forecast process.",
    problem:
      "Regional submissions arrived through templates that looked similar but encoded different assumptions. Headcount was disconnected from hiring activity, revenue probability sat outside the model, and late adjustments moved between files without a reason, owner or reliable version history.",
    challengeSignals: [
      "Eighteen entities submitted overlapping versions through email and shared drives.",
      "Revenue, utilization, headcount and wage assumptions changed independently.",
      "Consolidation happened after local decisions, making the group outlook stale on arrival.",
      "Reviewers could see a new number but not the exact drivers or justification behind it.",
    ],
    decisionRisk:
      "Hiring and cost commitments could be approved against a scenario that no longer matched the latest commercial outlook.",
    approach: [
      "Translated revenue, headcount and cost drivers into one planning model.",
      "Replaced uncontrolled file exchanges with validated input workflows and scoped access.",
      "Created draft, review and save states with reasons, ownership and a complete adjustment history.",
      "Connected actuals and forecast views so teams could explain changes in the same workspace.",
    ],
    metrics: [
      { value: "9 → 3 days", label: "Forecast cycle", detail: "Illustrative consolidation lead time" },
      { value: "72%", label: "Fewer handoffs", detail: "Illustrative reduction in file exchanges" },
      { value: "100%", label: "Change traceability", detail: "Illustrative coverage of saved adjustments" },
      { value: "18", label: "Planning entities", detail: "Illustrative global scope" },
    ],
    stack: ["Next.js", "TypeScript", "BigQuery", "Google Apps Script", "SQL", "Python"],
    keywords: [
      "Forecasting",
      "Driver-based Planning",
      "Headcount Planning",
      "Personnel Costs",
      "Scenario Modeling",
      "Finance Transformation",
      "Workflow Automation",
      "Audit Trail",
    ],
    clientTranslation:
      "For a distributed FP&A organization, this pattern creates one controlled planning workflow without losing the flexibility teams expect from spreadsheets. Finance spends less time collecting files and more time challenging assumptions.",
    theme: "forecast",
  },
  {
    number: "03",
    slug: "finance-data-control-tower",
    navLabel: "Data Control Tower",
    title: "Finance Data Control Tower",
    client: "Cobalt Ridge Software",
    industry: "B2B SaaS · Global finance operations",
    role: "Finance Data & Automation Architect",
    duration: "12-week foundation",
    summary:
      "An automated finance data pipeline that unifies ERP, CRM and HRIS inputs, reconciles actuals and forecast, and exposes data quality before executive reporting.",
    challengeTitle: "The reporting deadline was also the integration process.",
    problem:
      "Analysts manually downloaded, renamed and joined extracts from ERP, CRM and HRIS platforms. Schema changes, duplicate business keys and missing ownership mappings were discovered only after allocations and markups had already flowed into management reporting.",
    challengeSignals: [
      "Five source systems refreshed on different schedules and ownership models.",
      "Master-data gaps changed allocations, responsibility views and intercompany logic.",
      "A successful file download was mistaken for a financially valid data refresh.",
      "When totals moved, analysts rebuilt lineage manually during executive review.",
    ],
    decisionRisk:
      "A late integration defect could alter forecast, margin or statutory views and undermine trust in every downstream finance product.",
    approach: [
      "Designed API and file-ingestion contracts for Workday, Salesforce, Greenhouse, NetSuite and Lucanet.",
      "Built SQL transformations for allocations, markups, headcount and actuals-versus-forecast reconciliation.",
      "Added automated freshness, completeness, uniqueness and financial-control checks.",
      "Published governed finance marts for FP&A models, dashboards and executive reporting.",
    ],
    metrics: [
      { value: "2 days → 18 min", label: "Data readiness", detail: "Illustrative refresh duration" },
      { value: "2.8M", label: "Rows per month", detail: "Illustrative processed volume" },
      { value: "34", label: "Automated controls", detail: "Illustrative quality and finance checks" },
      { value: "14", label: "Countries", detail: "Illustrative reporting coverage" },
    ],
    stack: ["Python", "BigQuery", "SQL", "REST APIs", "Workday", "Salesforce", "Looker Studio"],
    keywords: [
      "Financial Data Pipelines",
      "Systems Integration",
      "API Automation",
      "ETL / ELT",
      "Data Quality",
      "Financial Controls",
      "Intercompany Allocations",
      "Statutory & Management Reporting",
    ],
    clientTranslation:
      "For finance teams with fragmented systems, this pattern moves control upstream. Errors become visible before reporting, recurring extracts disappear and every management number has a traceable path back to its source.",
    theme: "pipeline",
  },
];

export function casePath(item: PortfolioCase): string {
  return `/cases/${item.slug}`;
}

export function findCase(pathname: string): PortfolioCase | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return cases.find((item) => casePath(item) === normalized);
}
