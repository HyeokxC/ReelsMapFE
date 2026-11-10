import type { AppState } from "./types";

export function seed(): AppState {
  return {
    posts: [
      { id: 1, kind: "릴스", handle: "@example_mapo_cafe", title: "연남동 브런치 3곳", status: "저장 전", candidates: [], reason: "", evidence: [
        { source: "작성자 댓글", text: "2층 창가 자리가 좋아요. 월요일 휴무" },
        { source: "영상 00:07", text: "간판" }, { source: "사진 2/5", text: "메뉴판" },
        { source: "캡션", text: "#연남동 #브런치" }, { source: "댓글", text: "주차는 근처 공영주차장" },
      ] },
      { id: 2, kind: "게시물", handle: "@example_busan_walk", title: "영도 바다 산책", status: "저장 전", candidates: [], reason: "", evidence: [
        { source: "작성자 댓글", text: "해안 산책로 끝 건물 2층" }, { source: "사진 1/4", text: "외관" },
      ] },
      { id: 3, kind: "릴스", handle: "@example_tokyo_coffee", title: "기요스미 커피", status: "저장 전", candidates: [], reason: "", evidence: [
        { source: "작성자 댓글", text: "역에서 걸어서 5분, 수요일 휴무" }, { source: "영상 00:04", text: "간판" }, { source: "캡션", text: "#清澄白河" },
      ] },
      { id: 4, kind: "게시물", handle: "@example_lisbon_view", title: "리스본 전망대", status: "확인 필요", evidence: [], candidates: ["예시 전망대 리스본 A", "예시 전망대 리스본 B"], reason: "캡션과 작성자 댓글이 서로 다른 장소를 가리킵니다." },
      { id: 5, kind: "릴스", handle: "@example_jeju_note", title: "", status: "분석 중", evidence: [], candidates: [], reason: "" },
    ],
    places: [
      { id: 1, postId: 1, name: "예시 브런치 연남", area: "서울 마포구 연남동", category: "카페", destination: "네이버 지도", lat: 37.5627, lng: 126.9236, saved: false, tags: ["브런치"] },
      { id: 2, postId: 1, name: "예시 베이커리 망원", area: "서울 마포구 망원동", category: "빵집", destination: "네이버 지도", lat: 37.556, lng: 126.9015, saved: false, tags: [] },
      { id: 3, postId: 1, name: "예시 키친 합정", area: "서울 마포구 합정동", category: "식당", destination: "네이버 지도", lat: 37.5496, lng: 126.9139, saved: false, tags: [] },
      { id: 4, postId: 2, name: "예시 바다 카페 영도", area: "부산 영도구", category: "카페", destination: "네이버 지도", lat: 35.079, lng: 129.045, saved: false, tags: ["바다"] },
      { id: 5, postId: 3, name: "예시 커피 기요스미", area: "일본 도쿄 고토구", category: "커피", destination: "Google 지도", lat: 35.681, lng: 139.799, saved: false, tags: [] },
    ],
    lists: [
      { id: "naver", provider: "네이버", name: "네이버 지도 목록 'ReelsMap 예시'", sync: true, login: true },
      { id: "google", provider: "Google", name: "Google 지도 목록 'ReelsMap 예시'", sync: true, login: true },
    ],
    changes: [{ id: "addition-1", kind: "addition", name: "예시 라멘 성수", deferred: false }, { id: "deletion-1", kind: "deletion", name: "예시 국수 제주", deferred: false }],
    settings: { domestic: "네이버 지도", overseas: "Google 지도", notifications: false, dmLinked: true, signedIn: true },
  };
}
