import { useMemo, useState } from "react";
import {
  Check,
  CircleDollarSign,
  GitCompareArrows,
  History,
  RefreshCw,
  Save,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateForecast,
  forecastPresets,
  getForecastChanges,
  type ForecastDrivers,
  type ForecastPreset,
} from "../../cases/demoModels";
import { DemoKpi, formatMillions, ProductName, SyntheticDemoNotice } from "./DemoShared";

type WorkspaceView = "Plan" | "Activity";

type VersionEntry = {
  id: number;
  scenario: string;
  author: string;
  time: string;
  reason: string;
  ebitda: number;
  changes: number;
};

const driverConfig: Array<{
  key: keyof ForecastDrivers;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  { key: "revenueGrowth", label: "Revenue growth", description: "Commercial outlook vs prior year", min: -5, max: 14, step: 0.5, suffix: "%" },
  { key: "utilization", label: "Utilization", description: "Billable capacity across delivery teams", min: 62, max: 88, step: 1, suffix: "%" },
  { key: "headcount", label: "Year-end headcount", description: "Employees active at year end", min: 380, max: 470, step: 1, suffix: " FTE" },
  { key: "wageInflation", label: "Wage inflation", description: "Annualized salary movement", min: 2, max: 8, step: 0.5, suffix: "%" },
  { key: "contractorMix", label: "Contractor mix", description: "External capacity as share of workforce", min: 5, max: 30, step: 1, suffix: "%" },
];

const initialHistory: VersionEntry[] = [
  { id: 2, scenario: "Base", author: "Regional FP&A", time: "Today, 09:18", reason: "Aligned hiring dates with approved requisitions.", ebitda: 13.7, changes: 2 },
  { id: 1, scenario: "Base", author: "Global Planning", time: "Yesterday, 16:42", reason: "Opened the planning cycle with finance-approved assumptions.", ebitda: 13.7, changes: 5 },
];

function findPreset(drivers: ForecastDrivers): ForecastPreset | "Custom" {
  const match = (Object.keys(forecastPresets) as ForecastPreset[]).find((name) => (
    (Object.keys(drivers) as Array<keyof ForecastDrivers>).every((key) => drivers[key] === forecastPresets[name][key])
  ));
  return match ?? "Custom";
}

function formatDriverValue(value: number, suffix: string) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}${suffix}`;
}

export function ForecastDemo() {
  const [view, setView] = useState<WorkspaceView>("Plan");
  const [scenario, setScenario] = useState<ForecastPreset | "Custom">("Base");
  const [drivers, setDrivers] = useState<ForecastDrivers>({ ...forecastPresets.Base });
  const [savedDrivers, setSavedDrivers] = useState<ForecastDrivers>({ ...forecastPresets.Base });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [history, setHistory] = useState<VersionEntry[]>(initialHistory);

  const model = useMemo(() => calculateForecast(drivers), [drivers]);
  const savedModel = useMemo(() => calculateForecast(savedDrivers), [savedDrivers]);
  const changes = useMemo(() => getForecastChanges(savedDrivers, drivers), [drivers, savedDrivers]);
  const dirty = changes.length > 0;
  const totalEbitdaImpact = model.ebitda - savedModel.ebitda;

  function applyPreset(next: ForecastPreset) {
    setScenario(next);
    setDrivers({ ...forecastPresets[next] });
    setReviewOpen(false);
    setSavedMessage("");
  }

  function updateDriver(key: keyof ForecastDrivers, value: number) {
    setDrivers((current) => ({ ...current, [key]: value }));
    setScenario("Custom");
    setReviewOpen(false);
    setSavedMessage("");
  }

  function discardDraft() {
    setDrivers({ ...savedDrivers });
    setScenario(findPreset(savedDrivers));
    setReviewOpen(false);
    setReason("");
    setSavedMessage("Draft changes discarded");
  }

  function saveVersion() {
    if (!dirty || reason.trim().length < 12) return;
    setHistory((current) => [
      {
        id: Date.now(),
        scenario,
        author: "You",
        time: "Just now",
        reason: reason.trim(),
        ebitda: model.ebitda,
        changes: changes.length,
      },
      ...current,
    ]);
    setSavedDrivers({ ...drivers });
    setReviewOpen(false);
    setReason("");
    setSavedMessage("Version saved with rationale");
  }

  return (
    <div className="product-demo forecast-demo">
      <div className="demo-toolbar">
        <ProductName icon={GitCompareArrows} name="Fieldstone Outlook" subtitle="Global planning workspace" />
        <div className="demo-toolbar-controls">
          <div className="segmented-control" aria-label="Workspace view">
            {(["Plan", "Activity"] as WorkspaceView[]).map((option) => (
              <button aria-pressed={view === option} className={view === option ? "active" : ""} key={option} onClick={() => setView(option)} type="button">
                {option === "Activity" && <History aria-hidden="true" size={13} />}{option}
              </button>
            ))}
          </div>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        <div className="workspace-status-row">
          <div><span className={`status-dot ${dirty ? "status-dot-warning" : ""}`} /> FY26 Outlook · Global Services</div>
          <div aria-live="polite">{savedMessage ? <><Check size={14} /> {savedMessage}</> : dirty ? `${changes.length} unsaved driver change${changes.length === 1 ? "" : "s"}` : "Current version is saved"}</div>
        </div>

        {view === "Activity" ? (
          <section className="demo-panel activity-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Governance</span><h3>Forecast version history</h3></div><small>Reason, author and impact retained</small></div>
            <div className="demo-table-scroll">
              <table className="demo-table activity-table">
                <thead><tr><th>Version</th><th>Scenario</th><th>Owner</th><th>Changes</th><th>EBITDA</th><th>Saved rationale</th></tr></thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={entry.id}>
                      <th>v{history.length - index}<small>{entry.time}</small></th>
                      <td><span className="table-status">{entry.scenario}</span></td>
                      <td>{entry.author}</td>
                      <td>{entry.changes} inputs</td>
                      <td>{formatMillions(entry.ebitda)}</td>
                      <td>{entry.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <>
            <div className="scenario-bar">
              <div><span>Scenario presets</span><strong>{scenario} outlook</strong></div>
              <div className="segmented-control" aria-label="Forecast scenario">
                {(Object.keys(forecastPresets) as ForecastPreset[]).map((option) => (
                  <button aria-pressed={scenario === option} className={scenario === option ? "active" : ""} key={option} onClick={() => applyPreset(option)} type="button">{option}</button>
                ))}
              </div>
            </div>

            <div className="demo-kpi-grid">
              <DemoKpi detail={`${scenario} scenario`} icon={<CircleDollarSign size={17} />} label="FY net revenue" value={formatMillions(model.revenue)} />
              <DemoKpi detail={`${totalEbitdaImpact >= 0 ? "+" : ""}${formatMillions(totalEbitdaImpact)} vs saved`} icon={<Sparkles size={17} />} label="EBITDA" tone={model.margin >= 14 ? "positive" : "warning"} value={formatMillions(model.ebitda)} />
              <DemoKpi detail="After modeled costs" icon={<GitCompareArrows size={17} />} label="EBITDA margin" tone={model.margin >= 14 ? "positive" : "warning"} value={`${model.margin.toFixed(1)}%`} />
              <DemoKpi detail="Revenue per planned FTE" icon={<Users size={17} />} label="Productivity" value={`$${Math.round(model.productivity)}K`} />
            </div>

            <div className="demo-grid forecast-workspace-grid">
              <section className="demo-panel driver-panel">
                <div className="panel-heading"><div><span>Assumptions</span><h3>Scenario drivers</h3></div><small>5 connected assumptions</small></div>
                <div className="forecast-driver-list">
                  {driverConfig.map((driver) => (
                    <label className="driver-range-row" key={driver.key}>
                      <span><strong>{driver.label}</strong><small>{driver.description}</small></span>
                      <output>{formatDriverValue(drivers[driver.key], driver.suffix)}</output>
                      <input
                        aria-label={driver.label}
                        max={driver.max}
                        min={driver.min}
                        onChange={(event) => updateDriver(driver.key, Number(event.target.value))}
                        step={driver.step}
                        type="range"
                        value={drivers[driver.key]}
                      />
                      <span className="range-bounds"><small>{formatDriverValue(driver.min, driver.suffix)}</small><small>{formatDriverValue(driver.max, driver.suffix)}</small></span>
                    </label>
                  ))}
                </div>
                <div className="forecast-action-row">
                  <button className="button button-secondary" disabled={!dirty} onClick={discardDraft} type="button"><RefreshCw aria-hidden="true" size={15} /> Discard</button>
                  <button className="button button-primary" disabled={!dirty} onClick={() => setReviewOpen(true)} type="button"><Save aria-hidden="true" size={15} /> Review changes</button>
                </div>
              </section>

              <section className="demo-panel chart-panel forecast-chart-panel">
                <div className="panel-heading"><div><span>Integrated outlook</span><h3>Actual + forecast revenue</h3></div><small>USD millions</small></div>
                <div className="chart-wrap" aria-label="Actual and forecast monthly net revenue">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={model.chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 4, borderColor: "var(--border)", fontSize: 12 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                      <Area dataKey="Forecast" fill="var(--chart-secondary-soft)" stroke="var(--chart-secondary)" strokeWidth={2} type="monotone" />
                      <Line dataKey="Actual" dot={{ r: 3 }} stroke="var(--accent)" strokeWidth={2.5} type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="forecast-cost-strip">
                  <div><span>Personnel</span><strong>{formatMillions(model.personnelCost)}</strong></div>
                  <div><span>Contractors</span><strong>{formatMillions(model.contractorCost)}</strong></div>
                  <div><span>Indirect</span><strong>{formatMillions(model.indirectCost)}</strong></div>
                </div>
              </section>
            </div>

            <section className="demo-panel forecast-lines-panel">
              <div className="panel-heading"><div><span>Connected model</span><h3>Financial impact by planning line</h3></div><small>Draft compared with saved version</small></div>
              <div className="demo-table-scroll">
                <table className="demo-table">
                  <thead><tr><th>Planning line</th><th>Owner</th><th>Saved</th><th>Draft</th><th>Impact</th><th>Status</th></tr></thead>
                  <tbody>
                    {[
                      { label: "Net revenue", owner: "Regional FP&A", saved: savedModel.revenue, draft: model.revenue },
                      { label: "Personnel costs", owner: "Finance Ops", saved: savedModel.personnelCost, draft: model.personnelCost },
                      { label: "Contractor costs", owner: "Procurement Finance", saved: savedModel.contractorCost, draft: model.contractorCost },
                      { label: "EBITDA", owner: "Global Planning", saved: savedModel.ebitda, draft: model.ebitda },
                    ].map((line) => {
                      const impact = line.draft - line.saved;
                      return <tr key={line.label}><th>{line.label}</th><td>{line.owner}</td><td>{formatMillions(line.saved)}</td><td>{formatMillions(line.draft)}</td><td className={impact >= 0 ? "positive" : "negative"}>{formatMillions(impact, true)}</td><td><span className="table-status">{impact === 0 ? "Unchanged" : "Modeled"}</span></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {reviewOpen && (
              <section className="demo-panel review-workspace" aria-live="polite">
                <div className="panel-heading"><div><span>Review gate</span><h3>Confirm the forecast version</h3></div><strong className={totalEbitdaImpact >= 0 ? "positive" : "negative"}>{formatMillions(totalEbitdaImpact, true)} EBITDA</strong></div>
                <div className="review-layout">
                  <div className="review-change-list">
                    {changes.map((change) => (
                      <div key={change.key}><span><strong>{change.label}</strong><small>{formatDriverValue(change.previous, change.unit)} → {formatDriverValue(change.current, change.unit)}</small></span><strong className={change.ebitdaImpact >= 0 ? "positive" : "negative"}>{formatMillions(change.ebitdaImpact, true)}</strong></div>
                    ))}
                  </div>
                  <label className="review-reason">
                    <span>Why is this version changing?</span>
                    <textarea maxLength={220} onChange={(event) => setReason(event.target.value)} placeholder="Record the business rationale for reviewers..." rows={4} value={reason} />
                    <small>{reason.trim().length < 12 ? "Add at least 12 characters to preserve a useful audit trail." : `${reason.length}/220 characters`}</small>
                  </label>
                </div>
                <div className="forecast-action-row review-actions">
                  <button className="button button-secondary" onClick={() => setReviewOpen(false)} type="button">Back to model</button>
                  <button className="button button-primary" disabled={reason.trim().length < 12} onClick={saveVersion} type="button"><Check aria-hidden="true" size={15} /> Save governed version</button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
