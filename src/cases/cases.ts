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
  problem: string;
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
    problem:
      "Monthly performance reviews depended on disconnected spreadsheets, manual chart updates and inconsistent variance explanations. Finance leaders could see the total, but not reliably trace the drivers by market, brand or owner.",
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
    problem:
      "Regional submissions arrived through fragile templates with different assumptions, duplicated versions and limited auditability. Consolidation consumed the time that FP&A needed for business partnering and scenario analysis.",
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
    problem:
      "Finance analysts manually downloaded, renamed and joined extracts from core systems. Late schema changes, missing mappings and duplicate records were often discovered only after numbers reached management review.",
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
