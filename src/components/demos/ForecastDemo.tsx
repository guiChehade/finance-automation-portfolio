import { useMemo, useState } from "react";
import { Activity, Check, CircleDollarSign, GitCompareArrows, History, RefreshCw, Send, SlidersHorizontal, Users } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  calculateIntegratedForecast,
  forecastPresets,
  getForecastChanges,
  type ForecastDrivers,
  type ForecastPreset,
} from "../../domain/portfolioModels";
import { AuditTimeline, ConfirmDialog, type AuditEvent, useSessionState, useToast } from "../interaction/InteractionSystem";
import { DemoKpi, DemoStatusBar, formatMillions, ProductName, StatusPill, SyntheticDemoNotice } from "./DemoShared";

type ForecastView = "Scenario" | "Monthly plan" | "Activity";
type Version = { id: number; scenario: string; author: string; reason: string; changes: number; ebitda: number; margin: number; time: string };

const configs: Array<{ key: keyof ForecastDrivers; label: string; detail: string; min: number; max: number; step: number; suffix: string }> = [
  { key: "priceGrowth", label: "Price growth", detail: "Realized commercial uplift", min: -2, max: 9, step: 0.5, suffix: "%" },
  { key: "pipelineConversion", label: "Pipeline conversion", detail: "Weighted qualified demand", min: 20, max: 65, step: 1, suffix: "%" },
  { key: "utilization", label: "Utilization", detail: "Billable productive capacity", min: 60, max: 88, step: 1, suffix: "%" },
  { key: "plannedHires", label: "Planned hires", detail: "Approved Jul–Dec starts", min: 0, max: 60, step: 1, suffix: " FTE" },
  { key: "attrition", label: "Attrition", detail: "Annualized exits", min: 3, max: 20, step: 1, suffix: "%" },
  { key: "wageInflation", label: "Wage inflation", detail: "Annual salary movement", min: 1, max: 9, step: 0.5, suffix: "%" },
  { key: "contractorMix", label: "Contractor mix", detail: "Flexible delivery capacity", min: 3, max: 30, step: 1, suffix: "%" },
  { key: "discretionarySpend", label: "Discretionary spend", detail: "Remaining FY envelope", min: 1, max: 6, step: 0.1, suffix: "M" },
];

const initialVersions: Version[] = [
  { id: 2, scenario: "Base", author: "Regional FP&A", reason: "Hiring dates reconciled with approved requisitions.", changes: 2, ebitda: 14.8, margin: 14.4, time: "Today, 09:18" },
  { id: 1, scenario: "Base", author: "Global Planning", reason: "Planning cycle opened with approved assumptions.", changes: 8, ebitda: 14.5, margin: 14.1, time: "Yesterday, 16:42" },
];

function driverValue(value: number, suffix: string) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

export function ForecastDemo() {
  const [view, setView] = useState<ForecastView>("Scenario");
  const [scenario, setScenario] = useState<ForecastPreset | "Custom">("Base");
  const [drivers, setDrivers] = useState<ForecastDrivers>({ ...forecastPresets.Base });
  const [savedDrivers, setSavedDrivers] = useSessionState<ForecastDrivers>("portfolio-v4-forecast-drivers", { ...forecastPresets.Base });
  const [versions, setVersions] = useSessionState<Version[]>("portfolio-v4-forecast-versions", initialVersions);
  const [audit, setAudit] = useSessionState<AuditEvent[]>("portfolio-v4-forecast-audit", []);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rationale, setRationale] = useState("");
  const [recipients, setRecipients] = useState("Global FP&A Reviewers");
  const { pushToast } = useToast();

  const model = useMemo(() => calculateIntegratedForecast(drivers), [drivers]);
  const savedModel = useMemo(() => calculateIntegratedForecast(savedDrivers), [savedDrivers]);
  const changes = useMemo(() => getForecastChanges(savedDrivers, drivers), [drivers, savedDrivers]);
  const allGuardrailsPass = model.guardrails.every((item) => item.pass);

  function applyPreset(next: ForecastPreset) {
    setScenario(next);
    setDrivers({ ...forecastPresets[next] });
  }

  function changeDriver(key: keyof ForecastDrivers, value: number) {
    setScenario("Custom");
    setDrivers((current) => ({ ...current, [key]: value }));
  }

  function discard() {
    setDrivers({ ...savedDrivers });
    setScenario("Custom");
    pushToast({ title: "Draft discarded", detail: "The last submitted assumptions were restored.", tone: "info" });
  }

  function submitReview() {
    if (rationale.trim().length < 12 || !recipients) return;
    const entry: Version = { id: Date.now(), scenario, author: "You", reason: rationale.trim(), changes: changes.length, ebitda: model.totals.ebitda, margin: model.totals.margin, time: "Just now · Under review" };
    setVersions((current) => [entry, ...current].slice(0, 8));
    setSavedDrivers({ ...drivers });
    setAudit((current) => [{ id: entry.id, title: "Forecast submitted for review", detail: `${changes.length} driver changes routed to ${recipients}. ${allGuardrailsPass ? "All guardrails passed." : "Exceptions highlighted for reviewer decision."}`, tone: (allGuardrailsPass ? "complete" : "pending") as AuditEvent["tone"] }, ...current].slice(0, 6));
    setReviewOpen(false);
    setRationale("");
    pushToast({ title: "Forecast routed for review", detail: `${recipients} received version v${versions.length + 1}.` });
  }

  return (
    <div className="product-demo forecast-demo">
      <div className="demo-toolbar">
        <ProductName icon={GitCompareArrows} name="Fieldstone Outlook" subtitle="Integrated forecast workspace" />
        <div className="demo-toolbar-controls"><div className="segmented-control">{(["Scenario", "Monthly plan", "Activity"] as ForecastView[]).map((item) => <button className={view === item ? "active" : ""} key={item} onClick={() => setView(item)} type="button">{item === "Activity" && <History size={13} />}{item}</button>)}</div><SyntheticDemoNotice /></div>
      </div>

      <div className="demo-content">
        <DemoStatusBar records="8 connected drivers · 12 modeled months"><strong>FY26 Global Services</strong> · Actuals through June · {changes.length ? `${changes.length} draft changes` : "Submitted assumptions"}</DemoStatusBar>

        {view === "Activity" ? (
          <div className="activity-layout">
            <section className="demo-panel"><div className="panel-heading"><div><span>Version control</span><h3>Forecast history</h3></div><small>Rationale and impact retained</small></div><div className="demo-table-scroll"><table className="demo-table"><thead><tr><th>Version</th><th>Scenario</th><th>Owner</th><th>Changes</th><th>EBITDA</th><th>Margin</th><th>Rationale</th></tr></thead><tbody>{versions.map((entry, index) => <tr key={entry.id}><th>v{versions.length - index}<small>{entry.time}</small></th><td><StatusPill label={entry.scenario} tone="info" /></td><td>{entry.author}</td><td>{entry.changes}</td><td>{formatMillions(entry.ebitda)}</td><td>{entry.margin.toFixed(1)}%</td><td>{entry.reason}</td></tr>)}</tbody></table></div></section>
            <section className="demo-panel audit-panel"><div className="panel-heading"><div><span>Governance</span><h3>Review workflow</h3></div><small>Current session</small></div><AuditTimeline events={audit} /></section>
          </div>
        ) : (
          <>
            <div className="scenario-bar"><div><span>Scenario presets</span><strong>{scenario} outlook</strong></div><div className="segmented-control">{(Object.keys(forecastPresets) as ForecastPreset[]).map((item) => <button className={scenario === item ? "active" : ""} key={item} onClick={() => applyPreset(item)} type="button">{item}</button>)}</div></div>

            <div className="demo-kpi-grid">
              <DemoKpi detail="Actuals plus latest estimate" icon={<CircleDollarSign size={17} />} label="FY net revenue" value={formatMillions(model.totals.revenue)} />
              <DemoKpi detail={`${formatMillions(model.totals.ebitda - savedModel.totals.ebitda, true)} vs submitted`} icon={<Activity size={17} />} label="EBITDA" tone={model.totals.margin >= 14 ? "positive" : "warning"} value={formatMillions(model.totals.ebitda)} />
              <DemoKpi detail="After modeled delivery costs" icon={<GitCompareArrows size={17} />} label="EBITDA margin" tone={model.totals.margin >= 14 ? "positive" : "warning"} value={`${model.totals.margin.toFixed(1)}%`} />
              <DemoKpi detail="Revenue per year-end FTE" icon={<Users size={17} />} label="Productivity" value={`$${Math.round(model.totals.productivity)}K`} />
            </div>

            {view === "Scenario" ? (
              <div className="forecast-workspace-grid">
                <section className="demo-panel driver-panel">
                  <div className="panel-heading"><div><span>Assumptions</span><h3>Connected business drivers</h3></div><small>Changes recalculate all months</small></div>
                  <div className="forecast-driver-list">{configs.map((config) => <label className="driver-range-row" key={config.key}><span><strong>{config.label}</strong><small>{config.detail}</small></span><output>{driverValue(drivers[config.key], config.suffix)}</output><input aria-label={config.label} max={config.max} min={config.min} onChange={(event) => changeDriver(config.key, Number(event.target.value))} step={config.step} type="range" value={drivers[config.key]} /></label>)}</div>
                </section>

                <section className="demo-panel forecast-chart-panel">
                  <div className="panel-heading"><div><span>Integrated model</span><h3>Demand, capacity and EBITDA</h3></div><small>Jul–Dec reacts to every driver</small></div>
                  <div className="chart-wrap chart-tall"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={model.months} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="month" tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 4, borderColor: "var(--border)" }} /><Legend iconType="circle" /><ReferenceLine stroke="var(--border-strong)" x="Jul" /><Bar dataKey="ebitda" fill="var(--accent-soft)" name="EBITDA" /><Line dataKey="demand" dot={false} name="Demand" stroke="var(--chart-secondary)" strokeWidth={2} /><Line dataKey="capacityRevenue" dot={false} name="Capacity" stroke="var(--accent)" strokeWidth={2} /></ComposedChart></ResponsiveContainer></div>
                  <div className="guardrail-list">{model.guardrails.map((item) => <div key={item.id}><span className={item.pass ? "guard-pass" : "guard-fail"}>{item.pass ? <Check size={14} /> : "!"}</span><span><strong>{item.label}</strong><small>{item.value}</small></span></div>)}</div>
                </section>
              </div>
            ) : (
              <section className="demo-panel monthly-plan-panel"><div className="panel-heading"><div><span>Calculation output</span><h3>Monthly integrated plan</h3></div><small>Actual Jan–Jun · forecast Jul–Dec</small></div><div className="demo-table-scroll"><table className="demo-table"><thead><tr><th>Month</th><th>Type</th><th>Headcount</th><th>Revenue</th><th>Employee cost</th><th>Contractors</th><th>Indirect cost</th><th>EBITDA</th></tr></thead><tbody>{model.months.map((month, index) => <tr key={month.month}><th>{month.month}</th><td><StatusPill label={index < 6 ? "Actual" : "Forecast"} tone={index < 6 ? "neutral" : "info"} /></td><td>{month.headcount}</td><td>{formatMillions(month.revenue)}</td><td>{formatMillions(month.employeeCost)}</td><td>{formatMillions(month.contractorCost)}</td><td>{formatMillions(month.indirectCost)}</td><td className={month.ebitda >= 0 ? "positive" : "negative"}>{formatMillions(month.ebitda)}</td></tr>)}</tbody></table></div></section>
            )}

            <div className="sticky-workflow-bar"><div><SlidersHorizontal size={16} /><span><strong>{changes.length} driver changes</strong><small>{allGuardrailsPass ? "Ready for review" : "Guardrail exceptions will be highlighted"}</small></span></div><div><button className="button button-secondary" disabled={!changes.length} onClick={discard} type="button"><RefreshCw size={15} /> Discard</button><button className="button button-primary" disabled={!changes.length} onClick={() => setReviewOpen(true)} type="button"><Send size={15} /> Submit for review</button></div></div>
          </>
        )}
      </div>

      <ConfirmDialog confirmDisabled={rationale.trim().length < 12 || !recipients} confirmLabel="Submit version" icon={<Send size={18} />} onCancel={() => setReviewOpen(false)} onConfirm={submitReview} open={reviewOpen} title="Submit forecast for review">
        <div className="review-impact"><div><span>Driver changes</span><strong>{changes.length}</strong></div><div><span>EBITDA impact</span><strong>{formatMillions(model.totals.ebitda - savedModel.totals.ebitda, true)}</strong></div><div><span>Guardrails</span><strong>{model.guardrails.filter((item) => item.pass).length}/{model.guardrails.length} passed</strong></div></div>
        <label className="field-label"><span>Review group</span><input onChange={(event) => setRecipients(event.target.value)} value={recipients} /></label>
        <label className="field-label"><span>Rationale</span><textarea onChange={(event) => setRationale(event.target.value)} placeholder="Explain the business rationale and decision requested..." rows={4} value={rationale} /></label>
      </ConfirmDialog>
    </div>
  );
}
