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
  theme: "pnl" | "forecast" | "pipeline" | "copilot" | "agent";
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
  {
    number: "04",
    slug: "ai-variance-intelligence-copilot",
    navLabel: "AI Variance Copilot",
    title: "AI Variance Intelligence Copilot",
    client: "Asteron Mobility",
    industry: "Mobility services · Global FP&A",
    role: "Finance AI Product Lead",
    duration: "10-week controlled pilot",
    summary:
      "A governed generative-AI workflow that turns reconciled P&L drivers into cited management commentary, evaluation scores and review-ready actions.",
    challengeTitle: "Finance had the drivers, but commentary still restarted from a blank page.",
    problem:
      "Analysts spent the final hours of every close rewriting the same variance logic across markets and presentation formats. Generic AI experiments produced fluent text, but could not prove which financial evidence supported each claim, enforce materiality or stop when an input was stale.",
    challengeSignals: [
      "Forty-five entities drafted commentary with different levels of detail and terminology.",
      "Executive narratives could drift away from the reconciled P&L and approved business input.",
      "Reviewers had no citation trail, evaluation score or prompt and model version attached to the text.",
      "Missing owner explanations were discovered only during the final management review.",
    ],
    decisionRisk:
      "An unsupported AI-generated explanation could reach leadership, obscure the real business driver and weaken confidence in both the close and the technology.",
    approach: [
      "Structured reconciled variances, materiality rules and owner input as a controlled evidence package.",
      "Generated schema-constrained commentary with claim-level citations instead of unrestricted prose.",
      "Added automated evaluation for groundedness, citation coverage, materiality, tone and PII safety.",
      "Required a finance reviewer to approve, reject or request evidence before any narrative could be published.",
    ],
    metrics: [
      { value: "2 days → 38 min", label: "Commentary cycle", detail: "Illustrative preparation time after reconciliation" },
      { value: "100%", label: "Cited claims", detail: "Illustrative citation coverage in approved outputs" },
      { value: "0", label: "Unreviewed outputs", detail: "Illustrative publishing control result" },
      { value: "45", label: "Reporting entities", detail: "Illustrative management-reporting scope" },
    ],
    stack: ["Python", "LLM API", "Structured Outputs", "SQL", "Embeddings", "React"],
    keywords: [
      "Generative AI",
      "Retrieval-Augmented Generation (RAG)",
      "Prompt Engineering",
      "Structured Outputs",
      "Human-in-the-loop",
      "AI Evaluation",
      "AI Guardrails & Governance",
      "Management Commentary",
    ],
    clientTranslation:
      "For FP&A teams, this pattern accelerates narrative work without asking leadership to trust an opaque model. Every claim stays connected to approved evidence, every degraded input stops publication and every final word remains owned by Finance.",
    theme: "copilot",
  },
  {
    number: "05",
    slug: "ai-finance-controls-agent",
    navLabel: "AI Controls Agent",
    title: "AI Finance Controls Agent",
    client: "Helix Harbor Commerce",
    industry: "Digital commerce · Multi-entity close",
    role: "Finance Automation & AI Architect",
    duration: "12-week supervised rollout",
    summary:
      "An agentic close-control workflow that detects exceptions, retrieves policy and historical evidence, and proposes auditable actions without autonomous postings.",
    challengeTitle: "The close queue was large; the evidence behind each exception was scattered.",
    problem:
      "Controllers reviewed hundreds of possible duplicates, accrual gaps, mapping errors and FX outliers across separate systems. Rules found volume but lacked context, while a general-purpose agent would introduce unacceptable access and execution risk inside a controlled finance process.",
    challengeSignals: [
      "Six hundred and forty monthly alerts competed for a limited controller review window.",
      "Policy, ERP history and prior reviewer decisions had to be collected manually for every investigation.",
      "False positives diluted attention from the highest-value financial-control exceptions.",
      "Untrusted supplier documents could enter the same context used by an AI assistant.",
    ],
    decisionRisk:
      "A missed exception could distort the close, while an over-permissioned agent could act on untrusted content or recommend a journal without sufficient evidence.",
    approach: [
      "Combined deterministic controls and anomaly signals into a risk-ranked review queue.",
      "Limited the agent to read-only finance tools and retrieved only approved policy and reviewed history.",
      "Exposed each tool call, evidence item, recommendation and confidence signal in an audit trace.",
      "Blocked prompt injection and kept all accounting decisions and postings under human control.",
    ],
    metrics: [
      { value: "640 → 118", label: "Review queue", detail: "Illustrative reduction after risk-based triage" },
      { value: "82%", label: "Precision", detail: "Illustrative reviewed-exception precision" },
      { value: "6.4 hrs", label: "Close time saved", detail: "Illustrative analyst capacity per monthly close" },
      { value: "0", label: "Autonomous postings", detail: "Illustrative control boundary by design" },
    ],
    stack: ["Python", "LLM Tool Calling", "Vector Search", "SQL", "ERP APIs", "React"],
    keywords: [
      "Agentic AI",
      "Function Calling",
      "Retrieval-Augmented Generation (RAG)",
      "Anomaly Detection",
      "Human-in-the-loop",
      "AI Evaluation",
      "Audit Logs",
      "Close Management",
    ],
    clientTranslation:
      "For controllership and FP&A, this pattern uses AI to compress investigation time while preserving segregation of duties. The agent can inspect, retrieve and recommend; a qualified reviewer still decides and the ERP remains protected from autonomous changes.",
    theme: "agent",
  },
];

export function casePath(item: PortfolioCase): string {
  return `/cases/${item.slug}`;
}

export function findCase(pathname: string): PortfolioCase | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return cases.find((item) => casePath(item) === normalized);
}
