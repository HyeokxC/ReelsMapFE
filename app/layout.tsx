import type { Metadata } from "next";
import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "./tokens.css";
import "./globals.css";
import { Shell } from "@/components/shell";

export const metadata: Metadata = { title: "ReelsMap | 예시 데이터", description: "인스타그램 게시물의 장소를 지도에 정리하는 ReelsMap 프론트엔드 예시" };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="ko"><body><Shell>{children}</Shell></body></html>; }
