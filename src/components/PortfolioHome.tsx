import { ArrowRight, Bot, BrainCircuit, ChartNoAxesCombined, DatabaseZap, GitCompareArrows, ShieldCheck } from "lucide-react";
import { casePath, cases, type PortfolioCase } from "../cases/cases";

const icons = { pnl: ChartNoAxesCombined, forecast: GitCompareArrows, pipeline: DatabaseZap, copilot: BrainCircuit, agent: Bot };
const productSignals: Record<PortfolioCase["theme"], string[]> = {
  pnl: ["9 markets", "4 brands", "6 channels", "Reconciled bridge"],
  forecast: ["8 drivers", "12 months", "3 guardrails", "Version workflow"],
  pipeline: ["4 incidents", "5 controls", "2.84M rows", "Release gate"],
  copilot: ["5 evidence IDs", "4 claim checks", "Human approval", "Blocked gaps"],
  agent: ["18 cases", "4 read-only tools", "Full trace", "0 postings"],
};

function ProductPreview({ item }: { item: PortfolioCase }) {
  const Icon = icons[item.theme];
  return (
    <div className={`product-preview theme-${item.theme}`} aria-hidden="true">
      <header><span><Icon size={15} /> {item.navLabel}</span><i /><i /></header>
      <div className="preview-sidebar"><i /><i /><i /><i /></div>
      <div className="preview-content"><div><strong>{productSignals[item.theme][0]}</strong><strong>{productSignals[item.theme][1]}</strong><strong>{productSignals[item.theme][2]}</strong></div><span>{[34, 55, 42, 72, 63, 88, 79, 94].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</span><footer><i /><i /><i /></footer></div>
    </div>
  );
}

export function PortfolioHome() {
  return (
    <main>
      <section className="portfolio-intro page-shell">
        <div className="intro-copy"><span className="eyebrow">Guilherme Chehade · Finance systems portfolio</span><h1>FP&A, data engineering and applied AI built into working products.</h1><p>Five interactive operating models that show how I turn reporting, planning, financial data and controlled AI into decisions people can inspect, challenge and approve.</p></div>
        <dl className="intro-proof"><div><dt>Focus</dt><dd>Global FP&A and finance transformation</dd></div><div><dt>Strength</dt><dd>Finance logic translated into robust systems</dd></div><div><dt>Delivery</dt><dd>From granular data to governed workflow</dd></div></dl>
      </section>

      <section className="capability-strip"><div className="page-shell"><span><ShieldCheck size={16} /> Reconciled financial logic</span><span><DatabaseZap size={16} /> Automated data pipelines</span><span><GitCompareArrows size={16} /> Driver-based planning</span><span><BrainCircuit size={16} /> Human-controlled AI</span></div></section>

      <section className="case-index-band"><div className="page-shell">
        <div className="section-heading"><div><span className="eyebrow">Interactive casework</span><h2>Open a product and work through the decision.</h2></div><p>Change assumptions, reproduce failures, inspect evidence and complete controlled actions.</p></div>
        <div className="case-card-grid">{cases.map((item) => (
          <article className={`case-card theme-${item.theme}`} key={item.slug}>
            <ProductPreview item={item} />
            <div className="case-card-body"><div className="case-card-heading"><span>Case {item.number}</span><small>{item.client}</small></div><h3>{item.title}</h3><p>{item.summary}</p><div className="product-signal-list">{productSignals[item.theme].map((signal) => <span key={signal}>{signal}</span>)}</div><a href={casePath(item)}>Open interactive case <ArrowRight size={16} /></a></div>
          </article>
        ))}</div>
      </div></section>

      <section className="transparency-band"><div className="page-shell transparency-inner"><ShieldCheck size={22} /><div><strong>Real solution patterns, deliberately synthetic public data.</strong><p>Company names, amounts, volumes and impact figures are illustrative. The operating logic, controls and interaction depth are the portfolio evidence.</p></div></div></section>
    </main>
  );
}
