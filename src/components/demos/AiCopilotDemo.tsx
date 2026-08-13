import { useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, BrainCircuit, Check, FileCheck2, Link2, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { evaluateCopilot, getCopilotCase, type CopilotClaim, type CopilotMode, type CopilotScenario } from "../../domain/portfolioModels";
import { AuditTimeline, ConfirmDialog, type AuditEvent, useSessionState, useToast } from "../interaction/InteractionSystem";
import { DemoKpi, DemoStatusBar, ProductName, StatusPill, SyntheticDemoNotice } from "./DemoShared";

const scenarioLabels: Record<CopilotScenario, string> = { complete: "Complete evidence", stale: "Stale owner input", "missing-owner": "Missing owner input", conflicting: "Conflicting sources" };
const modes: CopilotMode[] = ["CFO Brief", "Regional Review", "Email Summary"];
type GenerationStage = "idle" | "retrieving" | "drafting" | "checking" | "ready";
const pause = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function AiCopilotDemo() {
  const [scenario, setScenario] = useState<CopilotScenario>("complete");
  const [mode, setMode] = useState<CopilotMode>("CFO Brief");
  const [stage, setStage] = useState<GenerationStage>("idle");
  const [claims, setClaims] = useState<CopilotClaim[]>(() => getCopilotCase("complete", "CFO Brief").claims);
  const [resolved, setResolved] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState("E-401");
  const [approveOpen, setApproveOpen] = useState(false);
  const [recipients, setRecipients] = useState("CFO Staff and Regional Finance Directors");
  const [events, setEvents] = useSessionState<AuditEvent[]>("portfolio-v4-copilot-audit", []);
  const { pushToast } = useToast();

  const sourceCase = useMemo(() => getCopilotCase(scenario, mode), [mode, scenario]);
  const evidence = useMemo(() => sourceCase.evidence.map((item) => resolved && item.status !== "Ready" ? { ...item, value: item.id === "E-403" ? 0.8 : item.value, detail: `${item.detail} · reviewer resolution attached`, refreshed: "Just now", status: "Ready" as const } : item), [resolved, sourceCase.evidence]);
  const evaluation = useMemo(() => evaluateCopilot(claims, evidence), [claims, evidence]);
  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId) ?? evidence[0];
  const generated = stage === "ready";

  function reset(nextScenario = scenario, nextMode = mode) {
    const next = getCopilotCase(nextScenario, nextMode);
    setClaims(next.claims);
    setResolved(false);
    setStage("idle");
  }

  async function generate() {
    setStage("retrieving");
    await pause(420);
    setStage("drafting");
    await pause(480);
    setStage("checking");
    await pause(520);
    setStage("ready");
    pushToast({ title: "Draft and control checks complete", detail: evaluation.approvalReady ? "Every material claim is grounded and numerically consistent." : "The draft is held until the evidence exception is resolved.", tone: evaluation.approvalReady ? "success" : "warning" });
  }

  function resolveEvidence() {
    setResolved(true);
    setStage("idle");
    setEvents((current) => [{ id: Date.now(), title: "Evidence exception resolved", detail: `${scenarioLabels[scenario]} reviewed; source status and resolution note retained.`, tone: "complete" as const }, ...current].slice(0, 6));
    pushToast({ title: "Evidence resolution attached", detail: "Regenerate the brief to run all control checks again.", tone: "info" });
  }

  function editClaim(id: string, text: string) {
    setClaims((current) => current.map((claim) => claim.id === id ? { ...claim, text } : claim));
    setStage("idle");
  }

  function approve() {
    const event: AuditEvent = { id: Date.now(), title: `${mode} approved and distributed`, detail: `${claims.length} claims with ${evidence.length} evidence objects sent to ${recipients}.`, tone: "complete" };
    setEvents((current) => [event, ...current].slice(0, 6));
    setApproveOpen(false);
    pushToast({ title: "Executive brief distributed", detail: `${recipients} received the approved simulated narrative.` });
  }

  return (
    <div className="product-demo copilot-demo">
      <div className="demo-toolbar copilot-toolbar">
        <ProductName icon={BrainCircuit} name="FinSight Evidence Copilot" subtitle="Controlled finance narrative" />
        <div className="demo-toolbar-controls"><div className="segmented-control">{modes.map((item) => <button className={mode === item ? "active" : ""} key={item} onClick={() => { setMode(item); reset(scenario, item); }} type="button">{item}</button>)}</div><SyntheticDemoNotice /></div>
      </div>

      <div className="demo-content copilot-workbench">
        <DemoStatusBar records="5 governed evidence objects · 4 draft claims"><strong>June performance review</strong> · Retrieval scope: approved finance sources only</DemoStatusBar>

        <div className="copilot-command-bar">
          <label><span>Evidence condition</span><select onChange={(event) => { const next = event.target.value as CopilotScenario; setScenario(next); reset(next, mode); }} value={scenario}>{(Object.keys(scenarioLabels) as CopilotScenario[]).map((item) => <option key={item} value={item}>{scenarioLabels[item]}</option>)}</select></label>
          <div className="generation-progress">{(["retrieving", "drafting", "checking"] as GenerationStage[]).map((item, index) => <span className={stage === item || (["drafting", "checking", "ready"].includes(stage) && index === 0) || (["checking", "ready"].includes(stage) && index === 1) || stage === "ready" && index === 2 ? "complete" : ""} key={item}>{index + 1}<small>{item === "retrieving" ? "Retrieve" : item === "drafting" ? "Draft" : "Validate"}</small></span>)}</div>
          <button className="button button-primary" disabled={["retrieving", "drafting", "checking"].includes(stage)} onClick={generate} type="button"><RefreshCw className={["retrieving", "drafting", "checking"].includes(stage) ? "spin" : ""} size={15} /> {stage === "idle" ? "Generate controlled brief" : generated ? "Regenerate brief" : "Working..."}</button>
        </div>

        <div className="demo-kpi-grid">
          <DemoKpi detail="Target ≥ 95%" icon={<ShieldCheck size={17} />} label="Groundedness" tone={evaluation.scores[0].score >= 95 ? "positive" : "warning"} value={`${evaluation.scores[0].score}%`} />
          <DemoKpi detail="Every claim has source IDs" icon={<Link2 size={17} />} label="Citation coverage" tone={evaluation.scores[1].score === 100 ? "positive" : "warning"} value={`${evaluation.scores[1].score.toFixed(0)}%`} />
          <DemoKpi detail="Amounts checked to sources" icon={<FileCheck2 size={17} />} label="Numerical consistency" tone={evaluation.scores[2].score === 100 ? "positive" : "warning"} value={`${evaluation.scores[2].score}%`} />
          <DemoKpi detail={evaluation.approvalReady ? "All controls passed" : "Human resolution required"} icon={evaluation.approvalReady ? <Check size={17} /> : <AlertTriangle size={17} />} label="Approval gate" tone={evaluation.approvalReady ? "positive" : "warning"} value={evaluation.approvalReady ? "Ready" : "Held"} />
        </div>

        <div className="copilot-main-grid">
          <section className="demo-panel evidence-library">
            <div className="panel-heading"><div><span>Retrieval</span><h3>Evidence library</h3></div><small>Click a source to inspect</small></div>
            <div className="evidence-list">{evidence.map((item) => <button className={selectedEvidence.id === item.id ? "active" : ""} key={item.id} onClick={() => setSelectedEvidenceId(item.id)} type="button"><span><code>{item.id}</code><StatusPill label={item.status} tone={item.status === "Ready" ? "positive" : "danger"} /></span><strong>{item.source}</strong><small>{item.detail}</small></button>)}</div>
            <article className="evidence-inspector"><span>Selected source</span><h4>{selectedEvidence.id} · {selectedEvidence.source}</h4><dl><div><dt>Financial value</dt><dd>${selectedEvidence.value.toFixed(1)}M</dd></div><div><dt>Refreshed</dt><dd>{selectedEvidence.refreshed}</dd></div><div><dt>Status</dt><dd>{selectedEvidence.status}</dd></div></dl></article>
            {evaluation.invalidEvidence.length > 0 && !resolved && <button className="button button-secondary evidence-resolve" onClick={resolveEvidence} type="button"><BookOpenCheck size={15} /> Review and resolve evidence gap</button>}
          </section>

          <section className="demo-panel controlled-brief">
            <div className="panel-heading"><div><span>Generated output</span><h3>{mode}</h3></div><StatusPill label={generated ? evaluation.approvalReady ? "Validated" : "Held" : "Draft not validated"} tone={generated && evaluation.approvalReady ? "positive" : "warning"} /></div>
            <div className={`brief-document ${generated ? "brief-generated" : ""}`}>
              <header><span>NORTHLINE · FINANCE LEADERSHIP</span><strong>June operating performance</strong><small>Controlled draft · citations open underlying evidence</small></header>
              {claims.map((claim) => <div className="claim-row" key={claim.id}><span>{claim.id}</span><textarea aria-label={`Edit ${claim.id}`} onChange={(event) => editClaim(claim.id, event.target.value)} rows={2} value={claim.text} /><div>{claim.evidenceIds.map((id) => <button key={id} onClick={() => setSelectedEvidenceId(id)} type="button">[{id}]</button>)}</div></div>)}
              <div className="decision-callout"><span>Decision prompt</span><p>{sourceCase.action}</p></div>
            </div>
            {!evaluation.approvalReady && <div className="validation-hold"><AlertTriangle size={17} /><span><strong>Distribution is blocked.</strong><small>{evaluation.invalidEvidence.length ? `${evaluation.invalidEvidence.length} evidence exception requires review.` : `${evaluation.numericFailures.length} numerical claim requires correction.`}</small></span></div>}
            <div className="panel-actions"><button className="button button-secondary" onClick={() => reset()} type="button"><RefreshCw size={15} /> Reset draft</button><button className="button button-primary" disabled={!generated || !evaluation.approvalReady} onClick={() => setApproveOpen(true)} type="button"><Send size={15} /> Approve & distribute</button></div>
          </section>
        </div>

        <section className="demo-panel scorecard-panel"><div className="panel-heading"><div><span>Evaluation harness</span><h3>Control scorecard</h3></div><small>Deterministic checks before human approval</small></div><div className="scorecard-grid">{evaluation.scores.map((score) => <div key={score.label}><span><strong>{score.label}</strong><small>Target {score.target}%</small></span><div><i style={{ width: `${Math.min(score.score, 100)}%` }} /></div><b className={score.score >= score.target ? "positive" : "negative"}>{score.score.toFixed(0)}%</b></div>)}</div></section>
        <section className="demo-panel audit-panel"><div className="panel-heading"><div><span>Governance</span><h3>Approval history</h3></div><small>Current session</small></div><AuditTimeline events={events} /></section>
      </div>

      <ConfirmDialog confirmDisabled={!recipients} confirmLabel="Approve and distribute" icon={<Send size={18} />} onCancel={() => setApproveOpen(false)} onConfirm={approve} open={approveOpen} title={`Approve ${mode}`}>
        <div className="review-impact"><div><span>Claims</span><strong>{claims.length}</strong></div><div><span>Citations</span><strong>{claims.reduce((sum, claim) => sum + claim.evidenceIds.length, 0)}</strong></div><div><span>Controls</span><strong>5/5 passed</strong></div></div>
        <label className="field-label"><span>Distribution group</span><input onChange={(event) => setRecipients(event.target.value)} value={recipients} /></label>
        <div className="email-preview"><small>SUBJECT</small><strong>June performance · approved {mode.toLowerCase()}</strong><p>This message includes the validated executive brief and a governed evidence appendix.</p></div>
      </ConfirmDialog>
    </div>
  );
}
