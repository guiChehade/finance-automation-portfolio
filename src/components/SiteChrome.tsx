import { Code2, ContactRound, ExternalLink } from "lucide-react";
import { casePath, cases } from "../cases/cases";

export function SiteHeader({ activeSlug }: { activeSlug?: string }) {
  return (
    <header className="site-header"><div className="header-inner">
      <a className="identity" href="/" aria-label="Guilherme Chehade portfolio home"><span className="identity-mark">GC</span><span className="identity-copy"><strong>Guilherme Chehade</strong><small>FP&A · Finance Data · Applied AI</small></span></a>
      <nav className="case-navigation" aria-label="Portfolio cases">{cases.map((item) => <a aria-current={activeSlug === item.slug ? "page" : undefined} className={activeSlug === item.slug ? "active" : ""} href={casePath(item)} key={item.slug}><span>{item.number}</span>{item.navLabel}</a>)}</nav>
      <a className="header-link" href="https://www.linkedin.com/in/guilherme-chehade-pcd-a18644a3/" rel="noreferrer" target="_blank"><ContactRound size={16} /> LinkedIn <ExternalLink size={12} /></a>
    </div></header>
  );
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-inner"><div><strong>Guilherme Chehade</strong><p>FP&A systems, financial data products and controlled AI automation.</p></div><div className="footer-links"><a href="https://github.com/guiChehade/finance-automation-portfolio" rel="noreferrer" target="_blank"><Code2 size={16} /> Source</a><a href="https://www.linkedin.com/in/guilherme-chehade-pcd-a18644a3/" rel="noreferrer" target="_blank"><ContactRound size={16} /> LinkedIn</a></div></div></footer>;
}
