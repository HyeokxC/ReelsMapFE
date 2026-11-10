"use client";

import { useApp } from "./app-provider";
import { Loading, Panel, Section, Toggle } from "./ui";
import { PendingDeletion, sharing } from "./list-summary";

export const syncRules = ["지도 앱에서 추가한 장소는 ReelsMap에 자동으로 추가합니다.", "삭제는 어느 쪽에서든 확인한 뒤에만 반영합니다.", sharing, "로그인이 만료되면 동기화를 멈추고 다시 로그인을 요청합니다."] as const;

export function Lists() {
  const { state, mutate, busy } = useApp();
  const rules = <div className="group">{syncRules.map(rule => <p className="row sub" key={rule}>{rule}</p>)}</div>;
  return <>
    <Panel title="외부 지도 목록" subtitle="연결한 지도 목록과 들어온 변경">
      {!state ? <Loading /> : <>
        <Section title="연결한 지도 목록">{state.lists.map(list => <article className="row" key={list.id}><h3 className="title">{list.name}</h3><p className="sub">서버 브라우저에서 {list.provider} 로그인됨 (예시)</p><div className="row-actions"><button className="outline" disabled={busy} onClick={() => void mutate({ action: "login", id: list.id }, `${list.provider} 서버 브라우저 로그인 상태를 갱신했습니다`)}>다시 로그인</button><span className="sub">{list.id === "naver" ? "국내" : "해외"} 장소를 저장합니다.</span></div><Toggle label={`${list.provider} 자동 동기화`} checked={list.sync} disabled={busy} onChange={enabled => void mutate({ action: "sync", id: list.id, enabled }, `자동 동기화를 ${enabled ? "켰습니다" : "껐습니다"}`)} /><p className="state on">자동 동기화 {list.sync ? "켜짐" : "꺼짐"} (예시)</p></article>)}</Section>
        <p className="share">사용자마다 분리된 서버 브라우저에서 저장 목록을 읽고 씁니다. 로그인이 만료되면 알려 드립니다.</p>
        <Section title="들어온 변경">{state.changes.filter(change => change.kind === "addition").map(change => <div className="row" key={change.id}><p className="sub">네이버 지도 목록에서 &apos;{change.name}&apos;가 추가됨 (예시)</p><span className="state on">ReelsMap에 추가됨 (예시)</span></div>)}<PendingDeletion /></Section>
        <div className="mobile-only"><Section title="동기화 규칙">{syncRules.map(rule => <p className="row sub" key={rule}>{rule}</p>)}</Section></div>
        <p className="share">{sharing}</p>
      </>}
    </Panel>
    <aside className="inspector material" data-lens="panel"><h2>동기화 규칙</h2>{rules}<p className="share">이 화면의 로그인과 동기화는 예시 상태입니다. 실제 서버 브라우저는 실행하지 않습니다.</p></aside>
  </>;
}
