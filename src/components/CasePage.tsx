import { useEffect } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Code2, ExternalLink, ShieldCheck } from "lucide-react";
import { casePath, cases, type PortfolioCase } from "../cases/cases";
import { AiControlsAgentDemo, AiCopilotDemo, ForecastDemo, PipelineDemo, PnlDemo } from "./Demos";

function CaseDemo({ item }: { item: PortfolioCase }) {
  if (item.theme === "pnl") return <PnlDemo />;
  if (item.theme === "forecast") return <ForecastDemo />;
  if (item.theme === "pipeline") return <PipelineDemo />;
  if (item.theme === "copilot") return <AiCopilotDemo />;
  return <AiControlsAgentDemo />;
}

export function CasePage({ item }: { item: PortfolioCase }) {
  const index = cases.findIndex((candidate) => candidate.slug === item.slug);
  const previous = cases[(index - 1 + cases.length) % cases.length];
  const next = cases[(index + 1) % cases.length];

  useEffect(() => {
    document.title = `${item.title} | Guilherme Chehade`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = item.summary;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [item]);

  return (
    <main className={`case-page theme-${item.theme}`}>
      <section className="case-masthead page-shell">
        <div className="case-masthead-copy">
          <div className="case-label-row">
            <span className="case-number">Case {item.number}</span>
            <span className="synthetic-label"><ShieldCheck aria-hidden="true" size={14} /> Synthetic public scenario</span>
          </div>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
          <div className="case-actions">
            <a className="button button-primary" href="#interactive-demo">
              Explore the demo <ArrowDown aria-hidden="true" size={16} />
            </a>
            <a
              className="button button-secondary"
              href="https://github.com/guiChehade/finance-automation-portfolio"
              rel="noreferrer"
              target="_blank"
            >
              <Code2 aria-hidden="true" size={16} /> View source <ExternalLink aria-hidden="true" size={13} />
            </a>
          </div>
        </div>
        <dl className="case-facts">
          <div><dt>Illustrative company</dt><dd>{item.client}</dd></div>
          <div><dt>Context</dt><dd>{item.industry}</dd></div>
          <div><dt>Role pattern</dt><dd>{item.role}</dd></div>
          <div><dt>Illustrative timeline</dt><dd>{item.duration}</dd></div>
        </dl>
      </section>

      <section className="demo-band" id="interactive-demo">
        <div className="page-shell">
          <div className="demo-heading">
            <div>
              <span className="eyebrow">Working product</span>
              <h2>Operate the model, not a screenshot.</h2>
            </div>
            <p>Client-side simulation · no external systems or employer data</p>
          </div>
          <CaseDemo item={item} />
        </div>
      </section>

      <section className="case-story page-shell">
        <div className="story-grid">
          <article>
            <span className="eyebrow">The challenge</span>
            <h2>{item.challengeTitle}</h2>
            <p>{item.problem}</p>
            <div className="challenge-signals">
              <h3>Operational symptoms</h3>
              <ul>{item.challengeSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
            </div>
            <div className="decision-risk">
              <span>Decision at risk</span>
              <p>{item.decisionRisk}</p>
            </div>
          </article>
          <article>
            <span className="eyebrow">What I built</span>
            <h2>A governed path from source to decision.</h2>
            <ol className="approach-list">
              {item.approach.map((step, stepIndex) => (
                <li key={step}><span>{String(stepIndex + 1).padStart(2, "0")}</span>{step}</li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="impact-band">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Illustrative impact</span>
              <h2>What the operating model is designed to change</h2>
            </div>
            <p>These figures are synthetic and demonstrate scale, not employer claims.</p>
          </div>
          <div className="impact-grid">
            {item.metrics.map((metric) => (
              <article key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="capability-section page-shell">
        <div className="capability-copy">
          <span className="eyebrow">Client translation</span>
          <h2>Why this matters beyond one dashboard</h2>
          <p>{item.clientTranslation}</p>
        </div>
        <div className="capability-lists">
          <div>
            <h3>Technology</h3>
            <ul>{item.stack.map((entry) => <li key={entry}>{entry}</li>)}</ul>
          </div>
          <div>
            <h3>Finance &amp; data capabilities</h3>
            <ul>{item.keywords.map((entry) => <li key={entry}>{entry}</li>)}</ul>
          </div>
        </div>
      </section>

      <nav className="case-pagination page-shell" aria-label="Adjacent cases">
        <a href={casePath(previous)}><ArrowLeft aria-hidden="true" size={17} /><span><small>Previous case</small>{previous.navLabel}</span></a>
        <a href={casePath(next)}><span><small>Next case</small>{next.navLabel}</span><ArrowRight aria-hidden="true" size={17} /></a>
      </nav>
    </main>
  );
}
