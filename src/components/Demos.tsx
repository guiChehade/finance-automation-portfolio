import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
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
  Save,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Users,
} from "lucide-react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatMillions(value: number, signed = false): string {
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}$${value.toFixed(1)}M`;
}

function DemoKpi({
  detail,
  icon,
  label,
  tone = "neutral",
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  tone?: "neutral" | "positive" | "warning";
  value: string;
}) {
  return (
    <article className={`demo-kpi tone-${tone}`}>
      <div><span>{label}</span>{icon}</div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function SyntheticDemoNotice() {
  return (
    <div className="demo-notice">
      <ShieldCheck aria-hidden="true" size={14} />
      Synthetic data · illustrative workflow
    </div>
  );
}

const pnlMonths = [
  { month: "Jan", actual: 18.4, Forecast: 17.8, Budget: 18.2 },
  { month: "Feb", actual: 19.6, Forecast: 19.1, Budget: 18.9 },
  { month: "Mar", actual: 20.8, Forecast: 20.2, Budget: 20.0 },
  { month: "Apr", actual: 21.2, Forecast: 21.5, Budget: 20.9 },
  { month: "May", actual: 23.1, Forecast: 22.0, Budget: 21.7 },
  { month: "Jun", actual: 25.3, Forecast: 23.9, Budget: 23.4 },
] as const;

const pnlRegions = {
  "All markets": 1,
  North: 0.42,
  Central: 0.33,
  South: 0.25,
} as const;

export function PnlDemo() {
  const [comparison, setComparison] = useState<"Forecast" | "Budget">("Forecast");
  const [region, setRegion] = useState<keyof typeof pnlRegions>("All markets");
  const multiplier = pnlRegions[region];
  const chartData = pnlMonths.map((row) => ({
    month: row.month,
    Actual: Number((row.actual * multiplier).toFixed(2)),
    Comparison: Number((row[comparison] * multiplier).toFixed(2)),
  }));
  const actual = chartData.reduce((sum, row) => sum + row.Actual, 0);
  const plan = chartData.reduce((sum, row) => sum + row.Comparison, 0);
  const variance = actual - plan;
  const rows = [
    { label: "Net revenue", actual, plan, weight: 1 },
    { label: "Cost of goods sold", actual: actual * -0.54, plan: plan * -0.55, weight: 0 },
    { label: "Gross profit", actual: actual * 0.46, plan: plan * 0.45, weight: 1 },
    { label: "Operating expenses", actual: actual * -0.31, plan: plan * -0.32, weight: 0 },
    { label: "Operating income", actual: actual * 0.15, plan: plan * 0.13, weight: 2 },
  ];

  return (
    <div className="product-demo pnl-demo">
      <div className="demo-toolbar">
        <div className="demo-product-name">
          <span className="demo-product-mark"><TableProperties aria-hidden="true" size={18} /></span>
          <div><strong>Northline Performance</strong><small>Management P&amp;L</small></div>
        </div>
        <div className="demo-toolbar-controls">
          <div className="segmented-control" aria-label="Comparison scenario">
            {(["Forecast", "Budget"] as const).map((option) => (
              <button
                aria-pressed={comparison === option}
                className={comparison === option ? "active" : ""}
                key={option}
                onClick={() => setComparison(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <label className="select-control">
            <span>Market</span>
            <select value={region} onChange={(event) => setRegion(event.target.value as keyof typeof pnlRegions)}>
              {Object.keys(pnlRegions).map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-kpi-grid">
          <DemoKpi detail="YTD through June" icon={<CircleDollarSign size={17} />} label="Net revenue" value={formatMillions(actual)} />
          <DemoKpi detail={`Actual vs ${comparison}`} icon={<GitCompareArrows size={17} />} label="Revenue variance" tone="positive" value={formatMillions(variance, true)} />
          <DemoKpi detail="+180 bps vs plan" icon={<Sparkles size={17} />} label="Operating margin" tone="positive" value="15.0%" />
          <DemoKpi detail="All source checks passed" icon={<BadgeCheck size={17} />} label="Reconciliation" value="99.7%" />
        </div>

        <div className="demo-grid demo-grid-pnl">
          <section className="demo-panel chart-panel">
            <div className="panel-heading">
              <div><span>Trend</span><h3>Revenue by month</h3></div>
              <small>USD millions</small>
            </div>
            <div className="chart-wrap" aria-label={`Monthly actual revenue compared with ${comparison}`}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 4, borderColor: "var(--border)", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Comparison" fill="var(--chart-secondary)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Actual" fill="var(--accent)" radius={[3, 3, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="demo-panel table-panel">
            <div className="panel-heading">
              <div><span>Statement</span><h3>Management P&amp;L</h3></div>
              <small>{region}</small>
            </div>
            <div className="demo-table-scroll">
              <table className="demo-table">
                <thead><tr><th>USD millions</th><th>Actual</th><th>{comparison}</th><th>Variance</th><th>Var %</th></tr></thead>
                <tbody>
                  {rows.map((row) => {
                    const rowVariance = row.actual - row.plan;
                    const rowVariancePercent = row.plan ? (rowVariance / Math.abs(row.plan)) * 100 : 0;
                    return (
                      <tr className={row.weight === 2 ? "total-row" : row.weight === 1 ? "subtotal-row" : ""} key={row.label}>
                        <th>{row.label}</th>
                        <td>{formatMillions(row.actual)}</td>
                        <td>{formatMillions(row.plan)}</td>
                        <td className={rowVariance >= 0 ? "positive" : "negative"}>{formatMillions(rowVariance, true)}</td>
                        <td className={rowVariancePercent >= 0 ? "positive" : "negative"}>{rowVariancePercent > 0 ? "+" : ""}{rowVariancePercent.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const scenarioFactors = { Base: 1, Upside: 1.08, Downside: 0.92 } as const;

export function ForecastDemo() {
  const [scenario, setScenario] = useState<keyof typeof scenarioFactors>("Base");
  const [headcount, setHeadcount] = useState(428);
  const [saved, setSaved] = useState(false);
  const factor = scenarioFactors[scenario];
  const chartData = useMemo(() => {
    const values = [5.7, 6.0, 6.4, 6.8, 7.1, 7.5, 7.7, 7.9, 8.2, 8.5, 8.8, 9.2];
    return values.map((value, index) => ({
      month: new Date(2026, index).toLocaleString("en-US", { month: "short" }),
      Actual: index < 6 ? value : null,
      Forecast: index >= 5 ? Number((value * factor).toFixed(2)) : null,
    }));
  }, [factor]);
  const revenue = 89.8 * factor;
  const personnelCost = 42.7 + (headcount - 428) * 0.075;
  const ebitda = revenue - personnelCost - 33.4;
  const dirty = scenario !== "Base" || headcount !== 428;

  function changeScenario(next: keyof typeof scenarioFactors) {
    setScenario(next);
    setSaved(false);
  }

  return (
    <div className="product-demo forecast-demo">
      <div className="demo-toolbar">
        <div className="demo-product-name">
          <span className="demo-product-mark"><GitCompareArrows aria-hidden="true" size={18} /></span>
          <div><strong>Fieldstone Outlook</strong><small>Global planning workspace</small></div>
        </div>
        <div className="demo-toolbar-controls">
          <div className="segmented-control" aria-label="Forecast scenario">
            {(Object.keys(scenarioFactors) as Array<keyof typeof scenarioFactors>).map((option) => (
              <button aria-pressed={scenario === option} className={scenario === option ? "active" : ""} key={option} onClick={() => changeScenario(option)} type="button">{option}</button>
            ))}
          </div>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        <div className="workspace-status-row">
          <div><span className="status-dot" /> FY26 Outlook · Global Services</div>
          <div aria-live="polite">{saved ? <><Check size={14} /> Draft saved with reason</> : dirty ? "Unsaved scenario changes" : "No unsaved changes"}</div>
        </div>

        <div className="demo-kpi-grid">
          <DemoKpi detail={`${scenario} scenario`} icon={<CircleDollarSign size={17} />} label="FY net revenue" value={formatMillions(revenue)} />
          <DemoKpi detail="After personnel and indirect costs" icon={<Sparkles size={17} />} label="EBITDA" tone={ebitda >= 13 ? "positive" : "warning"} value={formatMillions(ebitda)} />
          <DemoKpi detail="Year-end plan" icon={<Users size={17} />} label="Headcount" value={headcount.toLocaleString("en-US")} />
          <DemoKpi detail="Revenue per planned FTE" icon={<GitCompareArrows size={17} />} label="Productivity" value={`$${Math.round((revenue * 1000) / headcount)}K`} />
        </div>

        <div className="demo-grid forecast-workspace-grid">
          <section className="demo-panel driver-panel">
            <div className="panel-heading"><div><span>Driver</span><h3>Year-end headcount</h3></div><Users size={17} /></div>
            <label className="range-control">
              <div><span>Planned FTE</span><strong>{headcount}</strong></div>
              <input
                aria-label="Planned year-end headcount"
                max="470"
                min="390"
                onChange={(event) => { setHeadcount(Number(event.target.value)); setSaved(false); }}
                step="1"
                type="range"
                value={headcount}
              />
              <span className="range-bounds"><small>390</small><small>470</small></span>
            </label>
            <div className="driver-summary">
              <div><span>Personnel cost</span><strong>{formatMillions(personnelCost)}</strong></div>
              <div><span>Change vs baseline</span><strong className={headcount <= 428 ? "positive" : "negative"}>{headcount - 428 > 0 ? "+" : ""}{headcount - 428} FTE</strong></div>
            </div>
            <button className="button button-primary save-draft" disabled={!dirty || saved} onClick={() => setSaved(true)} type="button">
              <Save aria-hidden="true" size={15} /> {saved ? "Draft saved" : "Review & save draft"}
            </button>
          </section>

          <section className="demo-panel chart-panel forecast-chart-panel">
            <div className="panel-heading"><div><span>Integrated outlook</span><h3>Actual + forecast revenue</h3></div><small>USD millions</small></div>
            <div className="chart-wrap" aria-label="Actual and forecast monthly net revenue">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
          </section>
        </div>

        <section className="demo-panel forecast-lines-panel">
          <div className="panel-heading"><div><span>Planning model</span><h3>Connected forecast drivers</h3></div><small>Controlled inputs · full history</small></div>
          <div className="demo-table-scroll">
            <table className="demo-table">
              <thead><tr><th>Planning line</th><th>Owner</th><th>Baseline</th><th>Scenario</th><th>Change</th><th>Status</th></tr></thead>
              <tbody>
                <tr><th>Net revenue</th><td>Regional FP&amp;A</td><td>{formatMillions(89.8)}</td><td>{formatMillions(revenue)}</td><td className={factor >= 1 ? "positive" : "negative"}>{((factor - 1) * 100).toFixed(1)}%</td><td><span className="table-status">Modeled</span></td></tr>
                <tr><th>Personnel costs</th><td>Finance Ops</td><td>{formatMillions(42.7)}</td><td>{formatMillions(personnelCost)}</td><td className={headcount <= 428 ? "positive" : "negative"}>{headcount - 428 > 0 ? "+" : ""}{headcount - 428} FTE</td><td><span className="table-status">Driver linked</span></td></tr>
                <tr><th>Indirect costs</th><td>Cost owners</td><td>{formatMillions(33.4)}</td><td>{formatMillions(33.4)}</td><td>0.0%</td><td><span className="table-status">Validated</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

type PipelineTab = "Flow" | "Quality" | "Reconciliation";

const sourceSystems = [
  { name: "Workday", role: "Actuals", icon: Building2, rows: "1.2M" },
  { name: "Salesforce", role: "Pipeline", icon: CloudCog, rows: "640K" },
  { name: "Greenhouse", role: "Hiring", icon: BriefcaseBusiness, rows: "84K" },
  { name: "NetSuite", role: "ERP detail", icon: Database, rows: "810K" },
] as const;

const qualityChecks = [
  { control: "Source freshness", scope: "5 source contracts", result: "On time", evidence: "Latest extract < 30 min" },
  { control: "Schema conformance", scope: "126 required fields", result: "Passed", evidence: "0 unexpected changes" },
  { control: "Primary-key uniqueness", scope: "2.8M monthly rows", result: "Passed", evidence: "3 duplicates quarantined" },
  { control: "Financial reconciliation", scope: "Actuals and allocations", result: "Passed", evidence: "99.8% auto-matched" },
] as const;

const reconciliationRows = [
  { area: "Net revenue", source: 96.42, mart: 96.42, exceptions: 0, status: "Matched" },
  { area: "Personnel costs", source: 47.18, mart: 47.14, exceptions: 7, status: "Reviewed" },
  { area: "Indirect costs", source: 34.77, mart: 34.77, exceptions: 0, status: "Matched" },
  { area: "Intercompany markup", source: 8.26, mart: 8.26, exceptions: 0, status: "Matched" },
] as const;

export function PipelineDemo() {
  const [activeTab, setActiveTab] = useState<PipelineTab>("Flow");
  const [running, setRunning] = useState(false);
  const [runLabel, setRunLabel] = useState("Validated 08:42 UTC");
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function runPipeline() {
    if (running) return;
    setRunning(true);
    setRunLabel("Validating current run...");
    timerRef.current = window.setTimeout(() => {
      setRunning(false);
      setRunLabel("Validated just now");
    }, 1400);
  }

  return (
    <div className="product-demo pipeline-demo">
      <div className="demo-toolbar">
        <div className="demo-product-name">
          <span className="demo-product-mark"><Database aria-hidden="true" size={18} /></span>
          <div><strong>Cobalt Finance Data</strong><small>Control tower</small></div>
        </div>
        <div className="demo-toolbar-controls">
          <div className="pipeline-run-state" aria-live="polite">
            {running ? <LoaderCircle className="spin" aria-hidden="true" size={14} /> : <Check aria-hidden="true" size={14} />}
            {runLabel}
          </div>
          <button className="button button-primary" disabled={running} onClick={runPipeline} type="button">
            {running ? <RefreshCw className="spin" aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
            {running ? "Running controls" : "Run validated refresh"}
          </button>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-kpi-grid">
          <DemoKpi detail="Across ERP, CRM and HRIS" icon={<Database size={17} />} label="Monthly volume" value="2.8M rows" />
          <DemoKpi detail="Source to finance marts" icon={<RefreshCw size={17} />} label="Refresh duration" tone="positive" value="18 min" />
          <DemoKpi detail="Freshness, schema and finance" icon={<ShieldCheck size={17} />} label="Automated controls" value="34" />
          <DemoKpi detail="Before management reporting" icon={<FileCheck2 size={17} />} label="Auto-reconciled" tone="positive" value="99.8%" />
        </div>

        <div className="pipeline-tabs" role="tablist" aria-label="Control tower views">
          {(["Flow", "Quality", "Reconciliation"] as PipelineTab[]).map((tab) => (
            <button aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{tab}</button>
          ))}
        </div>

        {activeTab === "Flow" ? (
          <section className="demo-panel pipeline-flow-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Architecture</span><h3>Source-to-report finance pipeline</h3></div><small>Scheduled · monitored · traceable</small></div>
            <div className="pipeline-flow">
              <div className="pipeline-stage source-stage">
                <span className="pipeline-stage-label">Source systems</span>
                <div className="source-system-grid">
                  {sourceSystems.map(({ icon: Icon, name, role, rows }) => (
                    <article key={name}><Icon aria-hidden="true" size={17} /><div><strong>{name}</strong><small>{role} · {rows}</small></div><Check aria-label="Ready" size={14} /></article>
                  ))}
                </div>
              </div>
              <ArrowRight className="pipeline-arrow" aria-hidden="true" size={21} />
              <div className={`pipeline-stage transform-stage ${running ? "running" : ""}`}>
                <span className="pipeline-stage-label">Ingestion &amp; controls</span>
                <div className="stage-icon"><CloudCog aria-hidden="true" size={24} /></div>
                <strong>Python + APIs</strong>
                <small>Contracts · schema · quarantine</small>
              </div>
              <ArrowRight className="pipeline-arrow" aria-hidden="true" size={21} />
              <div className={`pipeline-stage transform-stage ${running ? "running" : ""}`}>
                <span className="pipeline-stage-label">Financial logic</span>
                <div className="stage-icon"><Boxes aria-hidden="true" size={24} /></div>
                <strong>BigQuery + SQL</strong>
                <small>Allocations · markup · scenarios</small>
              </div>
              <ArrowRight className="pipeline-arrow" aria-hidden="true" size={21} />
              <div className="pipeline-stage output-stage">
                <span className="pipeline-stage-label">Governed outputs</span>
                <div className="output-list">
                  <span><TableProperties size={15} /> FP&amp;A marts</span>
                  <span><GitCompareArrows size={15} /> Reconciliation</span>
                  <span><CircleDollarSign size={15} /> Executive reporting</span>
                </div>
              </div>
            </div>
          </section>
        ) : activeTab === "Quality" ? (
          <section className="demo-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Control framework</span><h3>Data quality before reporting</h3></div><small>34 automated checks</small></div>
            <div className="demo-table-scroll">
              <table className="demo-table quality-table">
                <thead><tr><th>Control</th><th>Scope</th><th>Result</th><th>Evidence</th></tr></thead>
                <tbody>{qualityChecks.map((check) => <tr key={check.control}><th>{check.control}</th><td>{check.scope}</td><td><span className="control-pass"><Check size={13} /> {check.result}</span></td><td>{check.evidence}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="demo-panel" role="tabpanel">
            <div className="panel-heading"><div><span>Financial control</span><h3>Source-to-mart reconciliation</h3></div><small>USD millions</small></div>
            <div className="demo-table-scroll">
              <table className="demo-table reconciliation-table">
                <thead><tr><th>Finance area</th><th>Source total</th><th>Mart total</th><th>Exceptions</th><th>Status</th></tr></thead>
                <tbody>{reconciliationRows.map((row) => <tr key={row.area}><th>{row.area}</th><td>{formatMillions(row.source)}</td><td>{formatMillions(row.mart)}</td><td>{row.exceptions}</td><td><span className="control-pass"><Check size={13} /> {row.status}</span></td></tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        <div className="pipeline-audit-strip"><History aria-hidden="true" size={15} /><span>Every run stores source version, row counts, control evidence and transformation lineage.</span><strong>Audit-ready</strong></div>
      </div>
    </div>
  );
}
