import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  DatabaseZap,
  GitCompareArrows,
  ShieldCheck,
} from "lucide-react";
import { casePath, cases, type PortfolioCase } from "../cases/cases";

const caseIcons = {
  pnl: ChartNoAxesCombined,
  forecast: GitCompareArrows,
  pipeline: DatabaseZap,
  copilot: BrainCircuit,
  agent: Bot,
};

function MiniProduct({ item }: { item: PortfolioCase }) {
  const Icon = caseIcons[item.theme];
  return (
    <div className={`mini-product theme-${item.theme}`} aria-hidden="true">
      <div className="mini-product-header">
        <span><Icon size={15} /> {item.navLabel}</span>
        <i />
      </div>
      <div className="mini-product-kpis">
        <span><b>{item.metrics[0].value}</b><i /></span>
        <span><b>{item.metrics[1].value}</b><i /></span>
        <span><b>{item.metrics[2].value}</b><i /></span>
      </div>
      <div className="mini-product-chart">
        {[42, 58, 50, 71, 64, 82, 76, 91].map((height, index) => (
          <i key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}

export function PortfolioHome() {
  return (
    <main>
      <section className="portfolio-intro page-shell">
        <div className="intro-copy">
          <span className="eyebrow">Finance, data &amp; AI portfolio · 2026</span>
          <h1>FP&amp;A workflows built as governed decision products.</h1>
          <p>
            Five interactive cases showing how I connect corporate finance,
            data engineering, automation and applied AI across P&amp;L reporting,
            forecasting, financial pipelines and controlled decision support.
          </p>
        </div>
        <div className="intro-proof" aria-label="Portfolio focus">
          <span><ShieldCheck aria-hidden="true" size={17} /> Governed financial logic</span>
          <span><DatabaseZap aria-hidden="true" size={17} /> Automated data workflows</span>
          <span><ChartNoAxesCombined aria-hidden="true" size={17} /> Decision-ready reporting</span>
          <span><BrainCircuit aria-hidden="true" size={17} /> Governed applied AI</span>
        </div>
      </section>

      <section className="case-index-band">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Selected work</span>
              <h2>Five problems, one operating principle</h2>
            </div>
            <p>Reduce manual finance work without losing control, traceability or business context.</p>
          </div>

          <div className="case-card-grid">
            {cases.map((item) => (
              <article className={`case-card theme-${item.theme}`} key={item.slug}>
                <MiniProduct item={item} />
                <div className="case-card-body">
                  <span className="case-number">Case {item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="case-card-meta">
                    <span>{item.client}</span>
                    <span>{item.role}</span>
                  </div>
                  <a href={casePath(item)}>
                    Explore the case <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="transparency-band">
        <div className="page-shell transparency-inner">
          <ShieldCheck aria-hidden="true" size={23} />
          <div>
            <strong>Built from real solution patterns, published with synthetic data.</strong>
            <p>
              Company names, values, volumes, timelines and impact metrics are illustrative.
              No employer data, proprietary source code or confidential business logic is included.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
