"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "./app-provider";
import { categories } from "@/lib/types";
import type { Place } from "@/lib/types";
import { Icon, Poi } from "./icons";
import { Loading, Panel, Section } from "./ui";
import { CandidateChoice } from "./post-detail";

function PlaceRow({ place }: { place: Place }) {
  const { state, mutate, busy, focusPlaces } = useApp();
  const [adding, setAdding] = useState(false), [tag, setTag] = useState("");
  const post = state?.posts.find(post => post.id === place.postId);
  return <article className="row"><div className="row-line"><Poi category={place.category} /><strong className="title">{place.name}</strong><button className="ghost-icon" aria-label={`${place.name} 지도에서 보기`} onClick={() => focusPlaces([place])}><Icon name="location" small /></button></div><p className="sub">{place.area}</p><p className="sub">{place.destination}{place.saved ? ", 저장됨 (예시)" : ""}</p><div className="tags">{place.tags.map(tag => <span className="tag" key={tag}>#{tag}</span>)}<button className="textlink" onClick={() => setAdding(!adding)}>태그 추가</button></div>{adding && <form className="tag-form" onSubmit={event => { event.preventDefault(); if (tag.trim()) void mutate({ action: "tag", id: place.id, tag: tag.trim() }, "태그를 추가했습니다").then(ok => { if (ok) { setTag(""); setAdding(false); } }); }}><input type="text" autoFocus aria-label={`${place.name} 새 태그`} maxLength={30} value={tag} onChange={event => setTag(event.target.value)} placeholder="태그 이름" /><button className="tinted" disabled={busy || !tag.trim()}>추가</button></form>}<Link className="textlink" href={`/inbox/${place.postId}`}>{post?.kind} {post?.handle} <Icon name="chevron" small /></Link></article>;
}

export function Places() {
  const { state, category, setCategory, query, focusPlaces } = useApp();
  useEffect(() => { setCategory("카페"); }, [setCategory]);
  const selectedCategory = category === "전체" ? "카페" : category;
  const visible = state?.places.filter(place => place.category === selectedCategory && `${place.name} ${place.area} ${place.tags.join(" ")}`.includes(query)) ?? [];
  return <>
    <Panel title="장소" subtitle="카테고리별로 모아 둔 장소">
      <div className="folder-rail" role="group" aria-label="장소 카테고리">{categories.map(item => { const places = state?.places.filter(place => place.category === item) ?? []; return <button className="folder" key={item} aria-pressed={item === selectedCategory} onClick={() => { setCategory(item); focusPlaces(places); }}><Poi category={item} /><strong>{item}</strong><span>{item === "전망대" && !places.length ? "확인 필요" : `${places.length}곳`}</span></button>; })}</div>
      {!state ? <Loading /> : <><Section title={`${selectedCategory} ${visible.length}곳`}>{visible.length ? visible.map(place => <PlaceRow key={place.id} place={place} />) : <p className="empty">{selectedCategory === "전망대" ? "아래 후보를 확인해 주세요." : "일치하는 장소가 없습니다."}</p>}</Section><CandidateChoice /></>}
    </Panel>
    <aside className="inspector material" data-lens="panel"><h2>{selectedCategory} {visible.length}곳</h2><div className="group">{visible.map(place => <div className="row" key={place.id}><strong className="title">{place.name}</strong><p className="sub">{place.area}</p><p className="sub">{place.destination}</p><button className="textlink" onClick={() => focusPlaces([place])}>지도에서 보기 <Icon name="location" small /></button></div>)}</div><p className="share">지도에는 선택한 카테고리의 장소만 표시합니다.</p></aside>
  </>;
}
