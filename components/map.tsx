"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import { createLens } from "@/lib/lens";
import { useApp } from "./app-provider";
import { Icon, paths, categoryIcons } from "./icons";

export function MapSurface() {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const { mapRef, state, category, query, focusPlaces } = useApp();
  const framed = useRef("");
  const [ready, setReady] = useState(false), [style, setStyle] = useState("osm"), [mapError, setMapError] = useState(false);
  const pathname = usePathname(), router = useRouter();
  useEffect(() => {
    if (!host.current || !canvas.current) return;
    const map = new maplibregl.Map({
      container: host.current,
      style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
      center: [126.913, 37.5565], zoom: 13.4, preserveDrawingBuffer: true, attributionControl: { compact: false },
    });
    mapRef.current = map;
    document.body.dataset.mapReady = "false";
    map.on("error", () => setMapError(true));
    map.once("load", () => setReady(true));
    map.on("movestart", () => { document.body.dataset.mapReady = "false"; });
    map.on("sourcedataloading", () => { document.body.dataset.mapReady = "false"; });
    map.on("idle", () => { document.body.dataset.mapReady = "true"; });
    const reduced = matchMedia("(prefers-reduced-transparency: reduce)");
    let lens: ReturnType<typeof createLens> = null;
    const draw = () => lens?.draw();
    const configure = () => {
      lens?.destroy();
      lens = !reduced.matches && canvas.current ? createLens(canvas.current, map.getCanvas()) : null;
      document.body.classList.toggle("lens-on", Boolean(lens));
      document.body.dataset.lensStatus = lens ? "active" : "fallback";
      if (!lens && canvas.current) { canvas.current.width = 0; canvas.current.height = 0; }
      map.triggerRepaint();
    };
    configure();
    map.on("render", draw);
    reduced.addEventListener("change", configure);
    const resize = new ResizeObserver(draw);
    const observe = () => { resize.disconnect(); document.querySelectorAll("[data-lens]").forEach(element => resize.observe(element)); draw(); };
    const mutation = new MutationObserver(observe);
    mutation.observe(document.getElementById("app-shell") ?? document.body, { childList: true, subtree: true });
    observe();
    window.addEventListener("resize", draw);
    document.addEventListener("scroll", draw, true);
    return () => { mutation.disconnect(); resize.disconnect(); reduced.removeEventListener("change", configure); window.removeEventListener("resize", draw); document.removeEventListener("scroll", draw, true); map.off("render", draw); lens?.destroy(); map.remove(); mapRef.current = null; document.body.classList.remove("lens-on"); };
  }, [mapRef]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const light = style === "light";
    map.setPaintProperty("osm", "raster-saturation", light ? -0.65 : 0);
    map.setPaintProperty("osm", "raster-contrast", light ? -0.12 : 0);
    map.setPaintProperty("osm", "raster-brightness-min", light ? 0.06 : 0);
  }, [mapRef, ready, style]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !state) return;
    const markers = state.places.filter(place => (category === "전체" || place.category === category) && `${place.name} ${place.area}`.includes(query)).map(place => {
      const category = categoryIcons[place.category];
      const button = document.createElement("button");
      button.type = "button"; button.className = "poi-wrap"; button.setAttribute("aria-label", `${place.name} 분석 근거`);
      const pin = document.createElement("span"); pin.className = `poi ${category.className}`;
      pin.innerHTML = `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[category.icon]}"/></svg>`;
      const label = document.createElement("span"); label.className = "poi-label"; label.textContent = place.name;
      button.append(pin, label); button.onclick = () => router.push(`/inbox/${place.postId}`);
      return new maplibregl.Marker({ element: button }).setLngLat([place.lng, place.lat]).addTo(map);
    });
    map.triggerRepaint();
    return () => markers.forEach(marker => marker.remove());
  }, [state, category, query, mapRef, router]);
  useEffect(() => {
    mapRef.current?.triggerRepaint();
    if (!ready || !state || framed.current === pathname) return;
    framed.current = pathname;
    const postId = pathname.startsWith("/inbox/") ? Number(pathname.split("/")[2]) : 1;
    focusPlaces(state.places.filter(place => place.postId === postId));
  }, [pathname, mapRef, ready, state, focusPlaces]);
  return <>
    <div id="map" ref={host} aria-label="OpenStreetMap 지도" />
    <canvas id="lens" ref={canvas} aria-hidden="true" />
    <div className="mapctl">
      <div className="vcap glass" data-lens="control"><button aria-label="확대" onClick={() => mapRef.current?.zoomIn()}><Icon name="plus" /></button><button aria-label="축소" onClick={() => mapRef.current?.zoomOut()}><Icon name="minus" /></button></div>
      <button className="loc glass" data-lens="control" aria-label="처음 위치" onClick={() => mapRef.current?.jumpTo({ center: [126.913, 37.5565], zoom: 13.4 })}><Icon name="location" /></button>
    </div>
    <div className="segmented glass" data-lens="control" role="radiogroup" aria-label="지도 스타일">
      <button role="radio" aria-checked={style === "osm"} onClick={() => setStyle("osm")}>OSM 기본</button><button role="radio" aria-checked={style === "light"} onClick={() => setStyle("light")}>밝은 OSM</button>
    </div>
    {mapError && <p className="map-error material" role="status">지도 타일을 불러오지 못했습니다. 네트워크를 확인해 주세요.</p>}
  </>;
}
