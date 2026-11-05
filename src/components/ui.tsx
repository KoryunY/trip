import { Check, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Person } from '../../shared/types';
import { t as tx } from '../i18n';

// ───────── Avatar ─────────
export function Avatar({
  person,
  size = '',
  off,
  done,
  title,
}: {
  person?: Person | null;
  size?: '' | 'sm' | 'md' | 'lg' | 'xl';
  off?: boolean;
  done?: boolean;
  title?: string;
}) {
  if (!person) return <span className={`avatar ${size}`} aria-hidden>?</span>;
  return (
    <span
      className={`avatar ${size} ${off ? 'off' : ''}`}
      style={{ ['--c' as string]: person.color }}
      title={title ?? person.name}
      aria-label={title ?? person.name}
      role="img"
    >
      {person.name.slice(0, 1)}
      {done && (
        <span className="badge" aria-hidden>
          <Check />
        </span>
      )}
    </span>
  );
}

export function AvatarStack({ people, size = 'sm', max = 4 }: { people: (Person | undefined)[]; size?: 'sm' | 'md' | ''; max?: number }) {
  const list = people.filter(Boolean) as Person[];
  return (
    <span className="stack" aria-label={list.map((p) => p.name).join(', ')}>
      {list.slice(0, max).map((p) => (
        <Avatar key={p.id} person={p} size={size} />
      ))}
    </span>
  );
}

// ───────── Sheet ─────────
let openSheets = 0;
export function Sheet({
  title,
  onClose,
  children,
  footer,
  actions,
  label,
}: {
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [dy, setDy] = useState(0);
  useEffect(() => {
    openSheets++;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      openSheets--;
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return createPortal(
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={label ?? (typeof title === 'string' ? title : tx("Details"))}>
      <div className="sheet-scrim" onClick={onClose} />
      <div
        className="sheet"
        ref={ref}
        tabIndex={-1}
        style={dy ? { transform: `translateY(${dy}px)`, transition: 'none' } : undefined}
      >
        <div
          onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (startY.current == null) return;
            setDy(Math.max(0, e.touches[0].clientY - startY.current));
          }}
          onTouchEnd={() => {
            if (dy > 90) onClose();
            setDy(0);
            startY.current = null;
          }}
        >
          <div className="sheet-grab" />
          <div className="sheet-head">
            {title ? <h2>{title}</h2> : <div style={{ flex: 1 }} />}
            {actions}
            <button className="icon-btn" onClick={onClose} aria-label={tx("Close")}>
              <X />
            </button>
          </div>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
export const anySheetOpen = () => openSheets > 0;

// ───────── Controls ─────────
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button className="toggle" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />;
}

export function CheckBox({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      className="check"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!on);
        navigator.vibrate?.(8);
      }}
    >
      <Check />
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} aria-pressed={value === o.v} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <div>{children}</div>
    </div>
  );
}

// ───────── Toasts ─────────
interface ToastItem {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}
let toasts: ToastItem[] = [];
const tl = new Set<() => void>();
let tid = 0;
export function toast(text: string, action?: ToastItem['action'], ms = 3200) {
  const t = { id: ++tid, text, action };
  toasts = [...toasts, t];
  tl.forEach((l) => l());
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    tl.forEach((l) => l());
  }, ms);
}
export function Toasts() {
  const list = useSyncExternalStore(
    (l) => {
      tl.add(l);
      return () => tl.delete(l);
    },
    () => toasts,
  );
  return (
    <div className="toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div className="toast" key={t.id}>
          <span>{t.text}</span>
          {t.action && (
            <button
              onClick={() => {
                t.action!.run();
                toasts = toasts.filter((x) => x.id !== t.id);
                tl.forEach((l) => l());
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function confirmAsk(text: string) {
  return window.confirm(text);
}
