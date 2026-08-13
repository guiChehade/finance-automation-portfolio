import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Info,
  Undo2,
  X,
} from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

type ToastTone = "success" | "warning" | "info";
type ToastInput = {
  title: string;
  detail?: string;
  tone?: ToastTone;
  undo?: () => void;
};
type ToastEntry = ToastInput & { id: number };

const ToastContext = createContext<{ pushToast: (toast: ToastInput) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    window.setTimeout(() => dismiss(id), 5200);
  }, [dismiss]);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-label="Workflow notifications">
        {toasts.map((toast) => {
          const Icon = toast.tone === "warning" ? CircleAlert : toast.tone === "info" ? Info : CheckCircle2;
          return (
            <div className={`toast toast-${toast.tone ?? "success"}`} key={toast.id} role="status">
              <Icon aria-hidden="true" size={18} />
              <div><strong>{toast.title}</strong>{toast.detail && <span>{toast.detail}</span>}</div>
              {toast.undo && (
                <button aria-label="Undo action" onClick={() => { toast.undo?.(); dismiss(toast.id); }} title="Undo" type="button">
                  <Undo2 aria-hidden="true" size={16} />
                </button>
              )}
              <button aria-label="Dismiss notification" onClick={() => dismiss(toast.id)} title="Dismiss" type="button">
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function useSessionState<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.sessionStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch {
      // A private browsing policy can disable session storage; the demo still works in memory.
    }
    return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the interactive workflow available even when persistence is unavailable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export type AuditEvent = {
  id: number;
  title: string;
  detail: string;
  actor?: string;
  time?: string;
  tone?: "complete" | "pending" | "blocked";
};

export function AuditTimeline({ events, empty = "No workflow activity yet." }: { events: AuditEvent[]; empty?: string }) {
  return (
    <div className="audit-timeline">
      {events.length === 0 ? <p className="empty-state">{empty}</p> : events.map((event) => (
        <article className={`audit-event audit-${event.tone ?? "complete"}`} key={event.id}>
          <span className="audit-marker"><Clock3 aria-hidden="true" size={13} /></span>
          <div>
            <strong>{event.title}</strong>
            <p>{event.detail}</p>
            <small>{event.actor ?? "Guilherme Chehade"} · {event.time ?? "Just now"}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ConfirmDialog({
  cancelLabel = "Cancel",
  children,
  confirmDisabled = false,
  confirmLabel,
  icon,
  onCancel,
  onConfirm,
  open,
  title,
}: {
  cancelLabel?: string;
  children: ReactNode;
  confirmDisabled?: boolean;
  confirmLabel: string;
  icon?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onCancel, open]);

  if (!open) return null;
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section aria-labelledby={titleId} aria-modal="true" className="workflow-dialog" role="dialog">
        <header>
          <span>{icon}</span>
          <h3 id={titleId}>{title}</h3>
          <button aria-label="Close dialog" onClick={onCancel} title="Close" type="button"><X aria-hidden="true" size={18} /></button>
        </header>
        <div className="dialog-body">{children}</div>
        <footer>
          <button className="button button-secondary" onClick={onCancel} type="button">{cancelLabel}</button>
          <button className="button button-primary" disabled={confirmDisabled} onClick={onConfirm} type="button">{confirmLabel}</button>
        </footer>
      </section>
    </div>
  );
}

export function SideDrawer({ children, onClose, open, title }: { children: ReactNode; onClose: () => void; open: boolean; title: string }) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside aria-labelledby={titleId} aria-modal="true" className="side-drawer" role="dialog">
        <header><h3 id={titleId}>{title}</h3><button aria-label="Close drawer" onClick={onClose} title="Close" type="button"><X size={18} /></button></header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}
