import { lazy, Suspense } from "react";
import { PortfolioHome } from "./components/PortfolioHome";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { findCase } from "./cases/cases";

const CasePage = lazy(() => import("./components/CasePage").then((module) => ({ default: module.CasePage })));

function NotFound() {
  return (
    <main className="not-found page-shell">
      <span className="eyebrow">404</span>
      <h1>This case is not in the portfolio.</h1>
      <p>The link may have changed, or the case has not been published.</p>
      <a className="button button-primary" href="/">Return to all cases</a>
    </main>
  );
}

export function App() {
  const pathname = window.location.pathname;
  const selectedCase = findCase(pathname);

  return (
    <div className="site-frame">
      <SiteHeader activeSlug={selectedCase?.slug} />
      {pathname === "/" || pathname === "" ? (
        <PortfolioHome />
      ) : selectedCase ? (
        <Suspense fallback={<main className="case-loading page-shell" aria-live="polite">Preparing interactive case...</main>}>
          <CasePage item={selectedCase} />
        </Suspense>
      ) : (
        <NotFound />
      )}
      <SiteFooter />
    </div>
  );
}
