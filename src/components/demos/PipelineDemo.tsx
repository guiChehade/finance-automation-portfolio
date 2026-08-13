import { useMemo, useState } from "react";
import { AlertTriangle, Check, CircleDollarSign, Code2, DatabaseZap, GitBranch, Play, Rocket, RotateCcw, ShieldX, Wrench } from "lucide-react";
import { getPipelineRun, mappingRecords, pipelineScenarioLabels, type PipelineRemediation, type PipelineScenario } from "../../domain/portfolioModels";
import { AuditTimeline, ConfirmDialog, type AuditEvent, useSessionState, useToast } from "../interaction/InteractionSystem";
import { DemoKpi, DemoStatusBar, formatMillions, ProductName, StatusPill, SyntheticDemoNotice } from "./DemoShared";

type RunStage = "idle" | "ingest" | "validate" | "reconcile" | "complete";
const stages: Array<{ id: Exclude<RunStage, "idle">; label: string; detail: string }> = [
  { id: "ingest", label: "Ingest", detail: "5 source contracts" },
  { id: "validate", label: "Validate", detail: "Schema, keys, mappings" },
  { id: "reconcile", label: "Reconcile", detail: "Source to finance mart" },
  { id: "complete", label: "Release gate", detail: "Approved snapshot only" },
];

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function PipelineDemo() {
  const [scenario, setScenario] = useState<PipelineScenario>("healthy");
  const [remediation, setRemediation] = useState<PipelineRemediation>({ schemaAlias: false, mappingResolved: false, dedupeRule: "none" });
  const [stage, setStage] = useState<RunStage>("idle");
  const [running, setRunning] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releaseNote, setReleaseNote] = useState("Validated all controls and reconciled the finance mart to approved sources.");
  const [events, setEvents] = useSessionState<AuditEvent[]>("portfolio-v4-pipeline-audit", []);
  const { pushToast } = useToast();

  const result = useMemo(() => getPipelineRun(scenario, remediation), [remediation, scenario]);
  const failedChecks = result.checks.filter((check) => check.status !== "Passed");
  const totalDelta = result.reconciliation.reduce((sum, row) => sum + Math.abs(row.delta), 0);
  const readyToRelease = stage === "complete" && !result.blocked;

  function changeScenario(next: PipelineScenario) {
    setScenario(next);
    setRemediation({ schemaAlias: false, mappingResolved: false, dedupeRule: "none" });
    setStage("idle");
  }

  async function runPipeline() {
    setRunning(true);
    setStage("ingest");
    await delay(420);
    setStage("validate");
    await delay(520);
    setStage("reconcile");
    await delay(520);
    setStage("complete");
    setRunning(false);
    if (result.blocked) {
      setEvents((current) => [{ id: Date.now(), title: `Release held: ${pipelineScenarioLabels[scenario]}`, detail: `${failedChecks.length} control checks require remediation. Approved version 2026.06.2 remains available.`, tone: "blocked" as const }, ...current].slice(0, 6));
      pushToast({ title: "Publication blocked", detail: "The last approved snapshot remains live while the incident is investigated.", tone: "warning" });
    } else {
      pushToast({ title: "Pipeline controls passed", detail: "Version 2026.06.3 is ready for release approval." });
    }
  }

  function applyFix(kind: "schema" | "mapping") {
    setRemediation((current) => ({ ...current, [kind === "schema" ? "schemaAlias" : "mappingResolved"]: true }));
    setStage("idle");
    pushToast({ title: kind === "schema" ? "Schema aliases staged" : "Master-data mappings staged", detail: "Run the pipeline again to validate the remediation.", tone: "info" });
  }

  function release() {
    const event = { id: Date.now(), title: "Finance mart released", detail: `Version ${result.version} published after 5/5 controls passed. Note: ${releaseNote}`, tone: "complete" as const };
    setEvents((current) => [event, ...current].slice(0, 6));
    setReleaseOpen(false);
    pushToast({ title: `Version ${result.version} released`, detail: "The simulated downstream P&L and forecast products were refreshed." });
  }

  return (
    <div className="product-demo pipeline-demo">
      <div className="demo-toolbar pipeline-toolbar">
        <ProductName icon={DatabaseZap} name="LedgerFlow Control Plane" subtitle="Global finance data pipeline" />
        <div className="demo-toolbar-controls"><SyntheticDemoNotice /><button className="button button-primary" disabled={running} onClick={runPipeline} type="button"><Play size={15} /> {running ? "Running controls..." : "Run pipeline"}</button></div>
      </div>

      <div className="demo-content pipeline-console">
        <DemoStatusBar records={`${result.rowsProcessed.toLocaleString("en-US")} rows · 5 source systems`}><strong>Global close · June 2026</strong> · Candidate {result.version}</DemoStatusBar>

        <div className="incident-switcher"><span>Test an operating condition</span><div className="segmented-control">{(Object.keys(pipelineScenarioLabels) as PipelineScenario[]).map((item) => <button className={scenario === item ? "active" : ""} key={item} onClick={() => changeScenario(item)} type="button">{pipelineScenarioLabels[item]}</button>)}</div></div>

        <section className="pipeline-dag" aria-label="Pipeline execution stages">
          {stages.map((item, index) => {
            const activeIndex = stages.findIndex((candidate) => candidate.id === stage);
            const complete = stage !== "idle" && index < activeIndex || stage === "complete";
            const current = item.id === stage && stage !== "complete";
            const blocked = item.id === "complete" && stage === "complete" && result.blocked;
            return <div className={`${complete ? "dag-complete" : ""} ${current ? "dag-current" : ""} ${blocked ? "dag-blocked" : ""}`} key={item.id}><span>{blocked ? <ShieldX size={17} /> : complete ? <Check size={17} /> : index + 1}</span><strong>{item.label}</strong><small>{item.detail}</small></div>;
          })}
        </section>

        <div className="demo-kpi-grid">
          <DemoKpi detail="Current candidate" icon={<DatabaseZap size={17} />} label="Rows processed" value="2.84M" />
          <DemoKpi detail="Automated control suite" icon={<Check size={17} />} label="Checks passed" tone={result.blocked ? "warning" : "positive"} value={`${result.checks.filter((item) => item.status === "Passed").length}/5`} />
          <DemoKpi detail="Absolute source-to-mart delta" icon={<CircleDollarSign size={17} />} label="Reconciliation gap" tone={totalDelta <= 0.02 ? "positive" : "warning"} value={formatMillions(totalDelta)} />
          <DemoKpi detail={result.blocked ? "Approved snapshot retained" : "Candidate cleared"} icon={result.blocked ? <ShieldX size={17} /> : <Rocket size={17} />} label="Release gate" tone={result.blocked ? "warning" : "positive"} value={result.blocked ? "Held" : "Ready"} />
        </div>

        <div className="pipeline-main-grid">
          <section className="demo-panel control-check-panel">
            <div className="panel-heading"><div><span>Data contract</span><h3>Control checks</h3></div><small>Evidence retained by run</small></div>
            <div className="control-check-list">{result.checks.map((check) => <article className={check.status === "Passed" ? "check-passed" : check.status === "Held" ? "check-held" : "check-failed"} key={check.id}><span>{check.status === "Passed" ? <Check size={15} /> : <AlertTriangle size={15} />}</span><div><strong>{check.label}</strong><small>{check.evidence}</small></div><StatusPill label={check.status} tone={check.status === "Passed" ? "positive" : "danger"} /></article>)}</div>
          </section>

          <section className="demo-panel remediation-panel">
            <div className="panel-heading"><div><span>Incident workbench</span><h3>{scenario === "healthy" ? "No remediation required" : pipelineScenarioLabels[scenario]}</h3></div><Wrench size={17} /></div>
            {scenario === "healthy" && <div className="healthy-state"><Check size={24} /><strong>All source contracts are healthy.</strong><p>Run the controls and approve the candidate release.</p></div>}
            {scenario === "schema" && <div className="repair-workbench"><div className="code-diff"><code>- worker_cost_center_id</code><code>+ cost_center_reference_id</code><code>+ effective_date: date</code></div><p>Workday changed two fields after a source release. Create governed aliases without changing the canonical finance model.</p><button className="button button-secondary" disabled={remediation.schemaAlias} onClick={() => applyFix("schema")} type="button"><Code2 size={15} /> {remediation.schemaAlias ? "Aliases staged" : "Stage schema aliases"}</button></div>}
            {scenario === "mapping" && <div className="repair-workbench"><p>23 cost centers arrived without a complete owner hierarchy. Preview the impacted records, then stage the approved master-data patch.</p><div className="mapping-preview">{mappingRecords.slice(0, 4).map((record) => <div key={record.id}><code>{record.id}</code><span>{record.entity}</span><span>{record.department}</span><StatusPill label={record.owner || "Owner missing"} tone={record.owner ? "neutral" : "warning"} /></div>)}</div><button className="button button-secondary" disabled={remediation.mappingResolved} onClick={() => applyFix("mapping")} type="button"><GitBranch size={15} /> {remediation.mappingResolved ? "23 mappings staged" : "Apply approved mapping set"}</button></div>}
            {scenario === "duplicate" && <div className="repair-workbench"><p>14 Salesforce opportunities share a business key after a late source replay. Choose a deterministic resolution rule and rerun the controls.</p><label className="field-label"><span>Deduplication policy</span><select onChange={(event) => { setRemediation((current) => ({ ...current, dedupeRule: event.target.value as PipelineRemediation["dedupeRule"] })); setStage("idle"); }} value={remediation.dedupeRule}><option value="none">Select a governed rule</option><option value="latest-approved">Keep latest approved record</option><option value="source-priority">Apply source-priority hierarchy</option></select></label><div className="duplicate-sample"><code>OPP-98214</code><span>3 source versions</span><span>$0.66M at risk</span></div></div>}
          </section>
        </div>

        <section className="demo-panel reconciliation-panel"><div className="panel-heading"><div><span>Financial control</span><h3>Source-to-mart reconciliation</h3></div><small>USD millions</small></div><div className="demo-table-scroll"><table className="demo-table"><thead><tr><th>Area</th><th>Approved source</th><th>Candidate mart</th><th>Delta</th><th>Exceptions</th><th>Status</th></tr></thead><tbody>{result.reconciliation.map((row) => <tr key={row.area}><th>{row.area}</th><td>{formatMillions(row.source)}</td><td>{formatMillions(row.mart)}</td><td className={Math.abs(row.delta) <= 0.02 ? "positive" : "negative"}>{formatMillions(row.delta, true)}</td><td>{row.exceptions}</td><td><StatusPill label={row.status} tone={row.status === "Matched" ? "positive" : "danger"} /></td></tr>)}</tbody></table></div></section>

        <div className="release-bar"><div>{result.blocked ? <ShieldX size={17} /> : <Rocket size={17} />}<span><strong>{result.blocked ? "Release is blocked" : readyToRelease ? "Candidate is ready" : "Run required"}</strong><small>{result.blocked ? "Resolve the failed control and rerun." : readyToRelease ? "All evidence is available for approval." : "Execute the pipeline to populate the release gate."}</small></span></div><div><button className="button button-secondary" onClick={() => { setStage("idle"); pushToast({ title: "Candidate reset", detail: "Remediations remain staged for the next run.", tone: "info" }); }} type="button"><RotateCcw size={15} /> Reset run</button><button className="button button-primary" disabled={!readyToRelease} onClick={() => setReleaseOpen(true)} type="button"><Rocket size={15} /> Approve release</button></div></div>
        <section className="demo-panel audit-panel"><div className="panel-heading"><div><span>Run history</span><h3>Audit events</h3></div><small>Current session</small></div><AuditTimeline events={events} /></section>
      </div>

      <ConfirmDialog confirmDisabled={releaseNote.trim().length < 12} confirmLabel="Release version" icon={<Rocket size={18} />} onCancel={() => setReleaseOpen(false)} onConfirm={release} open={releaseOpen} title={`Approve finance mart ${result.version}`}>
        <div className="review-impact"><div><span>Controls</span><strong>5/5 passed</strong></div><div><span>Reconciliation</span><strong>99.98%</strong></div><div><span>Rows</span><strong>2.84M</strong></div></div>
        <label className="field-label"><span>Release note</span><textarea onChange={(event) => setReleaseNote(event.target.value)} rows={4} value={releaseNote} /></label>
      </ConfirmDialog>
    </div>
  );
}
