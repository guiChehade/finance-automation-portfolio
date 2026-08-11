import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  CircleDollarSign,
  GitCompareArrows,
  Sparkles,
  TableProperties,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getPnlDrivers,
  getPnlSnapshot,
  pnlDimensionMembers,
  type PnlComparison,
  type PnlDimension,
  type PnlLineId,
} from "../../cases/demoModels";
import { DemoKpi, formatMillions, ProductName, SyntheticDemoNotice } from "./DemoShared";

export function PnlDemo() {
  const [comparison, setComparison] = useState<PnlComparison>("Forecast");
  const [dimension, setDimension] = useState<PnlDimension>("Market");
  const [member, setMember] = useState("All markets");
  const [selectedLineId, setSelectedLineId] = useState<PnlLineId>("operating-income");
  const [selectedDriverIndex, setSelectedDriverIndex] = useState(0);
  const [loggedDriver, setLoggedDriver] = useState<string | null>(null);
  const snapshot = useMemo(
    () => getPnlSnapshot(comparison, dimension, member),
    [comparison, dimension, member],
  );
  const selectedRow = snapshot.rows.find((row) => row.id === selectedLineId) ?? snapshot.rows[0];
  const drivers = useMemo(
    () => getPnlDrivers(selectedRow.id, selectedRow.variance),
    [selectedRow.id, selectedRow.variance],
  );
  const selectedDriver = drivers[selectedDriverIndex] ?? drivers[0];
  const maxDriver = Math.max(...drivers.map((driver) => Math.abs(driver.amount)), 0.01);
  const revenue = snapshot.rows.find((row) => row.id === "revenue")!;
  const operatingIncome = snapshot.rows.find((row) => row.id === "operating-income")!;
  const operatingMargin = (operatingIncome.actual / revenue.actual) * 100;

  useEffect(() => {
    setSelectedDriverIndex(0);
    setLoggedDriver(null);
  }, [comparison, dimension, member, selectedLineId]);

  function changeDimension(next: PnlDimension) {
    setDimension(next);
    setMember(pnlDimensionMembers[next][0].label);
  }

  return (
    <div className="product-demo pnl-demo">
      <div className="demo-toolbar">
        <ProductName icon={TableProperties} name="Northline Performance" subtitle="Management P&L" />
        <div className="demo-toolbar-controls">
          <div className="segmented-control" aria-label="Comparison scenario">
            {(["Forecast", "Budget"] as PnlComparison[]).map((option) => (
              <button aria-pressed={comparison === option} className={comparison === option ? "active" : ""} key={option} onClick={() => setComparison(option)} type="button">{option}</button>
            ))}
          </div>
          <label className="select-control">
            <span>View by</span>
            <select value={dimension} onChange={(event) => changeDimension(event.target.value as PnlDimension)}>
              {(Object.keys(pnlDimensionMembers) as PnlDimension[]).map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="select-control">
            <span>Scope</span>
            <select value={member} onChange={(event) => setMember(event.target.value)}>
              {pnlDimensionMembers[dimension].map((option) => <option key={option.label}>{option.label}</option>)}
            </select>
          </label>
          <SyntheticDemoNotice />
        </div>
      </div>

      <div className="demo-content">
        <div className="analysis-context-strip">
          <span><strong>{member}</strong> · YTD June · Actual vs {comparison}</span>
          <span>Drill path: {dimension} → P&amp;L line → variance driver → owner</span>
        </div>

        <div className="demo-kpi-grid">
          <DemoKpi detail="YTD through June" icon={<CircleDollarSign size={17} />} label="Net revenue" value={formatMillions(revenue.actual)} />
          <DemoKpi detail={`Actual vs ${comparison}`} icon={<GitCompareArrows size={17} />} label="Revenue variance" tone={revenue.variance >= 0 ? "positive" : "warning"} value={formatMillions(revenue.variance, true)} />
          <DemoKpi detail={`${formatMillions(operatingIncome.variance, true)} vs ${comparison}`} icon={<Sparkles size={17} />} label="Operating margin" tone="positive" value={`${operatingMargin.toFixed(1)}%`} />
          <DemoKpi detail="Statement and detail agree" icon={<BadgeCheck size={17} />} label="Reconciliation" value="99.7%" />
        </div>

        <div className="demo-grid demo-grid-pnl">
          <section className="demo-panel chart-panel">
            <div className="panel-heading">
              <div><span>Trend</span><h3>Revenue by month</h3></div>
              <small>USD millions</small>
            </div>
            <div className="chart-wrap" aria-label={`Monthly actual revenue compared with ${comparison}`}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={snapshot.chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
              <small>7 management lines</small>
            </div>
            <div className="demo-table-scroll">
              <table className="demo-table pnl-investigable-table">
                <thead><tr><th>USD millions</th><th>Actual</th><th>{comparison}</th><th>Variance</th><th>Var %</th></tr></thead>
                <tbody>
                  {snapshot.rows.map((row) => {
                    const variancePercent = row.plan ? (row.variance / Math.abs(row.plan)) * 100 : 0;
                    return (
                      <tr className={`${row.weight === 2 ? "total-row" : row.weight === 1 ? "subtotal-row" : ""} ${selectedLineId === row.id ? "selected-row" : ""}`} key={row.id}>
                        <th><button onClick={() => setSelectedLineId(row.id)} type="button"><span>{row.label}</span><ChevronRight aria-hidden="true" size={14} /></button></th>
                        <td>{formatMillions(row.actual)}</td>
                        <td>{formatMillions(row.plan)}</td>
                        <td className={row.variance >= 0 ? "positive" : "negative"}>{formatMillions(row.variance, true)}</td>
                        <td className={variancePercent >= 0 ? "positive" : "negative"}>{variancePercent > 0 ? "+" : ""}{variancePercent.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="demo-panel variance-investigation">
          <div className="panel-heading">
            <div><span>Variance investigation</span><h3>{selectedRow.label}: {formatMillions(selectedRow.variance, true)} vs {comparison}</h3></div>
            <small>{drivers.length} reconciled drivers</small>
          </div>
          <div className="variance-workspace">
            <div className="driver-bridge" aria-label={`${selectedRow.label} variance drivers`}>
              {drivers.map((driver, index) => (
                <button className={selectedDriverIndex === index ? "active" : ""} key={driver.label} onClick={() => setSelectedDriverIndex(index)} type="button">
                  <div><span>{driver.label}</span><strong className={driver.amount >= 0 ? "positive" : "negative"}>{formatMillions(driver.amount, true)}</strong></div>
                  <span className="driver-track"><i className={driver.amount >= 0 ? "positive-bar" : "negative-bar"} style={{ width: `${Math.max(10, Math.abs(driver.amount) / maxDriver * 100)}%` }} /></span>
                </button>
              ))}
              <div className="bridge-reconciliation"><Check aria-hidden="true" size={14} /><span>Bridge total</span><strong>{formatMillions(drivers.reduce((sum, driver) => sum + driver.amount, 0), true)}</strong></div>
            </div>
            <article className="driver-evidence">
              <div className="driver-evidence-heading"><span>Selected driver</span><h4>{selectedDriver.label}</h4></div>
              <dl>
                <div><dt>Evidence</dt><dd>{selectedDriver.evidence}</dd></div>
                <div><dt>Interpretation</dt><dd>{selectedDriver.interpretation}</dd></div>
                <div><dt>Owner</dt><dd>{selectedDriver.owner}</dd></div>
                <div><dt>Recommended action</dt><dd>{selectedDriver.action}</dd></div>
              </dl>
              <button className="button button-primary" onClick={() => setLoggedDriver(selectedDriver.label)} type="button">
                {loggedDriver === selectedDriver.label ? <><Check aria-hidden="true" size={15} /> Follow-up logged</> : <>Assign follow-up <ChevronRight aria-hidden="true" size={15} /></>}
              </button>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
