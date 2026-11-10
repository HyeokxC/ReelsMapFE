"use client";

import { useState } from "react";
import { useApp } from "./app-provider";
import { Panel } from "./ui";

const steps = ["인스타그램에서 릴스나 게시물의 공유 버튼을 누릅니다", "공식 계정을 골라 DM으로 보냅니다", "ReelsMap 받은 게시물에 나타납니다"] as const;
export function Start() {
  const { state, mutate, busy, notify } = useApp();
  const [copied, setCopied] = useState(false), [instructions, setInstructions] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText("RM-4821"); setCopied(true); notify("예시 코드를 복사했습니다. (예시)"); }
    catch (cause) { notify(cause instanceof Error ? "클립보드 권한을 확인하거나 RM-4821을 직접 복사해 주세요. (예시)" : "코드를 직접 복사해 주세요. (예시)"); }
  };
  return <>
    <Panel title="ReelsMap 시작하기" className="start-panel" footer={<button className="prominent" onClick={() => { setInstructions(true); notify("공식 계정 이름이 확정되지 않아 실제 Instagram을 열지 않습니다. (예시)"); }}>인스타그램 열기 (예시)</button>}>
      <ol className="steps">
        <li className="group row"><h2><span className="step-number">1</span>Google로 로그인</h2><p className="sub">{state?.settings.signedIn ? "예시 사용자 (Google 계정, 예시)" : "로그인 전 (예시)"}</p><p className="sub">초대받은 Google 계정만 로그인할 수 있습니다. (베타)</p><button className="textlink" disabled={busy} onClick={() => void mutate({ action: "account", operation: "sign-in" }, "예시 Google 계정으로 로그인했습니다")}>{state?.settings.signedIn ? "다른 계정 사용" : "Google 로그인 (예시)"}</button></li>
        <li className="group row"><h2><span className="step-number">2</span>인스타그램 DM 계정 연결</h2><p className="sub">아래 인증 코드를 공식 계정에 DM으로 보내면, 보낸 인스타그램 계정이 연결됩니다.</p><div className="row-line"><span className="code">RM-4821</span><button className="tinted" onClick={() => void copy()}>{copied ? "복사됨 (예시)" : "복사"}</button></div><p className="sub">예시 코드</p><div><span className="slot">공식 계정 이름 확정 전</span></div><p className="sub">코드는 10분 동안 유효합니다. (예시)</p><p className="state">연결 대기 중</p></li>
      </ol>
      <p className="share">공개 게시물만 분석합니다. 분석이 끝나면 사진과 영상 파일은 삭제합니다.</p>
      <div className="mobile-only"><button className="textlink" aria-expanded={instructions} onClick={() => setInstructions(!instructions)}>공유하는 방법</button>{instructions && <ol className="rules">{steps.map(step => <li key={step}>{step}</li>)}</ol>}</div>
    </Panel>
    <aside className="inspector material" data-lens="panel"><h2>공유하는 방법</h2><ol className="rules">{steps.map(step => <li key={step}>{step}</li>)}</ol><p className="share">실제 DM을 보내거나 계정을 연결하지 않는 예시 흐름입니다.</p></aside>
  </>;
}
