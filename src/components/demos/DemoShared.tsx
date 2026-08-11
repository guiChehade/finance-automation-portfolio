import { ShieldCheck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function formatMillions(value: number, signed = false): string {
  const sign = value < 0 ? "-" : signed && value > 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toFixed(1)}M`;
}

export function DemoKpi({
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

export function SyntheticDemoNotice() {
  return (
    <div className="demo-notice">
      <ShieldCheck aria-hidden="true" size={14} />
      Synthetic data · illustrative workflow
    </div>
  );
}

export function ProductName({ icon: Icon, name, subtitle }: { icon: LucideIcon; name: string; subtitle: string }) {
  return (
    <div className="demo-product-name">
      <span className="demo-product-mark"><Icon aria-hidden="true" size={18} /></span>
      <div><strong>{name}</strong><small>{subtitle}</small></div>
    </div>
  );
}
