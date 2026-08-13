import { useMemo, useState } from "react";
import { AlertTriangle, Bot, Check, CircleDollarSign, Eye, FileQuestion, LockKeyhole, Search, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { agentToolPermissions, agentTrace, initialAgentCases, makeSecurityCase, type AgentCase, type AgentCaseStatus } from "../../domain/portfolioModels";
import { AuditTimeline, ConfirmDialog, type AuditEvent, useSessionState, useToast } from "../interaction/InteractionSystem";
import { DemoKpi, DemoStatusBar, formatCurrency, ProductName, StatusPill, SyntheticDemoNotice } from "./DemoShared";

type AgentScenario = "full-queue" | "duplicate" | "accrual" | "prompt-injection";
type Decision = "Approved" | "False positive" | "Escalated";
const scenarioLabels: Record<AgentScenario, string> = { "full-queue": "Full close queue", duplicate: "Duplicate payment", accrual: "Accrual mismatch", "prompt-injection": "Prompt injection test" };

export function AiControlsAgentDemo() {
  const [cases, setCases] = useSessionState<AgentCase[]>("portfolio-v4-agent-cases", initialAgentCases);
  const [events, setEvents] = useSessionState<AuditEvent[]>("portfolio-v4-agent-audit", []);
  const [threshold, setThreshold] = useState(65);
  const [scenario, setScenario] = useState<AgentScenario>("full-queue");
  const [selectedId, setSelectedId] = useState(initialAgentCases[0].id);
  const [search, setSearch] = useState("");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [evidenceOwner, setEvidenceOwner] = useState("AP Operations Lead");
  const [evidenceRequest, setEvidenceRequest] = useState("Provide the approved invoice, service receipt and payment-status confirmation.");
  const { pushToast } = useToast();

  const securityCase = useMemo(() => makeSecurityCase(), []);
  const activeCases = scenario === "prompt-injection" ? [securityCase] : cases;
  const visibleCases = activeCases.filter((item) => item.risk >= threshold && `${item.id} ${item.type} ${item.entity}`.toLowerCase().includes(search.toLowerCase()));
  const selected = activeCases.find((item) => item.id === selectedId) ?? visibleCases[0] ?? activeCases[0];
  const trace = agentTrace(selected);
  const exposure = visibleCases.reduce((sum, item) => sum + item.amount, 0);
  const readyCount = visibleCases.filter((item) => item.status === "Ready for review").length;

  function selectScenario(next: AgentScenario) {
    setScenario(next);
    if (next === "prompt-injection") setSelectedId(securityCase.id);
    else if (next === "duplicate") setSelectedId(cases.find((item) => item.type === "Potential duplicate")?.id ?? cases[0].id);
    else if (next === "accrual") setSelectedId(cases.find((item) => item.type === "Accrual mismatch")?.id ?? cases[0].id);
    else setSelectedId(cases[0].id);
  }

  function setStatus(id: string, status: AgentCaseStatus) {
    setCases((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  function requestEvidence() {
    setStatus(selected.id, "Waiting for evidence");
    setEvents((current) => [{ id: Date.now(), title: `Evidence requested for ${selected.id}`, detail: `${evidenceOwner}: ${evidenceRequest}`, tone: "pending" as const }, ...current].slice(0, 7));
    setEvidenceOpen(false);
    pushToast({ title: "Evidence request sent", detail: `${evidenceOwner} now owns the next workflow step.` });
  }

  function confirmDecision() {
    if (!decision) return;
    setStatus(selected.id, decision);
    setEvents((current) => [{ id: Date.now(), title: `${selected.id} marked ${decision.toLowerCase()}`, detail: `${selected.type} reviewed after evidence and policy trace inspection.`, tone: (decision === "Escalated" ? "pending" : "complete") as AuditEvent["tone"] }, ...current].slice(0, 7));
    pushToast({ title: `Case ${decision.toLowerCase()}`, detail: "The human decision and agent trace were retained in the audit history." });
    setDecision(null);
  }

  return (
    <div className="product-demo agent-demo">
      <div className="demo-toolbar agent-toolbar">
        <ProductName icon={Bot} name="CloseGuard Review Agent" subtitle="Human-controlled exception triage" />
        <div className="demo-toolbar-controls"><label className="select-control"><span>Scenario</span><select onChange={(event) => selectScenario(event.target.value as AgentScenario)} value={scenario}>{(Object.keys(scenarioLabels) as AgentScenario[]).map((item) => <option key={item} value={item}>{scenarioLabels[item]}</option>)}</select></label><SyntheticDemoNotice /></div>
      </div>

      <div className="demo-content agent-workbench">
        <DemoStatusBar records="18 synthetic close exceptions · 4 read-only tools"><strong>June close · Reviewer queue</strong> · Agent may investigate and recommend, never post</DemoStatusBar>

        <div className="demo-kpi-grid">
          <DemoKpi detail={`Risk score ≥ ${threshold}`} icon={<ShieldAlert size={17} />} label="Visible exceptions" value={String(visibleCases.length)} />
          <DemoKpi detail="Value represented in queue" icon={<CircleDollarSign size={17} />} label="Financial exposure" tone={exposure > 500_000 ? "warning" : "neutral"} value={formatCurrency(exposure)} />
          <DemoKpi detail="Human decision available" icon={<UserCheck size={17} />} label="Ready for review" tone="positive" value={String(readyCount)} />
          <DemoKpi detail="No posting or payment access" icon={<LockKeyhole size={17} />} label="Write permissions" tone="positive" value="0" />
        </div>

        <div className="risk-control-bar"><label><span>Minimum risk score</span><input max="95" min="40" onChange={(event) => setThreshold(Number(event.target.value))} step="5" type="range" value={threshold} /><output>{threshold}</output></label><label className="queue-search"><Search size={15} /><input aria-label="Search queue" onChange={(event) => setSearch(event.target.value)} placeholder="Search cases, entity or control..." value={search} /></label></div>

        <div className="agent-main-grid">
          <section className="demo-panel agent-queue-panel">
            <div className="panel-heading"><div><span>Prioritized queue</span><h3>Exceptions requiring review</h3></div><small>{visibleCases.length} cases</small></div>
            <div className="agent-queue">{visibleCases.map((item) => <button className={selected.id === item.id ? "active" : ""} key={item.id} onClick={() => setSelectedId(item.id)} type="button"><span className={`risk-score risk-${item.risk >= 90 ? "high" : item.risk >= 75 ? "medium" : "low"}`}>{item.risk}</span><span><strong>{item.type}</strong><small>{item.id} · {item.entity}</small></span><span><b>{formatCurrency(item.amount)}</b><StatusPill label={item.status} tone={item.status === "Blocked" ? "danger" : item.status === "Approved" || item.status === "False positive" ? "positive" : "warning"} /></span></button>)}</div>
          </section>

          <section className="demo-panel case-review-panel">
            <div className="panel-heading"><div><span>Human review</span><h3>{selected.id} · {selected.type}</h3></div><StatusPill label={selected.status} tone={selected.status === "Blocked" ? "danger" : selected.status === "Approved" ? "positive" : "warning"} /></div>
            {selected.id === "SEC-001" && <div className="security-alert"><ShieldAlert size={20} /><div><strong>Untrusted instruction isolated</strong><p>The external document attempted to override policy and request a journal posting. It was removed from retrieval context before the agent continued.</p></div></div>}
            <div className="case-overview"><div><span>Entity</span><strong>{selected.entity}</strong></div><div><span>Amount</span><strong>{formatCurrency(selected.amount)}</strong></div><div><span>Risk score</span><strong>{selected.risk}/100</strong></div></div>
            <div className="case-narrative"><span>What was detected</span><p>{selected.description}</p><span>Agent recommendation</span><p>{selected.recommendation}</p></div>
            <div className="evidence-checklist"><span>Evidence retrieved</span>{selected.evidence.map((item) => <div key={item}><Check size={14} /><span>{item}</span></div>)}</div>
            <div className="decision-actions">
              {selected.id === "SEC-001" ? <button className="button button-primary" onClick={() => { setEvents((current) => [{ id: Date.now(), title: "Security event escalated", detail: "Prompt injection was blocked, content quarantined and routed to security review.", tone: "blocked" as const }, ...current]); pushToast({ title: "Security event escalated", detail: "No finance action was executed." }); }} type="button"><ShieldAlert size={15} /> Escalate security event</button> : <><button className="button button-secondary" onClick={() => setEvidenceOpen(true)} type="button"><FileQuestion size={15} /> Request evidence</button><button className="icon-button decision-approve" onClick={() => setDecision("Approved")} title="Approve recommendation" type="button"><Check size={17} /></button><button className="icon-button" onClick={() => setDecision("False positive")} title="Mark false positive" type="button"><Eye size={17} /></button><button className="icon-button decision-escalate" onClick={() => setDecision("Escalated")} title="Escalate case" type="button"><AlertTriangle size={17} /></button></>}
            </div>
          </section>

          <section className="demo-panel agent-trace-panel">
            <div className="panel-heading"><div><span>Explainability</span><h3>Agent execution trace</h3></div><small>Every step inspectable</small></div>
            <div className="agent-trace">{trace.map((item, index) => <article key={item.step}><span>{index + 1}</span><div><strong>{item.step}</strong><p>{item.detail}</p></div><StatusPill label={item.status} tone={item.status === "Blocked" ? "danger" : item.status === "Needs evidence" ? "warning" : "positive"} /></article>)}</div>
          </section>
        </div>

        <section className="demo-panel permission-panel"><div className="panel-heading"><div><span>Tool policy</span><h3>Permissions and purpose limitation</h3></div><ShieldCheck size={18} /></div><div className="permission-grid">{agentToolPermissions.map((item) => <div key={item.tool}><span><strong>{item.tool}</strong><small>{item.purpose}</small></span><StatusPill label={item.access} tone={item.access === "Read only" ? "info" : "warning"} /></div>)}</div></section>
        <section className="demo-panel audit-panel"><div className="panel-heading"><div><span>Governance</span><h3>Human decision history</h3></div><small>Current session</small></div><AuditTimeline events={events} /></section>
      </div>

      <ConfirmDialog confirmDisabled={!evidenceOwner || evidenceRequest.trim().length < 12} confirmLabel="Send evidence request" icon={<FileQuestion size={18} />} onCancel={() => setEvidenceOpen(false)} onConfirm={requestEvidence} open={evidenceOpen} title={`Request evidence for ${selected.id}`}>
        <label className="field-label"><span>Evidence owner</span><input onChange={(event) => setEvidenceOwner(event.target.value)} value={evidenceOwner} /></label><label className="field-label"><span>Requested documents</span><textarea onChange={(event) => setEvidenceRequest(event.target.value)} rows={4} value={evidenceRequest} /></label>
      </ConfirmDialog>
      <ConfirmDialog confirmLabel={`Confirm ${decision?.toLowerCase() ?? "decision"}`} icon={<UserCheck size={18} />} onCancel={() => setDecision(null)} onConfirm={confirmDecision} open={decision !== null} title={`${decision} · ${selected.id}`}>
        <div className="decision-confirmation"><p>You are recording a human decision after reviewing the exception, available evidence, policy retrieval and agent trace.</p><strong>The agent cannot execute a journal, payment or source-system change.</strong></div>
      </ConfirmDialog>
    </div>
  );
}
