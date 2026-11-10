# ReelsMap 프론트엔드

Next.js 16 App Router, React, TypeScript, MapLibre GL 4로 만든 예시 앱입니다.

## 실행

```sh
bun install
bun run dev
```

주소: http://127.0.0.1:4330

```sh
bun run lint
bunx tsc --noEmit
bun run build
node qa/smoke.mjs
```

QA는 로컬 Chrome과 `/Users/hyeokx/git/claude.design-mcp/node_modules/playwright-core/index.mjs`를 사용합니다. 결과는 `qa/result.json`, 화면은 `qa/shots/`에 저장합니다.

## 구조

- `app/`: `/inbox`, `/inbox/[id]`, `/places`, `/lists`, `/settings`, `/start`. `/`는 `/inbox`로 이동합니다.
- `components/`: 지속되는 지도와 글래스 셸, 화면별 React 컴포넌트.
- `app/tokens.css`, `app/globals.css`: 원본 iOS 스타일의 OKLCH 토큰과 반응형 레이아웃.
- `lib/lens.ts`, `lib/lens-shaders.ts`: 지도 캔버스를 샘플링하는 WebGL2 굴절. 패널과 버튼에 서로 다른 매개변수를 적용합니다. WebGL2 미지원 또는 투명도 줄이기에서는 CSS로 대체합니다.
- `lib/fixture.ts`, `lib/store.ts`, `lib/types.ts`, `lib/client.ts`: 예시 데이터, 메모리 저장소, 요청 검증과 공용 타입, API 클라이언트.
- `app/api/[...path]/route.ts`: GET `state`, `posts`, `places`, `lists`, `changes`, `settings`. POST `save`, `candidate`, `deletion`, `sync`, `login`, `tag`, `settings`, `account`.

## 예시 범위

장소 저장, 후보 선택, 삭제 확인, 태그, 동기화 스위치, 설정은 실제 API 요청으로 현재 예시 세션에 반영됩니다. 브라우저 세션 쿠키로 데이터를 분리하고 새로고침 후에도 유지합니다. 서버 재시작 시 메모리 데이터가 초기화됩니다.

Google OAuth, Instagram DM, AI 분석, 서버 브라우저 로그인, 네이버/Google 지도 쓰기는 실행하지 않습니다. 원본 게시물과 공식 계정도 실존하지 않으므로 관련 버튼은 예시 안내를 표시합니다. 제주 항목은 의도적으로 분석 중 상태를 유지합니다. 클립보드 복사는 브라우저 API를 실제로 사용합니다.

배경은 실제 OpenStreetMap 공개 래스터 타일이며 네트워크 연결이 필요합니다. 계정 연결과 장소 핀은 예시입니다. WebGL2 지원 환경에서 글래스 렌즈가 활성화됩니다.
