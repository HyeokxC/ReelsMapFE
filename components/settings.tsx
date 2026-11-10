"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "./app-provider";
import { Alert, Loading, Panel, Section, Toggle } from "./ui";
import { commentRule, originalRule } from "./post-detail";
import type { Settings as SettingsData } from "@/lib/types";
import { destinationSchema } from "@/lib/types";

export function Settings() {
  const { state, mutate, busy } = useApp();
  const [draft, setDraft] = useState<SettingsData | null>(null), [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const values = draft ?? state?.settings;
  return <>
    <Panel title="설정" subtitle="예시 사용자" footer={<button className="prominent" disabled={busy || !values} onClick={() => { if (values) void mutate({ action: "settings", settings: values }, "변경 사항을 저장했습니다").then(ok => { if (ok) setDraft(null); }); }}>변경 저장</button>}>
      {!state || !values ? <Loading /> : <>
        <Section title="계정"><div className="row"><p>Google 계정 예시 사용자 (예시)</p><p className="sub">{state.settings.signedIn ? "Google 계정으로 로그인함 (예시)" : "로그아웃됨 (예시)"}</p><div className="row-actions"><button className="outline" disabled={busy} onClick={() => void mutate({ action: "account", operation: "sign-out" }, "로그아웃했습니다").then(ok => { if (ok) router.push("/start"); })}>로그아웃</button></div></div></Section>
        <Section title="인스타그램 DM 연결"><div className="row"><p className="sub">{state.settings.dmLinked ? "@example_user 연결됨 (예시)" : "연결 해제됨 (예시)"}</p><div className="row-actions"><button className="outline" disabled={busy || !state.settings.dmLinked} onClick={() => void mutate({ action: "account", operation: "unlink" }, "DM 연결을 해제했습니다")}>연결 해제</button><Link className="textlink" href="/start">다른 계정 연결</Link></div></div></Section>
        <Section title="저장 위치"><label className="row"><span className="sub">국내 장소</span><select value={values.domestic} onChange={event => setDraft({ ...values, domestic: destinationSchema.parse(event.target.value) })}><option value="네이버 지도">네이버 지도 목록 &apos;ReelsMap 예시&apos;</option><option value="Google 지도">Google 지도 목록 &apos;ReelsMap 예시&apos;</option></select></label><label className="row"><span className="sub">해외 장소</span><select value={values.overseas} onChange={event => setDraft({ ...values, overseas: destinationSchema.parse(event.target.value) })}><option value="네이버 지도">네이버 지도 목록 &apos;ReelsMap 예시&apos;</option><option value="Google 지도">Google 지도 목록 &apos;ReelsMap 예시&apos;</option></select></label></Section>
        <Section title="지도 계정">{state.lists.map(list => <div className="row" key={list.id}><p className="sub">{list.provider} 서버 브라우저 로그인됨 (예시)</p><div className="row-actions"><button className="outline" disabled={busy} onClick={() => void mutate({ action: "login", id: list.id }, `${list.provider} 로그인 상태를 갱신했습니다`)}>다시 로그인</button></div></div>)}<p className="row sub">로그인 정보는 사용자별 서버 브라우저에만 보관합니다.</p></Section>
        <Section title="분석"><p className="row sub">작성자 댓글을 먼저 확인합니다.</p><p className="row sub">{commentRule}</p><p className="row sub">장소가 불분명하면 &apos;확인 필요&apos;로 표시합니다.</p></Section>
        <Section title="원본 파일"><p className="row sub">{originalRule}</p></Section>
        <Section title="알림"><div className="row"><Toggle label="확인 필요 항목 알림" checked={values.notifications} onChange={notifications => setDraft({ ...values, notifications })} /></div></Section>
        <Section title="계정 삭제"><div className="row"><button className="outline destructive" onClick={() => setDeleting(true)}>ReelsMap 계정 삭제</button><p className="sub">현재 예시 세션의 데이터만 삭제합니다.</p></div></Section>
      </>}
    </Panel>
    <aside className="inspector material" data-lens="panel"><h2>예시 데이터 설정</h2><div className="group"><p className="row sub">변경 사항은 현재 브라우저의 예시 세션에 반영합니다.</p><p className="row sub">실제 Google 계정, Instagram DM, 외부 지도 목록에는 영향을 주지 않습니다.</p></div></aside>
    {deleting && <Alert title="예시 계정을 삭제할까요?" confirm="예시 계정 삭제" busy={busy} onClose={() => setDeleting(false)} onConfirm={() => void mutate({ action: "account", operation: "delete" }, "예시 계정을 삭제했습니다").then(ok => { if (ok) { setDeleting(false); router.push("/start"); } })}>현재 예시 세션의 게시물과 장소를 삭제합니다.</Alert>}
  </>;
}
