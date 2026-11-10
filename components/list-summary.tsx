"use client";

import { useState } from "react";
import { useApp } from "./app-provider";
import { Alert } from "./ui";
import { Icon } from "./icons";

export const sharing = "공유와 공동 편집은 네이버 지도와 Google 지도에서 합니다.";
export function PendingDeletion({ compact = false }: { compact?: boolean }) {
  const { state, busy, mutate } = useApp();
  const [open, setOpen] = useState(false);
  const pending = state?.changes.find(change => change.kind === "deletion");
  if (!pending) return <p className="row sub" data-testid="deletion-resolved">확인할 삭제 요청이 없습니다. (예시)</p>;
  return <>
    <div className="row" data-testid="pending-deletion"><p className="sub">네이버 지도 목록에서 &apos;{pending.name}&apos;가 삭제됨</p><div className="row-actions"><span className="state warn">{pending.deferred ? "나중에 확인 (예시)" : "확인 필요"}</span><button className="tinted" onClick={() => setOpen(true)}>확인</button>{!compact && <button className="outline" disabled={busy} onClick={() => void mutate({ action: "deletion", id: pending.id, decision: "later" }, "삭제 확인을 미뤘습니다")}>나중에</button>}</div></div>
    {open && <Alert title="ReelsMap에서도 삭제할까요?" confirm="ReelsMap에서 삭제" busy={busy} onDismiss={() => setOpen(false)} onClose={() => { void mutate({ action: "deletion", id: pending.id, decision: "keep" }, "ReelsMap의 장소를 유지했습니다").then(ok => { if (ok) setOpen(false); }); }} onConfirm={() => { void mutate({ action: "deletion", id: pending.id, decision: "delete" }, "삭제 요청을 반영했습니다").then(ok => { if (ok) setOpen(false); }); }}>네이버 지도 목록에서 &apos;{pending.name}&apos;가 삭제됐습니다. 확인하기 전에는 ReelsMap에서 지우지 않습니다.</Alert>}
  </>;
}
export function ListSummary() {
  const { state } = useApp();
  return <aside className="inspector material" data-lens="panel" aria-label="외부 지도 목록 요약"><h2>외부 지도 목록</h2><div className="group">{state?.lists.map(list => <div className="row" key={list.id}><div className="row-line"><Icon name="list" /><strong className="title">{list.name}</strong></div><p className="sub">서버 브라우저에서 {list.provider} 로그인됨 (예시)</p><span className="state on">자동 동기화 {list.sync ? "켜짐" : "꺼짐"} (예시)</span></div>)}</div><h3 className="section-label">확인 필요</h3><div className="group"><PendingDeletion compact /></div><p className="share"><Icon name="person" small />{sharing}</p></aside>;
}
