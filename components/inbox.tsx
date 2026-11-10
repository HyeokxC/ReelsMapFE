"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "./app-provider";
import { Filters, Loading, Panel } from "./ui";
import { Icon, Poi } from "./icons";
import { ListSummary } from "./list-summary";

export function Inbox() {
  const { state, category, query, mutate, busy, focusPlaces } = useApp();
  const [expanded, setExpanded] = useState(1);
  const [selected, setSelected] = useState<number[]>([1, 2, 3]);
  const posts = state?.posts.filter(post => {
    const places = state.places.filter(place => place.postId === post.id);
    return (category === "전체" || places.some(place => place.category === category) || (category === "전망대" && post.id === 4)) && `${post.title} ${post.handle} ${places.map(place => place.name).join(" ")}`.toLowerCase().includes(query.toLowerCase());
  });
  const chosen = state?.places.filter(place => selected.includes(place.id)) ?? [];
  return <>
    <Panel title="받은 게시물" subtitle={<>인스타그램 DM으로 받은 게시물 <span className="slot">공식 계정 이름 확정 전</span></>} footer={<><button className="prominent" disabled={busy || chosen.length === 0} onClick={() => void mutate({ action: "save", places: chosen }, "선택한 장소를 저장했습니다")}>선택한 {chosen.length}곳 저장</button><p className="foot-note">저장 위치: 네이버 지도 목록 &apos;ReelsMap 예시&apos;</p></>}>
      <Filters />
      {!state ? <Loading /> : <ul className="group" data-testid="posts">{posts?.map(post => <li className="cell" key={post.id}>
        <button className="cell-head" aria-expanded={expanded === post.id} onClick={() => { setExpanded(expanded === post.id ? 0 : post.id); focusPlaces(state.places.filter(place => place.postId === post.id)); }}>
          <span className="kind"><Icon name={post.kind === "릴스" ? "film" : "photo"} /></span>
          <span className="cell-main">{post.status === "분석 중" ? <span className="shimmer" aria-hidden="true" /> : <span className="title">{post.title}</span>}<span className="sub">{post.kind} {post.handle}</span></span>
          <span className={`state ${post.status === "확인 필요" ? "warn" : post.status === "저장됨 (예시)" ? "on" : ""}`}>{post.status}</span><span className="chev"><Icon name={expanded === post.id ? "chevdown" : "chevron"} small /></span>
        </button>
        {expanded === post.id && <div className="detail">
          <ul className="places">{state.places.filter(place => place.postId === post.id).map(place => <li key={place.id}><label className="place"><input type="checkbox" checked={selected.includes(place.id)} onChange={event => setSelected(event.target.checked ? [...selected, place.id] : selected.filter(id => id !== place.id))} /><Poi category={place.category} /><span className="ptext"><span className="pname">{place.name}</span><span className="sub">{place.saved ? "저장됨 (예시)" : place.area}</span></span></label><button className="ghost-icon" aria-label={`${place.name} 지도에서 보기`} onClick={() => focusPlaces([place])}><Icon name="location" small /></button></li>)}</ul>
          {post.evidence[0] && <div className="quote"><Icon name="quote" small /><div><span className="qlabel">작성자 댓글 우선</span><p>{post.evidence[0].text}</p></div></div>}
          {post.reason && <p className="sub">{post.reason}</p>}
          {post.status === "분석 중" && <Loading />}
          <div className="evs">{post.evidence.slice(1, 4).map(evidence => <span className="ev" key={evidence.source}>{evidence.source}</span>)}<Link className="textlink" href={`/inbox/${post.id}`}>분석 근거 <Icon name="chevron" small /></Link></div>
        </div>}
      </li>)}{posts?.length === 0 && <li className="empty">일치하는 게시물이 없습니다.</li>}</ul>}
    </Panel>
    <ListSummary />
  </>;
}
