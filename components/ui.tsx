"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useApp } from "./app-provider";
import { categories } from "@/lib/types";

export function Panel({ title, children, footer, className = "", subtitle }: { title: string; children: ReactNode; footer?: ReactNode; className?: string; subtitle?: ReactNode }) {
  return <section className={`sidebar material ${className}`} data-lens="panel" aria-label={title}><header><h1 className="large-title">{title}</h1>{subtitle && <div className="subhead">{subtitle}</div>}</header><div className="scroll">{children}</div>{footer && <div className="sidebar-foot">{footer}</div>}</section>;
}
export function Section({ title, children }: { title: string; children: ReactNode }) { return <section className="section"><h2 className="section-label">{title}</h2><div className="group">{children}</div></section>; }
export function Filters() {
  const { category, setCategory } = useApp();
  return <div className="filters" role="group" aria-label="카테고리">{["전체", ...categories].map(item => <button className="pill" aria-pressed={category === item} key={item} onClick={() => { if (item === "전체") setCategory(item); else { const found = categories.find(value => value === item); if (found) setCategory(found); } }}>{item}</button>)}</div>;
}
export function Loading() { return <div className="loading" role="status" aria-label="예시 데이터 불러오는 중"><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /></div>; }
export function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className="toggle-row"><span>{label}</span><input className="switch" type="checkbox" role="switch" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} /></label>;
}
export function Alert({ title, children, confirm, onClose, onConfirm, onDismiss, busy = false }: { title: string; children: ReactNode; confirm: string; onClose: () => void; onConfirm: () => void; onDismiss?: () => void; busy?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null), cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => { dialog.current?.showModal(); cancel.current?.focus(); }, []);
  return <dialog className="alert material" ref={dialog} aria-labelledby="alert-title" onCancel={onDismiss ?? onClose}><h2 id="alert-title">{title}</h2><div className="alert-body">{children}</div><div className="alert-actions"><button ref={cancel} className="outline" disabled={busy} onClick={onClose}>유지</button><button className="danger-fill" disabled={busy} onClick={onConfirm}>{confirm}</button></div></dialog>;
}
