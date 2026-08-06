# 04-tasks.md

MVP는 아래 3개 Phase로 진행한다. Phase 이름과 개수는 고정이며 변경하지 않는다.

- Phase 1 (설계): `CLAUDE.md` + `docs/` 6종 작성
- Phase 2 (백엔드): `backend/` FastAPI → CRUD API 5개 → Swagger 확인
- Phase 3 (프론트): `frontend/` HTML+JS+Tailwind → 메인 화면 → API 연결 → git push

## 진행 규칙

- 순서대로만 진행한다. Phase를 건너뛰거나 앞당기지 않는다.
- Phase 내부 단계도 순서대로 진행한다. 병렬 진행 금지.
- 각 단계는 '검증 방법'을 통과해야 다음 단계로 넘어간다.
- `backend 진행해` = Phase 2 전체 실행을 의미한다.
- `frontend 진행해` = Phase 3 전체 실행을 의미한다.
- 확장 단계(JWT 로그인, 팀, Kanban, 채팅, CI/CD 등)는 본 문서에 포함하지 않는다.

## Phase 1 - 설계 (완료)

| # | 단계 | 검증 방법 |
|---|---|---|
| 1 | CLAUDE.md 작성 (역할/스택/절차/절대규칙 4개 섹션) | CLAUDE.md 파일에 4개 섹션이 모두 존재하는지 눈으로 확인 |
| 2 | docs/ 폴더 생성 | `docs/` 디렉토리 존재 확인 |
| 3 | docs/00-overview.md 작성 | 파일 내용에 매핑표·읽는 순서·분리 근거 포함 확인 |
| 4 | docs/01-product.md ~ 05-conventions.md 빈 파일 생성 | `docs/` 안에 6개 파일명이 정확히 존재하는지 확인 |
| 5 | CLAUDE.md의 docs 파일명·순서와 실제 파일 일치 확인 | 두 목록을 나란히 비교해 불일치 없음 확인 |
| 6 | docs/01-product.md 작성 (목표/페르소나/MVP 범위/UI 톤/확장/범위 외/성공 기준) | 각 항목이 파일에 모두 존재하는지 확인 |
| 7 | docs/02-specs.md 작성 (Task 모델 7필드/검증 규칙/API 5개/화면 명세 4개) | 필드 순서·타입, API 경로, 화면 표 4개 존재 확인 |
| 8 | docs/03-design.md 작성 (8행 표: 선택/대안/근거/트레이드오프) | 표 행 수가 8개, 열이 4개인지 확인 |
| 9 | docs/04-tasks.md 작성 (본 문서) | Phase 3개, 체크리스트·검증 방법 표 존재 확인 |
| 10 | docs/05-conventions.md 작성 대기 (다음 요청에서 진행) | Phase 1 완료 여부는 05-conventions.md 작성 완료 시점에 최종 확정 |

## Phase 2 - 백엔드

| # | 단계 | 검증 방법 |
|---|---|---|
| 1 | backend/ 폴더 및 Python 3.11 가상환경 구성 | `backend/` 디렉토리 생성 확인, 가상환경 활성화 확인 |
| 2 | FastAPI, uvicorn, SQLAlchemy 등 필요 패키지 설치 (03-design.md 의존성 정책 준수) | `pip list`로 설치된 패키지 확인, 03-design.md에 사유 기재 여부 확인 |
| 3 | SQLite DB 연결 및 SQLAlchemy 세션 설정 | 앱 기동 시 DB 파일 생성 확인 |
| 4 | Task 모델 정의 (02-specs.md 7필드, 순서·타입 그대로) | 모델 필드명·타입·기본값이 02-specs.md와 일치하는지 대조 |
| 5 | Pydantic 스키마 정의 (요청/응답, 스펙 외 필드 422 거부 포함) | 스펙에 없는 필드로 요청 시 422 응답 확인 |
| 6 | POST /api/tasks 구현 (201, status 생략 시 todo 기본값) | Swagger에서 실행 후 201 응답 및 기본값 todo 확인 |
| 7 | GET /api/tasks, GET /api/tasks/{id} 구현 (목록은 description 제외, 단건은 포함) | Swagger 응답 바디에서 필드 포함 여부 확인 |
| 8 | PUT /api/tasks/{id}, DELETE /api/tasks/{id} 구현 (200/204, 없는 id는 404) | Swagger에서 존재/비존재 id로 각각 호출해 상태 코드 확인 |
| 9 | 검증 로직 점검 (title/status/due_at 형식 위반 400, due_at ISO 8601) | 잘못된 형식으로 요청 시 400 응답 확인 |
| 10 | pytest로 CRUD 5개 API 테스트 작성 및 전체 통과 확인, Swagger UI 최종 확인 | `pytest` 실행 결과 전부 통과, `/docs` 접속해 5개 엔드포인트 노출 확인 |

## Phase 3 - 프론트

| # | 단계 | 검증 방법 |
|---|---|---|
| 1 | frontend/ 폴더 생성, index.html·app.js 2개 파일만 생성 | `frontend/` 안에 파일 2개만 존재하는지 확인 |
| 2 | index.html에 Tailwind CDN, 시스템 폰트, 기본 레이아웃 구성 | 브라우저에서 페이지 로드 및 스타일 적용 확인 |
| 3 | 추가 폼 UI 구현 (title/due_at/status) 및 POST 연동 | 폼 제출 시 목록에 새 카드 반영 확인 |
| 4 | 목록 카드 UI 구현 (status 배지 + D-N HH:MM) 및 GET 연동 (3초 폴링) | 3초 간격으로 목록이 갱신되는지 확인 |
| 5 | 수정 모달 구현 (카드 클릭 → 전 필드 수정) 및 PUT 연동 | 모달에서 값 변경 후 저장 시 카드 내용 갱신 확인 |
| 6 | 삭제 기능 구현 (휴지통 → 확인 → DELETE) | 확인 후 카드가 목록에서 사라지는지 확인 |
| 7 | 라이트/다크 테마 토글 (localStorage, prefers-color-scheme 초기값) 및 360px 반응형 점검 | 새로고침 후 테마 유지 확인, 360px 너비에서 레이아웃 확인 |
| 8 | git add/commit/push로 GitHub(origin) 반영 | `git log`, `git push` 결과 및 GitHub 저장소에서 커밋 확인 |
