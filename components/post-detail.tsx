"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "./app-provider";
import { Loading, Panel, Section } from "./ui";
import { Icon, Poi } from "./icons";
import { categories, categorySchema, destinationSchema } from "@/lib/types";
import type { Place } from "@/lib/types";

export const commentRule = "댓글은 처음 50개와 답글을 먼저 보고, 장소를 찾지 못하면 200개까지 확인합니다.";
export const originalRule = "분석이 끝나면 사진과 영상 파일을 삭제하고 게시물 링크와 장소 정보만 보관합니다.";

export function CandidateChoice() {
  const { state, mutate, busy } = useApp();
  const [choice, setChoice] = useState<"A" | "B" | null>(null);
  const post = state?.posts.find(post => post.id === 4);
  if (!post?.candidates.length) return null;
  return <Section title="확인 필요"><div className="row"><p className="sub">{post.reason}</p><fieldset className="candidate-field"><legend className="sub">포르투갈 리스본, 전망대</legend>{(["A", "B"] as const).map(value => <label className="candidate" key={value}><input type="radio" name="lisbon" checked={choice === value} onChange={() => setChoice(value)} />예시 전망대 리스본 {value}</label>)}</fieldset><button className="prominent" disabled={!choice || busy} onClick={() => { if (choice) void mutate({ action: "candidate", postId: 4, choice }, "선택한 장소를 저장했습니다"); }}>선택한 장소 저장</button><p className="sub">저장 위치: Google 지도</p></div></Section>;
}

export function PostDetail({ id }: { id: number }) {
  const { state, mutate, busy, focusPlaces, notify } = useApp();
  const [edits, setEdits] = useState<Record<number, Place>>({});
  const post = state?.posts.find(item => item.id === id);
  const places = state?.places.filter(place => place.postId === id).map(place => ({ ...place, category: edits[place.id]?.category ?? place.category, destination: edits[place.id]?.destination ?? place.destination })) ?? [];
  const fields = <>{places.map(place => <div className="row" key={place.id}><div className="row-line"><Poi category={place.category} /><strong className="title">{place.name}</strong><button className="ghost-icon" aria-label={`${place.name} 지도에서 보기`} onClick={() => focusPlaces([place])}><Icon name="location" small /></button></div><p className="sub">{place.area}</p><div className="field-row"><label>카테고리<select value={place.category} onChange={event => setEdits({ ...edits, [place.id]: { ...place, category: categorySchema.parse(event.target.value) } })}>{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>저장 위치<select value={place.destination} onChange={event => setEdits({ ...edits, [place.id]: { ...place, destination: destinationSchema.parse(event.target.value) } })}><option>네이버 지도</option><option>Google 지도</option></select></label></div><span className={`state ${place.saved ? "on" : ""}`}>{place.saved ? "저장됨 (예시)" : "저장 전"}</span></div>)}</>;
  return <>
    <Panel title="분석 근거" subtitle={<>{post?.title}<span className="sub">{post?.kind} {post?.handle}</span></>} footer={places.length > 0 ? <button className="prominent" disabled={busy} onClick={() => void mutate({ action: "save", places }, "선택한 장소를 저장했습니다")}>선택한 {places.length}곳 저장</button> : undefined}>
      <Link href="/inbox" className="textlink back"><Icon name="back" small />받은 게시물</Link>
      {!state ? <Loading /> : !post ? <p className="empty">게시물을 찾을 수 없습니다.</p> : post.status === "분석 중" ? <Section title="분석 중"><Loading /><p className="row sub">예시 분석 대기 상태입니다. 실제 분석은 실행하지 않습니다.</p></Section> : <>
        {post.evidence.length > 0 && <><ol className="group" aria-label="분석 근거 순서">{post.evidence.map(evidence => <li className="evidence-row" key={evidence.source}><strong className="qlabel">{evidence.source}{evidence.source === "작성자 댓글" ? " 우선" : ""}</strong><p>{evidence.text}</p></li>)}</ol><p className="share">{commentRule}</p></>}
        {post.candidates.length > 0 && <CandidateChoice />}
        {places.length > 0 && <Section title="찾은 장소"><div>{fields}</div></Section>}
        <button className="textlink" onClick={() => notify("원본 링크는 예시 데이터이며 실제 Instagram 게시물이 없습니다. (예시)")}>Instagram에서 원본 보기 (예시)</button>
        <p className="share">{originalRule}</p>
      </>}
    </Panel>
    <aside className="inspector material" data-lens="panel"><h2>찾은 장소</h2><div className="group">{places.length ? places.map(place => <div className="row" key={place.id}><div className="row-line"><Poi category={place.category} /><strong className="title">{place.name}</strong></div><p className="sub">{place.area}</p><p className="sub">{place.category} / {place.destination}</p><span className="state">{place.saved ? "저장됨 (예시)" : "저장 전"}</span></div>) : <p className="empty">{post?.status === "분석 중" ? "분석 중" : "후보를 선택해 주세요."}</p>}</div><p className="share">{originalRule}</p></aside>
  </>;
}
