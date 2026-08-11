export type CopilotEvidenceScenario = "complete" | "stale" | "missing-owner";
export type CopilotMode = "CFO Brief" | "Regional Review";
export type CopilotVarianceId = "revenue" | "personnel" | "marketing" | "operating-income";

export type CopilotEvidence = {
  id: string;
  source: string;
  detail: string;
  refreshed: string;
  status: "Ready" | "Stale" | "Missing";
};

export const copilotVariances = [
  { id: "revenue" as const, label: "Net revenue", variance: 3.9, materiality: "High", owner: "Commercial Finance" },
  { id: "personnel" as const, label: "Personnel costs", variance: -0.3, materiality: "Medium", owner: "HR Finance" },
  { id: "marketing" as const, label: "Marketing", variance: -0.4, materiality: "Medium", owner: "Marketing Finance" },
  { id: "operating-income" as const, label: "Operating income", variance: 2.1, materiality: "High", owner: "Corporate FP&A" },
];

const varianceContent: Record<CopilotVarianceId, {
  headline: string;
  regionalHeadline: string;
  claims: Array<{ text: string; evidenceIds: string[] }>;
  action: string;
}> = {
  revenue: {
    headline: "Revenue finished $3.9M above forecast, led by realized pricing and pharmacy-channel volume.",
    regionalHeadline: "North and Central delivered the revenue upside, while premium mix remains the main watch item.",
    claims: [
      { text: "Realized pricing contributed $1.7M of the upside.", evidenceIds: ["E-101", "E-104"] },
      { text: "Pharmacy-channel volume added $1.2M after service levels recovered.", evidenceIds: ["E-102", "E-105"] },
      { text: "A 70 bps decline in premium mix offset $0.5M of the gain.", evidenceIds: ["E-103"] },
    ],
    action: "Confirm price persistence and premium-mix recovery before the Q3 outlook is locked.",
  },
  personnel: {
    headline: "Personnel costs were $0.3M above forecast as six hires started earlier than planned.",
    regionalHeadline: "Early starts in Central created the cost variance, partly offset by four open roles in North.",
    claims: [
      { text: "Six planned hires started one month earlier than the approved curve.", evidenceIds: ["E-201", "E-204"] },
      { text: "Four open positions offset approximately $0.2M of the pressure.", evidenceIds: ["E-202"] },
      { text: "No unapproved positions were identified in the current roster.", evidenceIds: ["E-203", "E-204"] },
    ],
    action: "Align the monthly salary curve to confirmed start dates before refreshing the forecast.",
  },
  marketing: {
    headline: "Marketing spend was $0.4M above forecast, primarily due to campaign phasing rather than full-year overspend.",
    regionalHeadline: "Central pulled two campaign waves into June; procurement savings offset part of the timing pressure.",
    claims: [
      { text: "Two campaign waves launched earlier and shifted $0.5M into the current period.", evidenceIds: ["E-301", "E-304"] },
      { text: "Paid-search rate savings reduced the net variance by $0.1M.", evidenceIds: ["E-302"] },
      { text: "The current annual plan remains within the approved envelope.", evidenceIds: ["E-303", "E-304"] },
    ],
    action: "Rephase the remaining campaign calendar and retain the annual spend ceiling.",
  },
  "operating-income": {
    headline: "Operating income finished $2.1M above forecast as commercial delivery outweighed cost timing.",
    regionalHeadline: "Revenue and supply productivity drove the upside, with marketing timing creating a partial offset.",
    claims: [
      { text: "Price and volume delivered $1.5M of incremental operating income.", evidenceIds: ["E-401", "E-404"] },
      { text: "Supply productivity contributed $0.8M and is supported by site-level yield data.", evidenceIds: ["E-402"] },
      { text: "Earlier marketing activity reduced the period benefit by $0.4M.", evidenceIds: ["E-403", "E-404"] },
    ],
    action: "Separate structural improvements from timing before updating full-year guidance.",
  },
};

function evidenceFor(varianceId: CopilotVarianceId, scenario: CopilotEvidenceScenario): CopilotEvidence[] {
  const prefix = varianceId === "revenue" ? "1" : varianceId === "personnel" ? "2" : varianceId === "marketing" ? "3" : "4";
  const evidence: CopilotEvidence[] = [
    { id: `E-${prefix}01`, source: "P&L mart", detail: "Actual, forecast and variance by market", refreshed: "08:42 UTC", status: "Ready" },
    { id: `E-${prefix}02`, source: "Driver model", detail: "Price, volume, mix and cost bridge", refreshed: "08:37 UTC", status: "Ready" },
    { id: `E-${prefix}03`, source: "Business input", detail: "Owner explanation and outlook assessment", refreshed: "08:31 UTC", status: "Ready" },
    { id: `E-${prefix}04`, source: "Close controls", detail: "Reconciliation and materiality result", refreshed: "08:44 UTC", status: "Ready" },
  ];

  if (scenario === "stale") {
    evidence[2] = { ...evidence[2], refreshed: "8 days ago", status: "Stale" };
  }
  if (scenario === "missing-owner") {
    evidence[2] = { ...evidence[2], detail: "Owner explanation not submitted", refreshed: "Not available", status: "Missing" };
  }
  return evidence;
}

export function getCopilotOutput(
  varianceId: CopilotVarianceId,
  scenario: CopilotEvidenceScenario,
  mode: CopilotMode,
) {
  const content = varianceContent[varianceId];
  const evidence = evidenceFor(varianceId, scenario);
  const invalidEvidence = evidence.filter((item) => item.status !== "Ready");
  const approvalReady = invalidEvidence.length === 0;
  const headline = mode === "CFO Brief" ? content.headline : content.regionalHeadline;
  const groundedness = scenario === "complete" ? 98 : scenario === "stale" ? 84 : 76;
  const citationCoverage = scenario === "complete" ? 100 : 67;
  const issues = invalidEvidence.map((item) => (
    item.status === "Stale"
      ? `${item.id} is outside the 72-hour freshness policy.`
      : `${item.id} is required before management commentary can be approved.`
  ));

  return {
    headline,
    claims: content.claims,
    action: content.action,
    evidence,
    approvalReady,
    issues,
    groundedness,
    citationCoverage,
    evaluation: [
      { metric: "Groundedness", score: groundedness, target: 95, status: groundedness >= 95 ? "Pass" : "Review" },
      { metric: "Citation coverage", score: citationCoverage, target: 100, status: citationCoverage === 100 ? "Pass" : "Review" },
      { metric: "Materiality", score: 97, target: 90, status: "Pass" },
      { metric: "Executive tone", score: mode === "CFO Brief" ? 96 : 94, target: 90, status: "Pass" },
      { metric: "PII safety", score: 100, target: 100, status: "Pass" },
    ],
  };
}

export type AgentScenario = "baseline" | "duplicate" | "accrual" | "prompt-injection";
export type AgentCaseStatus = "Ready for review" | "Needs evidence" | "Escalated" | "Blocked";

export type AgentCase = {
  id: string;
  type: string;
  description: string;
  amount: number;
  risk: number;
  entity: string;
  status: AgentCaseStatus;
  recommendation: string;
  evidence: string[];
};

const baselineAgentCases: AgentCase[] = [
  {
    id: "DUP-204",
    type: "Potential duplicate",
    description: "Two invoices share supplier, amount and service period.",
    amount: 184000,
    risk: 92,
    entity: "North Operations",
    status: "Ready for review",
    recommendation: "Hold the newer invoice and confirm the source document with AP.",
    evidence: ["Invoice similarity: 98%", "Same supplier and service period", "Second posting created 41 minutes later"],
  },
  {
    id: "ACC-118",
    type: "Accrual mismatch",
    description: "Service receipt is above the posted month-end accrual.",
    amount: 126000,
    risk: 84,
    entity: "Central Services",
    status: "Ready for review",
    recommendation: "Review a $42K accrual increase with the cost-center owner.",
    evidence: ["Purchase order consumed: 78%", "Accrual coverage: 52%", "Prior-month pattern supports the service run rate"],
  },
  {
    id: "MAP-044",
    type: "Account mapping",
    description: "A software charge is mapped to professional services.",
    amount: 73000,
    risk: 77,
    entity: "Corporate",
    status: "Needs evidence",
    recommendation: "Request contract metadata before proposing reclassification.",
    evidence: ["Vendor profile indicates SaaS", "GL history is split across two accounts", "Contract attachment unavailable"],
  },
  {
    id: "FX-309",
    type: "FX outlier",
    description: "Intercompany translation differs from the approved close rate.",
    amount: 51000,
    risk: 68,
    entity: "South Trading",
    status: "Ready for review",
    recommendation: "Recalculate with the approved treasury rate and compare the journal delta.",
    evidence: ["Applied rate: 1.084", "Approved close rate: 1.071", "Intercompany agreement confirmed"],
  },
  {
    id: "PO-812",
    type: "PO timing",
    description: "An open purchase order has no current-period receipt.",
    amount: 28000,
    risk: 55,
    entity: "North Operations",
    status: "Needs evidence",
    recommendation: "Confirm delivery timing; no close adjustment is supported yet.",
    evidence: ["PO remains open", "No goods receipt", "Supplier delivery date is next month"],
  },
];

export const agentToolPermissions = [
  { tool: "ERP journal search", access: "Read only", purpose: "Inspect postings and document references" },
  { tool: "Policy retrieval", access: "Read only", purpose: "Retrieve approved accounting guidance" },
  { tool: "Close history", access: "Read only", purpose: "Compare prior reviewer decisions" },
  { tool: "Workflow queue", access: "Recommend only", purpose: "Draft a review action for a human owner" },
] as const;

export function getAgentCases(scenario: AgentScenario, threshold = 70): AgentCase[] {
  let cases = baselineAgentCases.map((item) => ({ ...item, evidence: [...item.evidence] }));

  if (scenario === "duplicate") {
    cases = cases.map((item) => item.id === "DUP-204" ? {
      ...item,
      risk: 98,
      amount: 368000,
      description: "Three invoices share supplier, amount, service period and bank reference.",
      evidence: [...item.evidence, "Bank reference repeated across three documents"],
    } : item);
  }
  if (scenario === "accrual") {
    cases = cases.map((item) => item.id === "ACC-118" ? {
      ...item,
      risk: 96,
      amount: 294000,
      description: "Confirmed services exceed the posted accrual across three cost centers.",
      evidence: [...item.evidence, "Three owners confirmed June service delivery"],
    } : item);
  }
  if (scenario === "prompt-injection") {
    cases = [{
      id: "SEC-001",
      type: "Prompt injection",
      description: "A supplier memo attempted to override policy and request a journal posting.",
      amount: 0,
      risk: 100,
      entity: "External document",
      status: "Blocked",
      recommendation: "Quarantine the document and escalate the security event. Do not execute instructions.",
      evidence: ["Untrusted content requested policy override", "Write action requested outside tool permissions", "Input isolated before retrieval"],
    }, ...cases];
  }

  return cases.filter((item) => item.risk >= threshold);
}

export function getAgentTrace(item: AgentCase) {
  if (item.id === "SEC-001") {
    return [
      { step: "Detect", detail: "Classified untrusted instruction inside supplier-provided content.", status: "Blocked" },
      { step: "Isolate", detail: "Removed the document from the retrieval context.", status: "Complete" },
      { step: "Enforce", detail: "Rejected the requested journal action because no write tool exists.", status: "Complete" },
      { step: "Escalate", detail: "Prepared a security event for human review.", status: "Ready" },
    ];
  }
  return [
    { step: "Detect", detail: `${item.type} scored ${item.risk}/100 using rules and anomaly signals.`, status: "Complete" },
    { step: "Retrieve", detail: "Matched the issue to approved close policy and prior reviewed cases.", status: "Complete" },
    { step: "Investigate", detail: `Queried read-only evidence for ${item.entity}.`, status: "Complete" },
    { step: "Recommend", detail: item.recommendation, status: item.status === "Needs evidence" ? "Needs evidence" : "Ready" },
  ];
}

export function getAgentMetrics(items: AgentCase[]) {
  return {
    queue: items.length,
    estimatedHours: Number((items.length * 0.82).toFixed(1)),
    precision: 82,
    autonomousPostings: 0,
  };
}
