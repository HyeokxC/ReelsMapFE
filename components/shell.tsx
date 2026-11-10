"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppProvider, useApp } from "./app-provider";
import { Icon } from "./icons";
import { MapSurface } from "./map";

const tabs = [{ href: "/inbox", text: "받은 게시물", icon: "tray" }, { href: "/places", text: "장소", icon: "mappin" }, { href: "/lists", text: "외부 지도 목록", icon: "list" }, { href: "/settings", text: "설정", icon: "gear" }] as const;

function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { query, setQuery, error, notice, notify, reload } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => { notify(""); }, [pathname, notify]);
  return <div id="app-shell" data-screen={pathname === "/start" ? "start" : "app"}>
    <MapSurface />
    <nav className="tabbar glass" data-lens="control" aria-label="주 메뉴">{tabs.map(tab => <Link className="tab" key={tab.href} href={tab.href} aria-current={pathname.startsWith(tab.href) ? "page" : undefined}><Icon name={tab.icon} /><span>{tab.text}</span></Link>)}</nav>
    <button className="circle glass search-btn" data-lens="control" aria-label="장소 또는 게시물 검색" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Icon name={searchOpen ? "close" : "search"} /></button>
    <Link className="circle glass avatar" data-lens="control" href="/start" aria-label="예시 사용자, 시작하기"><span>예</span></Link>
    {searchOpen && <form className="search-field material" data-lens="panel" role="search" onSubmit={event => event.preventDefault()}><Icon name="search" /><input autoFocus aria-label="검색어" placeholder="장소 또는 게시물 검색" value={query} onChange={event => setQuery(event.target.value)} /><button className="textlink" onClick={() => setQuery("")} type="button">지우기</button></form>}
    <main>{children}</main>
    <p className="note glass">디자인 예시 데이터: 실제 계정, DM, 지도와 연결되지 않음</p>
    {notice && <div className="toast material" role="status"><span>{notice}</span><button aria-label="알림 닫기" onClick={() => notify("")}><Icon name="close" small /></button></div>}
    {error && <div className="toast error material" role="alert"><span>{error}</span><button className="textlink" onClick={reload}>다시 시도</button></div>}
  </div>;
}
export function Shell({ children }: { children: ReactNode }) { return <AppProvider><Chrome>{children}</Chrome></AppProvider>; }
