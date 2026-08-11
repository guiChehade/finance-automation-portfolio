import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  BrainCircuit,
  Check,
  CheckCircle2,
  FileSearch,
  LoaderCircle,
  MessageSquareText,
  Play,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  copilotVariances,
  getCopilotOutput,
  type CopilotEvidenceScenario,
  type CopilotMode,
  type CopilotVarianceId,
} from "../../cases/aiDemoModels";
import { DemoKpi, formatMillions, ProductName, SyntheticDemoNotice } from "./DemoShared";

type CopilotView = "Review" | "Evaluation";
type GenerationState = "ready" | "running";

const scenarioLabels: Record<CopilotEvidenceScenario, string> = {
  complete: "Complete evidence",
  stale: "Stale source",
  "missing-owner": "Missing owner input",
};

export function AiCopilotDemo() {
  const [view, setView] = useState<CopilotView>("Review");
  const [scenario, setScenario] = useState<CopilotEvidenceScenario>("complete");
  const [mode, setMode] = useState<CopilotMode>("CFO Brief");
  const [varianceId, setVarianceId] = useState<CopilotVarianceId>("revenue");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState("E-101");
  const [generationState, setGenerationState] = useState<GenerationState>("ready");
  const [decision, setDecision] = useState("Awaiting finance review");
  const timerRef = useRef<number | null>(null);

  const output = useMemo(() => getCopilotOutput(varianceId, scenario, mode), [varianceId, scenario, mode]);
  const selectedEvidence = output.evidence.find((item) => item.id === selectedEvidenceId) ?? output.evidence[0];

  useEffect(() => {
    setSelectedEvidenceId(output.evidence[0].id);
    setDecision("Awaiting finance review");
  }, [output.evidence]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function generateCommentary() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setGenerationState("running");
    setDecision("Evaluating claims and citations...");
    timerRef.current = window.setTimeout(() => {
      setGenerationState("ready");
      setDecision(output.approvalReady ? "Ready for finance review" : "Evidence gate requires attention");
    }, 950);
  }

  function changeScenario(next: CopilotEvidenceScenario) {
    setScenario(next);
    setDecision("Scenario loaded · regenerate before approval");
  }

  return (
    <div className="product-demo ai-copilot-demo">
      <div className="demo-toolbar">
        <ProductName icon={BrainCircuit} name="Asteron Variance AI" subtitle="Governed commentary copilot" />
        <div className="demo-toolbar-controls">
          <label className="select-control">
            <span>Evidence scenario</span>
            <select value={scenario} onChange={(event) => changeScenario(event.target.value as CopilotEvidenceScenario)}>
              {(Object.keys(scenarioLabels) as CopilotEvidenceScenario[]).map((option) => (
                <option key={option} value={option}>{scenarioLabels[option]}</option>
              ))}
            </select>
          </label>
          <div className="segmented-control" aria-label="Commentary audience">
            {(["CFO Brief", "Regional Review"] as CopilotMode[]).map((option) => (
              <button className={mode === option ? "active" : ""} key={option} onClick={() => setMode(option)} type="button">{option}</button>
            ))}
          </div>
          <button className="button button-primary" disabled={generationState === "running"} onClick={generateCommentary} type="button">
            {generationState === "running" ? <LoaderCircle className="spin" aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
            {generationState === "running" ? "Evaluating" : "Generate brief"}
          </button>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        {!output.approvalReady && (
          <div className="incident-banner" role="alert">
            <div><AlertTriangle aria-hidden="true" size={20} /><span><strong>Publication gate is closed</strong><small>{output.issues[0]}</small></span></div>
            <button className="button button-secondary" onClick={() => setView("Evaluation")} type="button">Review evaluation</button>
          </div>
        )}

        <div className="demo-kpi-grid">
          <DemoKpi detail="Claims supported by approved evidence" icon={<ShieldCheck size={17} />} label="Groundedness" tone={output.groundedness >= 95 ? "positive" : "warning"} value={`${output.groundedness}%`} />
          <DemoKpi detail="Claim-level source references" icon={<FileSearch size={17} />} label="Citation coverage" tone={output.citationCoverage === 100 ? "positive" : "warning"} value={`${output.citationCoverage}%`} />
          <DemoKpi detail="Finance remains accountable" icon={<CheckCircle2 size={17} />} label="Approval state" tone={output.approvalReady ? "positive" : "warning"} value={output.approvalReady ? "Review ready" : "Blocked"} />
          <DemoKpi detail="Schema-constrained response" icon={<BrainCircuit size={17} />} label="Model output" value="5 fields" />
        </div>

        <div className="pipeline-tabs ai-view-tabs" role="tablist" aria-label="Copilot views">
          {(["Review", "Evaluation"] as CopilotView[]).map((tab) => (
            <button aria-selected={view === tab} className={view === tab ? "active" : ""} key={tab} onClick={() => setView(tab)} role="tab" type="button">{tab}</button>
          ))}
        </div>

        {view === "Review" ? (
          <section className="ai-copilot-grid" role="tabpanel">
            <aside className="demo-panel ai-variance-panel">
              <div className="panel-heading"><div><span>Materiality queue</span><h3>Variance topics</h3></div><small>USD millions</small></div>
              <div className="ai-variance-list">
                {copilotVariances.map((item) => (
                  <button className={varianceId === item.id ? "active" : ""} key={item.id} onClick={() => setVarianceId(item.id)} type="button">
                    <span><strong>{item.label}</strong><small>{item.owner}</small></span>
                    <span className={item.variance >= 0 ? "positive" : "negative"}>{formatMillions(item.variance, true)}<small>{item.materiality}</small></span>
                  </button>
                ))}
              </div>
            </aside>

            <article className="demo-panel ai-commentary-panel">
              <div className="panel-heading"><div><span>Generated output</span><h3>{mode}</h3></div><small>Prompt v3.4 · finance schema</small></div>
              <div className={`ai-generation-state ${generationState === "running" ? "running" : ""}`}>
                {generationState === "running" ? <LoaderCircle className="spin" size={18} /> : <MessageSquareText size={18} />}
                <p>{generationState === "running" ? "Retrieving approved evidence and evaluating each claim..." : output.headline}</p>
              </div>
              <div className="ai-claim-list">
                <span className="ai-section-label">Cited claims</span>
                {output.claims.map((claim, index) => (
                  <article key={claim.text}>
                    <span>{index + 1}</span>
                    <p>{claim.text}</p>
                    <div>{claim.evidenceIds.map((evidenceId) => <button key={evidenceId} onClick={() => setSelectedEvidenceId(evidenceId)} type="button">{evidenceId}</button>)}</div>
                  </article>
                ))}
              </div>
              <div className="ai-action-block"><strong>Recommended follow-up</strong><p>{output.action}</p></div>
              <div className="ai-review-actions">
                <span aria-live="polite">{decision}</span>
                <div>
                  <button className="icon-action reject" aria-label="Reject commentary" title="Reject commentary" onClick={() => setDecision("Rejected · analyst revision requested")} type="button"><X size={16} /></button>
                  <button className="button button-secondary" onClick={() => setDecision("Additional owner evidence requested")} type="button"><RefreshCw size={15} /> Request evidence</button>
                  <button className="button button-primary" disabled={!output.approvalReady || generationState === "running"} onClick={() => setDecision("Approved by Finance · ready to publish")} type="button"><Check size={15} /> Approve</button>
                </div>
              </div>
            </article>

            <aside className="demo-panel ai-evidence-panel">
              <div className="panel-heading"><div><span>Evidence graph</span><h3>Source package</h3></div><small>{output.evidence.length} records</small></div>
              <div className="ai-evidence-list">
                {output.evidence.map((item) => (
                  <button className={`${selectedEvidence.id === item.id ? "active" : ""} status-${item.status.toLowerCase()}`} key={item.id} onClick={() => setSelectedEvidenceId(item.id)} type="button">
                    <span><strong>{item.id}</strong><small>{item.source}</small></span>
                    <span>{item.status === "Ready" ? <Check size={14} /> : <AlertTriangle size={14} />}{item.status}</span>
                  </button>
                ))}
              </div>
              <div className="ai-evidence-detail">
                <span>Selected evidence</span><strong>{selectedEvidence.source}</strong><p>{selectedEvidence.detail}</p>
                <dl><div><dt>Reference</dt><dd>{selectedEvidence.id}</dd></div><div><dt>Refreshed</dt><dd>{selectedEvidence.refreshed}</dd></div><div><dt>Control state</dt><dd>{selectedEvidence.status}</dd></div></dl>
              </div>
            </aside>
          </section>
        ) : (
          <section className="ai-evaluation-grid" role="tabpanel">
            <article className="demo-panel">
              <div className="panel-heading"><div><span>Quality gate</span><h3>Automated evaluation</h3></div><small>Minimum thresholds before review</small></div>
              <div className="demo-table-scroll">
                <table className="demo-table ai-evaluation-table">
                  <thead><tr><th>Metric</th><th>Score</th><th>Target</th><th>Result</th></tr></thead>
                  <tbody>{output.evaluation.map((item) => (
                    <tr key={item.metric}><th>{item.metric}</th><td>{item.score}%</td><td>{item.target}%</td><td><span className={`control-status ${item.status === "Pass" ? "control-passed" : "control-warning"}`}>{item.status === "Pass" && <Check size={13} />}{item.status}</span></td></tr>
                  ))}</tbody>
                </table>
              </div>
              {output.issues.length > 0 && <div className="ai-evaluation-issues"><AlertTriangle size={17} /><div><strong>Required remediation</strong>{output.issues.map((issue) => <p key={issue}>{issue}</p>)}</div></div>}
            </article>
            <aside className="demo-panel ai-registry-panel">
              <div className="panel-heading"><div><span>AI registry</span><h3>Reproducible release</h3></div><BookOpenCheck size={18} /></div>
              <dl>
                <div><dt>Model endpoint</dt><dd>enterprise-llm-02</dd></div>
                <div><dt>Prompt version</dt><dd>variance-brief-v3.4</dd></div>
                <div><dt>Output contract</dt><dd>commentary-schema-v2</dd></div>
                <div><dt>Retrieval policy</dt><dd>approved-finance-evidence</dd></div>
                <div><dt>Human decision</dt><dd>Required before publish</dd></div>
              </dl>
              <div className="ai-policy-note"><ShieldCheck size={17} /><span><strong>Control principle</strong><small>Fluent output never overrides missing evidence.</small></span></div>
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}
