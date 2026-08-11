import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  CircleDollarSign,
  FileSearch,
  History,
  KeyRound,
  LoaderCircle,
  Play,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  agentToolPermissions,
  getAgentCases,
  getAgentMetrics,
  getAgentTrace,
  type AgentCase,
  type AgentScenario,
} from "../../cases/aiDemoModels";
import { DemoKpi, ProductName, SyntheticDemoNotice } from "./DemoShared";

type AgentTab = "Queue" | "Investigation" | "Governance";

const scenarioLabels: Record<AgentScenario, string> = {
  baseline: "Baseline close",
  duplicate: "Duplicate invoice spike",
  accrual: "Accrual mismatch",
  "prompt-injection": "Prompt injection",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function AiControlsAgentDemo() {
  const [tab, setTab] = useState<AgentTab>("Queue");
  const [scenario, setScenario] = useState<AgentScenario>("baseline");
  const [threshold, setThreshold] = useState(70);
  const [selectedId, setSelectedId] = useState("DUP-204");
  const [runState, setRunState] = useState<"ready" | "running">("ready");
  const [decision, setDecision] = useState("Awaiting controller review");
  const timerRef = useRef<number | null>(null);

  const queue = useMemo(() => getAgentCases(scenario, threshold), [scenario, threshold]);
  const metrics = useMemo(() => getAgentMetrics(queue), [queue]);
  const selectedCase = queue.find((item) => item.id === selectedId) ?? queue[0];
  const trace = selectedCase ? getAgentTrace(selectedCase) : [];

  useEffect(() => {
    if (queue.length && !queue.some((item) => item.id === selectedId)) setSelectedId(queue[0].id);
  }, [queue, selectedId]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function changeScenario(next: AgentScenario) {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setScenario(next);
    setSelectedId(next === "prompt-injection" ? "SEC-001" : next === "accrual" ? "ACC-118" : "DUP-204");
    setDecision("Scenario loaded · triage ready to run");
    setRunState("ready");
  }

  function runTriage() {
    setRunState("running");
    setDecision("Running controls, retrieval and risk scoring...");
    timerRef.current = window.setTimeout(() => {
      setRunState("ready");
      setDecision(scenario === "prompt-injection" ? "Threat blocked · security review required" : `${queue.length} cases prioritized for human review`);
    }, 1050);
  }

  function openCase(item: AgentCase) {
    setSelectedId(item.id);
    setDecision("Awaiting controller review");
    setTab("Investigation");
  }

  return (
    <div className="product-demo ai-agent-demo">
      <div className="demo-toolbar">
        <ProductName icon={Bot} name="Helix Close AI" subtitle="Supervised controls agent" />
        <div className="demo-toolbar-controls">
          <label className="select-control">
            <span>Simulate close</span>
            <select value={scenario} onChange={(event) => changeScenario(event.target.value as AgentScenario)}>
              {(Object.keys(scenarioLabels) as AgentScenario[]).map((option) => <option key={option} value={option}>{scenarioLabels[option]}</option>)}
            </select>
          </label>
          <label className="agent-threshold-control">
            <span>Risk threshold <strong>{threshold}</strong></span>
            <input aria-label="Risk threshold" max="90" min="50" onChange={(event) => setThreshold(Number(event.target.value))} step="5" type="range" value={threshold} />
          </label>
          <button className="button button-primary" disabled={runState === "running"} onClick={runTriage} type="button">
            {runState === "running" ? <LoaderCircle className="spin" aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
            {runState === "running" ? "Running triage" : "Run supervised triage"}
          </button>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        {scenario === "prompt-injection" && (
          <div className="incident-banner agent-security-banner" role="alert">
            <div><ShieldCheck aria-hidden="true" size={20} /><span><strong>Untrusted instruction blocked</strong><small>The document was isolated before retrieval and no write-capable tool is available.</small></span></div>
            <button className="button button-secondary" onClick={() => { setSelectedId("SEC-001"); setTab("Investigation"); }} type="button">Inspect defense trace</button>
          </div>
        )}

        <div className="demo-kpi-grid">
          <DemoKpi detail="Risk-ranked for controllers" icon={<FileSearch size={17} />} label="Current review queue" value={`${metrics.queue} cases`} />
          <DemoKpi detail="On reviewed exceptions" icon={<Check size={17} />} label="Triage precision" tone="positive" value={`${metrics.precision}%`} />
          <DemoKpi detail="Estimated current-cycle capacity" icon={<History size={17} />} label="Review time saved" tone="positive" value={`${metrics.estimatedHours} hrs`} />
          <DemoKpi detail="Human approval is mandatory" icon={<ShieldCheck size={17} />} label="Autonomous postings" tone="positive" value={`${metrics.autonomousPostings}`} />
        </div>

        <div className="agent-permission-strip"><KeyRound size={16} /><span><strong>Tool boundary:</strong> ERP, policy and close history are read only.</span><span><strong>Write tools:</strong> None</span></div>

        <div className="pipeline-tabs ai-view-tabs" role="tablist" aria-label="Controls agent views">
          {(["Queue", "Investigation", "Governance"] as AgentTab[]).map((option) => (
            <button aria-selected={tab === option} className={tab === option ? "active" : ""} key={option} onClick={() => setTab(option)} role="tab" type="button">{option}</button>
          ))}
        </div>

        {tab === "Queue" ? (
          <section className="demo-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Prioritized exceptions</span><h3>Controller review queue</h3></div><small>Risk score ≥ {threshold}</small></div>
            <div className="demo-table-scroll">
              <table className="demo-table agent-queue-table">
                <thead><tr><th>Case</th><th>Type</th><th>Entity</th><th>Amount</th><th>Risk</th><th>Status</th></tr></thead>
                <tbody>{queue.map((item) => (
                  <tr className={item.id === selectedCase?.id ? "selected-row" : ""} key={item.id} onClick={() => openCase(item)}>
                    <th><button type="button">{item.id}</button></th><td>{item.type}</td><td>{item.entity}</td><td>{item.amount ? formatCurrency(item.amount) : "N/A"}</td><td><span className={`agent-risk risk-${item.risk >= 90 ? "high" : item.risk >= 75 ? "medium" : "low"}`}>{item.risk}</span></td><td><span className={`table-status status-${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="agent-queue-footer"><span aria-live="polite">{decision}</span><small>Changing the threshold reprioritizes review; it never auto-clears an exception.</small></div>
          </section>
        ) : tab === "Investigation" && selectedCase ? (
          <section className="agent-investigation-grid" role="tabpanel">
            <article className="demo-panel agent-case-panel">
              <div className="panel-heading"><div><span>{selectedCase.id}</span><h3>{selectedCase.type}</h3></div><span className={`agent-risk risk-${selectedCase.risk >= 90 ? "high" : "medium"}`}>{selectedCase.risk}/100</span></div>
              <p className="agent-case-description">{selectedCase.description}</p>
              <dl className="agent-case-facts"><div><dt>Entity</dt><dd>{selectedCase.entity}</dd></div><div><dt>Exposure</dt><dd>{selectedCase.amount ? formatCurrency(selectedCase.amount) : "Security event"}</dd></div><div><dt>State</dt><dd>{selectedCase.status}</dd></div></dl>
              <div className="agent-evidence"><span>Retrieved evidence</span>{selectedCase.evidence.map((entry) => <p key={entry}><Check size={14} />{entry}</p>)}</div>
              <div className="agent-recommendation"><Bot size={18} /><div><strong>Agent recommendation</strong><p>{selectedCase.recommendation}</p></div></div>
              <div className="ai-review-actions">
                <span aria-live="polite">{decision}</span>
                <div>
                  <button className="button button-secondary" onClick={() => setDecision("Marked as false positive · feedback logged")} type="button">False positive</button>
                  <button className="button button-secondary" onClick={() => setDecision("Escalated to the control owner")} type="button"><AlertTriangle size={15} /> Escalate</button>
                  <button className="button button-primary" disabled={selectedCase.status === "Blocked" || selectedCase.status === "Needs evidence"} onClick={() => setDecision("Recommendation approved · action assigned to human owner")} type="button"><Check size={15} /> Approve recommendation</button>
                </div>
              </div>
            </article>
            <aside className="demo-panel agent-trace-panel">
              <div className="panel-heading"><div><span>Execution trace</span><h3>What the agent did</h3></div><small>Auditable tool path</small></div>
              <div className="agent-trace">
                {trace.map((entry, index) => (
                  <article className={entry.status === "Blocked" ? "blocked" : ""} key={entry.step}>
                    <span>{index + 1}</span><div><strong>{entry.step}</strong><p>{entry.detail}</p><small>{entry.status}</small></div>
                  </article>
                ))}
              </div>
            </aside>
          </section>
        ) : (
          <section className="agent-governance-grid" role="tabpanel">
            <article className="demo-panel">
              <div className="panel-heading"><div><span>Least privilege</span><h3>Agent tool permissions</h3></div><KeyRound size={18} /></div>
              <div className="agent-access-list">
                {agentToolPermissions.map((permission) => (
                  <article key={permission.tool}><ShieldCheck size={17} /><div><strong>{permission.tool}</strong><p>{permission.purpose}</p></div><span>{permission.access}</span></article>
                ))}
              </div>
            </article>
            <article className="demo-panel">
              <div className="panel-heading"><div><span>Evaluation & feedback</span><h3>Production control record</h3></div><History size={18} /></div>
              <div className="agent-governance-metrics">
                <div><span>Exception precision</span><strong>82%</strong><small>Target ≥ 80%</small></div>
                <div><span>Critical recall</span><strong>97%</strong><small>Target ≥ 95%</small></div>
                <div><span>Unsafe action rate</span><strong>0%</strong><small>Target = 0%</small></div>
              </div>
              <div className="agent-feedback-ledger">
                <span>Recent reviewer feedback</span>
                <p><Check size={14} /> Duplicate confirmed · signal retained</p>
                <p><RefreshCw size={14} /> Accrual false positive · threshold recalibrated</p>
                <p><ShieldCheck size={14} /> Injection test blocked · defense passed</p>
              </div>
            </article>
            <article className="demo-panel agent-control-boundary">
              <CircleDollarSign size={22} /><div><strong>Segregation of duties stays intact</strong><p>The agent prepares evidence and a recommendation. A named controller decides; the ERP posting remains a separate human-controlled step.</p></div>
            </article>
          </section>
        )}
      </div>
    </div>
  );
}
