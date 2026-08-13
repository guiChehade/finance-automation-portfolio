import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Calculator,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Mail,
  Send,
  TableProperties,
  UserRoundCheck,
} from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  brands,
  channels,
  getPnlBridge,
  getPnlView,
  markets,
  type DriverClassification,
  type PnlComparison,
  type PnlFilters,
  type PnlLineId,
  type PnlPeriod,
} from "../../domain/portfolioModels";
import {
  AuditTimeline,
  ConfirmDialog,
  SideDrawer,
  type AuditEvent,
  useSessionState,
  useToast,
} from "../interaction/InteractionSystem";
import { DemoKpi, DemoStatusBar, formatMillions, ProductName, StatusPill, SyntheticDemoNotice } from "./DemoShared";

const periods: PnlPeriod[] = ["June", "Jun YTD", "FY Outlook"];
const comparisons: PnlComparison[] = ["Forecast", "Budget", "Prior year"];
const classifications: DriverClassification[] = ["Recurring", "Timing", "One-off"];

export function PnlDemo() {
  const [period, setPeriod] = useState<PnlPeriod>("Jun YTD");
  const [comparison, setComparison] = useState<PnlComparison>("Forecast");
  const [filters, setFilters] = useState<PnlFilters>({ market: "All markets", brand: "All brands", channel: "All channels" });
  const [selectedLineId, setSelectedLineId] = useState<PnlLineId>("operating-income");
  const [selectedDriverId, setSelectedDriverId] = useState("commercial");
  const [classOverrides, setClassOverrides] = useState<Record<string, DriverClassification>>({});
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [owner, setOwner] = useState("Regional Finance Director");
  const [dueDate, setDueDate] = useState("2026-07-03");
  const [recipient, setRecipient] = useState("Regional Finance Leadership");
  const [events, setEvents] = useSessionState<AuditEvent[]>("portfolio-v4-pnl-audit", []);
  const { pushToast } = useToast();

  const view = useMemo(() => getPnlView(period, comparison, filters), [comparison, filters, period]);
  const selectedRow = view.rows.find((row) => row.id === selectedLineId) ?? view.rows[0];
  const bridge = useMemo(() => getPnlBridge(selectedRow.id, selectedRow.variance, filters), [filters, selectedRow.id, selectedRow.variance]);
  const selectedDriver = bridge.find((driver) => driver.id === selectedDriverId) ?? bridge[0];
  const revenue = view.rows.find((row) => row.id === "revenue")!;
  const operatingIncome = view.rows.find((row) => row.id === "operating-income")!;
  const margin = revenue.actual ? operatingIncome.actual / revenue.actual * 100 : 0;
  const bridgeTotal = bridge.reduce((sum, driver) => sum + driver.amount, 0);
  const bridgeDelta = bridgeTotal - selectedRow.variance;

  function updateFilter(key: keyof PnlFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function selectLine(lineId: PnlLineId) {
    setSelectedLineId(lineId);
    setSelectedDriverId(lineId === "revenue" ? "price" : lineId === "cogs" ? "materials" : "commercial");
  }

  function assignFollowUp() {
    if (!owner || !dueDate) return;
    const event: AuditEvent = {
      id: Date.now(),
      title: `Follow-up assigned: ${selectedDriver.label}`,
      detail: `${owner} owns the ${classOverrides[selectedDriver.id] ?? selectedDriver.defaultClassification} driver review due ${dueDate}.`,
    };
    setEvents((current) => [event, ...current].slice(0, 6));
    setFollowUpOpen(false);
    pushToast({ title: "Follow-up assigned", detail: `${owner} was notified in the simulated workflow.`, undo: () => setEvents((current) => current.filter((entry) => entry.id !== event.id)) });
  }

  function sendPack() {
    const event: AuditEvent = {
      id: Date.now(),
      title: "Variance pack distributed",
      detail: `${period} ${selectedRow.label} analysis sent to ${recipient}; four reconciled drivers and classifications attached.`,
    };
    setEvents((current) => [event, ...current].slice(0, 6));
    setPackOpen(false);
    pushToast({ title: "Variance pack sent", detail: `${recipient} received the simulated email and evidence link.` });
  }

  return (
    <div className="product-demo pnl-demo">
      <div className="demo-toolbar">
        <ProductName icon={TableProperties} name="Northline Performance" subtitle="Management P&L cockpit" />
        <div className="demo-toolbar-controls">
          <label className="select-control"><span>Period</span><select value={period} onChange={(event) => setPeriod(event.target.value as PnlPeriod)}>{periods.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="select-control"><span>Compare with</span><select value={comparison} onChange={(event) => setComparison(event.target.value as PnlComparison)}>{comparisons.map((item) => <option key={item}>{item}</option>)}</select></label>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        <div className="filter-ribbon">
          <label><span>Market</span><select value={filters.market} onChange={(event) => updateFilter("market", event.target.value)}><option>All markets</option>{markets.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <label><span>Brand</span><select value={filters.brand} onChange={(event) => updateFilter("brand", event.target.value)}><option>All brands</option>{brands.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <label><span>Channel</span><select value={filters.channel} onChange={(event) => updateFilter("channel", event.target.value)}><option>All channels</option>{channels.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <button className="icon-text-button" onClick={() => setFormulaOpen(true)} type="button"><Calculator size={15} /> Calculation logic</button>
        </div>

        <DemoStatusBar records={`${view.recordCount.toLocaleString("en-US")} dimensional records`}>
          <strong>{period}</strong> · Actual vs {comparison} · {filters.market} / {filters.brand} / {filters.channel}
        </DemoStatusBar>

        <div className="demo-kpi-grid">
          <DemoKpi detail={`${period} reported view`} icon={<CircleDollarSign size={17} />} label="Net revenue" value={formatMillions(revenue.actual)} />
          <DemoKpi detail={`Actual vs ${comparison}`} icon={<BadgeCheck size={17} />} label="Revenue variance" tone={revenue.variance >= 0 ? "positive" : "warning"} value={formatMillions(revenue.variance, true)} />
          <DemoKpi detail={`${formatMillions(operatingIncome.variance, true)} vs ${comparison}`} icon={<TableProperties size={17} />} label="Operating margin" tone={margin >= 10 ? "positive" : "warning"} value={`${margin.toFixed(1)}%`} />
          <DemoKpi detail={`${Math.abs(bridgeDelta).toFixed(4)}M unexplained`} icon={<Check size={17} />} label="Bridge control" tone="positive" value={Math.abs(bridgeDelta) < 0.001 ? "Reconciled" : "Review"} />
        </div>

        <div className="demo-grid demo-grid-pnl">
          <section className="demo-panel chart-panel">
            <div className="panel-heading"><div><span>Trend</span><h3>Revenue actuals and outlook</h3></div><small>USD millions</small></div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={view.trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis axisLine={false} dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} />
                  <YAxis axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 4, borderColor: "var(--border)", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Comparison" fill="var(--chart-secondary)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Actual" fill="var(--accent)" radius={[2, 2, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="demo-panel table-panel">
            <div className="panel-heading"><div><span>Statement</span><h3>Management P&L</h3></div><small>Click a line to investigate</small></div>
            <div className="demo-table-scroll"><table className="demo-table pnl-investigable-table">
              <thead><tr><th>USD millions</th><th>Actual</th><th>{comparison}</th><th>Variance</th><th>Var %</th></tr></thead>
              <tbody>{view.rows.map((row) => (
                <tr className={`${row.derived ? "total-row" : ""} ${selectedLineId === row.id ? "selected-row" : ""}`} key={row.id}>
                  <th><button onClick={() => selectLine(row.id)} type="button"><span>{row.label}</span><ChevronRight size={14} /></button></th>
                  <td>{formatMillions(row.actual)}</td><td>{formatMillions(row.plan)}</td>
                  <td className={row.variance >= 0 ? "positive" : "negative"}>{formatMillions(row.variance, true)}</td>
                  <td className={row.variance >= 0 ? "positive" : "negative"}>{row.variancePercent > 0 ? "+" : ""}{row.variancePercent.toFixed(1)}%</td>
                </tr>
              ))}</tbody>
            </table></div>
          </section>
        </div>

        <section className="demo-panel variance-investigation">
          <div className="panel-heading">
            <div><span>Variance bridge</span><h3>{selectedRow.label}: {formatMillions(selectedRow.variance, true)} vs {comparison}</h3></div>
            <StatusPill label="Fully reconciled" tone="positive" />
          </div>
          <div className="variance-workspace">
            <div className="driver-bridge">
              {bridge.map((driver) => (
                <button className={selectedDriver.id === driver.id ? "active" : ""} key={driver.id} onClick={() => setSelectedDriverId(driver.id)} type="button">
                  <span><strong>{driver.label}</strong><small>{driver.owner}</small></span>
                  <b className={driver.amount >= 0 ? "positive" : "negative"}>{formatMillions(driver.amount, true)}</b>
                </button>
              ))}
              <div className="bridge-reconciliation"><Check size={14} /><span>Bridge total</span><strong>{formatMillions(bridgeTotal, true)}</strong></div>
            </div>

            <article className="driver-evidence">
              <header><div><span>Selected driver</span><h4>{selectedDriver.label}</h4></div><StatusPill label={classOverrides[selectedDriver.id] ?? selectedDriver.defaultClassification} tone="info" /></header>
              <dl><div><dt>Evidence</dt><dd>{selectedDriver.evidence}</dd></div><div><dt>Interpretation</dt><dd>{selectedDriver.action}</dd></div><div><dt>Owner</dt><dd>{selectedDriver.owner}</dd></div></dl>
              <div className="classification-control"><span>Outlook treatment</span><div className="segmented-control">{classifications.map((item) => <button aria-pressed={(classOverrides[selectedDriver.id] ?? selectedDriver.defaultClassification) === item} className={(classOverrides[selectedDriver.id] ?? selectedDriver.defaultClassification) === item ? "active" : ""} key={item} onClick={() => setClassOverrides((current) => ({ ...current, [selectedDriver.id]: item }))} type="button">{item}</button>)}</div></div>
              <div className="panel-actions"><button className="button button-secondary" onClick={() => setFollowUpOpen(true)} type="button"><UserRoundCheck size={15} /> Assign follow-up</button><button className="button button-primary" onClick={() => setPackOpen(true)} type="button"><Mail size={15} /> Send variance pack</button></div>
            </article>
          </div>
        </section>

        <section className="demo-panel audit-panel"><div className="panel-heading"><div><span>Governance</span><h3>Workflow activity</h3></div><small>Retained for this browser session</small></div><AuditTimeline events={events} /></section>
      </div>

      <ConfirmDialog confirmDisabled={!owner || !dueDate} confirmLabel="Assign owner" icon={<UserRoundCheck size={18} />} onCancel={() => setFollowUpOpen(false)} onConfirm={assignFollowUp} open={followUpOpen} title="Assign variance follow-up">
        <div className="dialog-summary"><strong>{selectedDriver.label}</strong><span>{formatMillions(selectedDriver.amount, true)} · {classOverrides[selectedDriver.id] ?? selectedDriver.defaultClassification}</span></div>
        <div className="form-grid"><label><span>Owner</span><input onChange={(event) => setOwner(event.target.value)} value={owner} /></label><label><span>Due date</span><input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></label></div>
      </ConfirmDialog>

      <ConfirmDialog confirmDisabled={!recipient} confirmLabel="Send email" icon={<Send size={18} />} onCancel={() => setPackOpen(false)} onConfirm={sendPack} open={packOpen} title="Send variance pack">
        <label className="field-label"><span>Recipients</span><input onChange={(event) => setRecipient(event.target.value)} value={recipient} /></label>
        <div className="email-preview"><small>SUBJECT</small><strong>{period} performance · {selectedRow.label} {formatMillions(selectedRow.variance, true)} vs {comparison}</strong><p>The attached management pack reconciles the variance across {bridge.length} drivers. Each driver includes evidence, owner and outlook classification.</p></div>
      </ConfirmDialog>

      <SideDrawer onClose={() => setFormulaOpen(false)} open={formulaOpen} title="Calculation lineage">
        <div className="formula-stack">
          <section><span>Net revenue</span><code>Σ volume × realized price × channel factor</code><p>Calculated across month, market, brand and channel records.</p></section>
          <section><span>Gross profit</span><code>Net revenue + cost of goods sold</code><p>Derived after all selected dimensions are aggregated.</p></section>
          <section><span>Operating income</span><code>Gross profit + marketing + personnel + other OpEx</code><p>Expense values are stored with accounting signs.</p></section>
          <section><span>Variance bridge</span><code>Σ driver amounts = Actual − comparison</code><p>The final driver absorbs rounding only; unexplained variance is controlled below $1K.</p></section>
        </div>
        <div className="drawer-note"><CalendarDays size={16} /><p>Actuals run through June. The FY Outlook combines June YTD actuals with July–December forecast records.</p></div>
      </SideDrawer>
    </div>
  );
}
