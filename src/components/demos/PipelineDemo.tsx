import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  CloudCog,
  Database,
  FileCheck2,
  GitCompareArrows,
  History,
  LoaderCircle,
  Play,
  RefreshCw,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import {
  getPipelineIncidentDetail,
  getPipelineQualityChecks,
  getPipelineQuarantine,
  getPipelineReconciliation,
  pipelineIncidentLabels,
  type PipelineIncident,
} from "../../cases/demoModels";
import { DemoKpi, formatMillions, ProductName, SyntheticDemoNotice } from "./DemoShared";

type PipelineTab = "Flow" | "Quality" | "Reconciliation" | "Lineage";
type RunState = "idle" | "running" | "ready" | "blocked";

const sourceSystems = [
  { name: "Workday", role: "Actuals and workforce", icon: Building2, rows: "1.2M", contract: "Employees, compensation and time tracking", freshness: "08:17 UTC" },
  { name: "Salesforce", role: "Revenue pipeline", icon: CloudCog, rows: "640K", contract: "Opportunities, probability and client hierarchy", freshness: "08:24 UTC" },
  { name: "Greenhouse", role: "Hiring plan", icon: BriefcaseBusiness, rows: "84K", contract: "Requisitions, stages and planned start dates", freshness: "08:12 UTC" },
  { name: "NetSuite", role: "ERP detail", icon: Database, rows: "810K", contract: "Actuals, cost centers and legal entities", freshness: "08:28 UTC" },
] as const;

const lineageFields = {
  "Net revenue": [
    { stage: "Salesforce", detail: "Opportunity amount + probability" },
    { stage: "Python ingestion", detail: "Snapshot precedence + currency normalization" },
    { stage: "BigQuery", detail: "Client hierarchy + forecast scenario" },
    { stage: "FP&A mart", detail: "net_revenue_usd" },
  ],
  "Personnel costs": [
    { stage: "Workday", detail: "Compensation + employment dates" },
    { stage: "Python ingestion", detail: "Schema contract + effective dating" },
    { stage: "BigQuery", detail: "Time allocation + intercompany markup" },
    { stage: "FP&A mart", detail: "personnel_cost_usd" },
  ],
  "Operating income": [
    { stage: "NetSuite", detail: "Ledger actuals + account mapping" },
    { stage: "SQL transformation", detail: "Management P&L classification" },
    { stage: "Reconciliation", detail: "Source tie-out + exception review" },
    { stage: "Executive model", detail: "operating_income_usd" },
  ],
} as const;

export function PipelineDemo() {
  const [activeTab, setActiveTab] = useState<PipelineTab>("Flow");
  const [incident, setIncident] = useState<PipelineIncident>("healthy");
  const [runState, setRunState] = useState<RunState>("ready");
  const [runLabel, setRunLabel] = useState("Validated 08:42 UTC");
  const [selectedSource, setSelectedSource] = useState<(typeof sourceSystems)[number]["name"]>("Workday");
  const [selectedControl, setSelectedControl] = useState("freshness");
  const [selectedLineage, setSelectedLineage] = useState<keyof typeof lineageFields>("Personnel costs");
  const timerRef = useRef<number | null>(null);

  const checks = useMemo(() => getPipelineQualityChecks(incident), [incident]);
  const incidentDetail = useMemo(() => getPipelineIncidentDetail(incident), [incident]);
  const quarantine = useMemo(() => getPipelineQuarantine(incident), [incident]);
  const reconciliation = useMemo(() => getPipelineReconciliation(incident), [incident]);
  const failedControl = checks.find((check) => check.status === "Failed");
  const currentControl = checks.find((check) => check.id === selectedControl) ?? checks[0];
  const currentSource = sourceSystems.find((source) => source.name === selectedSource) ?? sourceSystems[0];
  const failedCount = checks.filter((check) => check.status === "Failed").length;
  const warningCount = checks.filter((check) => check.status === "Warning").length;

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function chooseIncident(next: PipelineIncident) {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setIncident(next);
    setRunState("idle");
    setRunLabel("Scenario loaded · controls not run");
    setSelectedControl(next === "schema" ? "schema" : next === "mapping" ? "mapping" : next === "duplicate" ? "uniqueness" : "freshness");
    if (next !== "healthy") setSelectedSource(getPipelineIncidentDetail(next).source as (typeof sourceSystems)[number]["name"]);
  }

  function runPipeline() {
    if (runState === "running") return;
    setRunState("running");
    setRunLabel("Validating source contracts and finance controls...");
    timerRef.current = window.setTimeout(() => {
      const nextState = incident === "healthy" ? "ready" : "blocked";
      setRunState(nextState);
      setRunLabel(nextState === "ready" ? "Validated just now · publishing released" : "Publishing blocked · validated snapshot retained");
    }, 1200);
  }

  function openFailedControl() {
    if (!failedControl) return;
    setSelectedControl(failedControl.id);
    setActiveTab("Quality");
  }

  function resolveAndRerun() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setIncident("healthy");
    setSelectedControl("reconciliation");
    setRunState("running");
    setRunLabel("Applying approved control response...");
    timerRef.current = window.setTimeout(() => {
      setRunState("ready");
      setRunLabel("Reprocessed just now · publishing released");
      setActiveTab("Reconciliation");
    }, 1200);
  }

  const runTone = runState === "blocked" ? "run-blocked" : runState === "ready" ? "run-ready" : "";

  return (
    <div className="product-demo pipeline-demo">
      <div className="demo-toolbar">
        <ProductName icon={Database} name="Cobalt Finance Data" subtitle="Control tower" />
        <div className="demo-toolbar-controls">
          <label className="select-control incident-select">
            <span>Simulate run</span>
            <select value={incident} onChange={(event) => chooseIncident(event.target.value as PipelineIncident)}>
              {(Object.keys(pipelineIncidentLabels) as PipelineIncident[]).map((option) => <option key={option} value={option}>{pipelineIncidentLabels[option]}</option>)}
            </select>
          </label>
          <div className={`pipeline-run-state ${runTone}`} aria-live="polite">
            {runState === "running" ? <LoaderCircle className="spin" aria-hidden="true" size={14} /> : runState === "blocked" ? <ShieldCheck aria-hidden="true" size={14} /> : <Check aria-hidden="true" size={14} />}
            {runLabel}
          </div>
          <button className="button button-primary" disabled={runState === "running"} onClick={runPipeline} type="button">
            {runState === "running" ? <RefreshCw className="spin" aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
            {runState === "running" ? "Running controls" : "Run validated refresh"}
          </button>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        {runState === "blocked" && (
          <div className="incident-banner" role="alert">
            <div><ShieldCheck aria-hidden="true" size={20} /><span><strong>{incidentDetail.title}</strong><small>{incidentDetail.description}</small></span></div>
            <button className="button button-secondary" onClick={openFailedControl} type="button">Open failed control <ArrowRight aria-hidden="true" size={15} /></button>
          </div>
        )}

        <div className="demo-kpi-grid">
          <DemoKpi detail="Across ERP, CRM and HRIS" icon={<Database size={17} />} label="Monthly volume" value="2.8M rows" />
          <DemoKpi detail="Source to governed marts" icon={<RefreshCw size={17} />} label="Refresh duration" tone="positive" value="18 min" />
          <DemoKpi detail={`${failedCount} failed · ${warningCount} warning`} icon={<ShieldCheck size={17} />} label="Control results" tone={failedCount ? "warning" : "positive"} value={failedCount ? "Blocked" : "34 passed"} />
          <DemoKpi detail="Before management reporting" icon={<FileCheck2 size={17} />} label="Auto-reconciled" tone={failedCount ? "warning" : "positive"} value={failedCount ? "Held" : "99.8%"} />
        </div>

        <div className="pipeline-tabs" role="tablist" aria-label="Control tower views">
          {(["Flow", "Quality", "Reconciliation", "Lineage"] as PipelineTab[]).map((tab) => (
            <button aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{tab}</button>
          ))}
        </div>

        {activeTab === "Flow" ? (
          <section className="demo-panel pipeline-flow-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Architecture</span><h3>Source-to-report finance pipeline</h3></div><small>4 governed source contracts</small></div>
            <div className="pipeline-flow">
              <div className="pipeline-stage source-stage">
                <span className="pipeline-stage-label">Source systems</span>
                <div className="source-system-grid">
                  {sourceSystems.map(({ icon: Icon, name, role, rows }) => {
                    const affected = incident !== "healthy" && incidentDetail.source === name;
                    return (
                      <button className={`${selectedSource === name ? "active" : ""} ${affected ? "source-warning" : ""}`} key={name} onClick={() => setSelectedSource(name)} type="button">
                        <Icon aria-hidden="true" size={17} /><span><strong>{name}</strong><small>{role} · {rows}</small></span>{affected ? <ShieldCheck aria-label="Issue detected" size={14} /> : <Check aria-label="Ready" size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <ArrowRight className="pipeline-arrow" aria-hidden="true" size={21} />
              <div className={`pipeline-stage transform-stage ${runState === "running" ? "running" : ""}`}>
                <span className="pipeline-stage-label">Ingestion &amp; controls</span><div className="stage-icon"><CloudCog aria-hidden="true" size={24} /></div><strong>Python + APIs</strong><small>Contracts · schema · quarantine</small>
              </div>
              <ArrowRight className="pipeline-arrow" aria-hidden="true" size={21} />
              <div className={`pipeline-stage transform-stage ${runState === "running" ? "running" : ""}`}>
                <span className="pipeline-stage-label">Financial logic</span><div className="stage-icon"><Boxes aria-hidden="true" size={24} /></div><strong>BigQuery + SQL</strong><small>Allocations · markup · scenarios</small>
              </div>
              <ArrowRight className="pipeline-arrow" aria-hidden="true" size={21} />
              <div className={`pipeline-stage output-stage ${runState === "blocked" ? "output-held" : ""}`}>
                <span className="pipeline-stage-label">Governed outputs</span>
                <div className="output-list"><span><TableProperties size={15} /> FP&amp;A marts</span><span><GitCompareArrows size={15} /> Reconciliation</span><span><CircleDollarSign size={15} /> Executive reporting</span></div>
                <small className="pipeline-stage-status">{runState === "blocked" ? "Last validated snapshot retained" : runState === "idle" ? "Validation required before release" : "Current snapshot released"}</small>
              </div>
            </div>
            <div className="source-contract-detail">
              <div><span>Selected source</span><strong>{currentSource.name}</strong></div>
              <div><span>Data contract</span><strong>{currentSource.contract}</strong></div>
              <div><span>Latest snapshot</span><strong>{currentSource.freshness}</strong></div>
              <div><span>Run status</span><strong className={incidentDetail.source === currentSource.name && incident !== "healthy" ? "negative" : "positive"}>{incidentDetail.source === currentSource.name && incident !== "healthy" ? "Control attention required" : "Ready for validation"}</strong></div>
            </div>
          </section>
        ) : activeTab === "Quality" ? (
          <section className="demo-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Control framework</span><h3>Data quality before reporting</h3></div><small>Evidence attached to every result</small></div>
            <div className="quality-workspace">
              <div className="demo-table-scroll">
                <table className="demo-table quality-table">
                  <thead><tr><th>Control</th><th>Scope</th><th>Result</th><th>Evidence</th></tr></thead>
                  <tbody>{checks.map((check) => (
                    <tr className={selectedControl === check.id ? "selected-row" : ""} key={check.id} onClick={() => setSelectedControl(check.id)}>
                      <th><button type="button">{check.control}</button></th><td>{check.scope}</td><td><span className={`control-status control-${check.status.toLowerCase()}`}>{check.status === "Passed" && <Check size={13} />}{check.status}</span></td><td>{check.evidence}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <aside className={`control-detail control-detail-${currentControl.status.toLowerCase()}`}>
                <span>Selected control</span><h4>{currentControl.control}</h4><p>{currentControl.evidence}</p>
                <dl><div><dt>Scope</dt><dd>{currentControl.scope}</dd></div><div><dt>Control response</dt><dd>{currentControl.response}</dd></div><div><dt>Publishing decision</dt><dd>{currentControl.status === "Failed" ? "Hold current run" : currentControl.status === "Warning" ? "Review before release" : "Eligible to publish"}</dd></div></dl>
                {currentControl.status === "Failed" && <button className="button button-primary" onClick={resolveAndRerun} type="button"><RefreshCw aria-hidden="true" size={15} /> Resolve &amp; reprocess</button>}
              </aside>
            </div>
            <div className="quarantine-panel">
              <div className="panel-heading"><div><span>Exception queue</span><h3>Quarantined records</h3></div><small>{quarantine.length} representative records</small></div>
              <div className="demo-table-scroll"><table className="demo-table"><thead><tr><th>Record</th><th>Source</th><th>Reason</th><th>Disposition</th></tr></thead><tbody>{quarantine.map((row) => <tr key={`${row.source}-${row.record}`}><th>{row.record}</th><td>{row.source}</td><td>{row.reason}</td><td><span className="table-status">{row.disposition}</span></td></tr>)}</tbody></table></div>
            </div>
          </section>
        ) : activeTab === "Reconciliation" ? (
          <section className="demo-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Financial control</span><h3>Source-to-mart reconciliation</h3></div><small>USD millions · publishing gate</small></div>
            <div className="demo-table-scroll">
              <table className="demo-table reconciliation-table">
                <thead><tr><th>Finance area</th><th>Source total</th><th>Mart total</th><th>Difference</th><th>Exceptions</th><th>Status</th></tr></thead>
                <tbody>{reconciliation.map((row) => {
                  const difference = row.mart - row.source;
                  return <tr key={row.area}><th>{row.area}</th><td>{formatMillions(row.source)}</td><td>{formatMillions(row.mart)}</td><td className={Math.abs(difference) < 0.01 ? "positive" : "negative"}>{formatMillions(difference, true)}</td><td>{row.exceptions}</td><td><span className={row.status === "Held" ? "control-status control-failed" : "control-pass"}>{row.status === "Matched" && <Check size={13} />}{row.status}</span></td></tr>;
                })}</tbody>
              </table>
            </div>
            <div className="reconciliation-summary"><FileCheck2 aria-hidden="true" size={18} /><span><strong>{incident === "healthy" ? "Release criteria met" : "Current run cannot replace the validated snapshot"}</strong><small>{incident === "healthy" ? "Matched balances and reviewed exceptions are available to downstream reporting." : "A failed upstream control preserves the last approved finance mart."}</small></span></div>
          </section>
        ) : (
          <section className="demo-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Traceability</span><h3>Field-level financial lineage</h3></div><small>Source, rule, control and output</small></div>
            <div className="lineage-workspace">
              <div className="lineage-selector">
                <span>Finance metric</span>
                {(Object.keys(lineageFields) as Array<keyof typeof lineageFields>).map((field) => <button className={selectedLineage === field ? "active" : ""} key={field} onClick={() => setSelectedLineage(field)} type="button">{field}<ArrowRight aria-hidden="true" size={14} /></button>)}
              </div>
              <div className="lineage-chain">
                {lineageFields[selectedLineage].map((node, index) => (
                  <div className="lineage-step" key={node.stage}><article className="lineage-node"><span>Step {index + 1}</span><strong>{node.stage}</strong><small>{node.detail}</small></article>{index < lineageFields[selectedLineage].length - 1 && <ArrowRight aria-hidden="true" size={18} />}</div>
                ))}
              </div>
            </div>
            <div className="pipeline-audit-strip"><History aria-hidden="true" size={15} /><span>Every published value retains source version, transformation rule, control evidence and approval state.</span><strong>Audit-ready</strong></div>
          </section>
        )}
      </div>
    </div>
  );
}
