# TaskFlow Pro

팀 업무 관리 풀스택 웹 앱. 팀 업무를 시각화해 **'지금 누가 뭐 해?'** 라는 질문이 사라지게 하는 것이 목표다.

> 이 문서는 `docs/` 의 요약본이다. 내용이 어긋나면 `docs/` 가 기준이다.

## 기술 스택

| 영역 | 스택 |
|---|---|
| 백엔드 `backend/` | FastAPI + Python 3.11 이상 + SQLite (SQLAlchemy ORM) |
| 프론트 `frontend/` | Vanilla JS + Tailwind CDN, `index.html` 과 `app.js` 2개 파일 |
| API 경로 | 모든 API 경로는 `/api/` 접두사 |
| 테스트 | pytest |

프론트는 FastAPI 가 StaticFiles 로 **같은 오리진**에서 제공한다. `file://` 로 직접 열지 않는다.
API 호출은 상대경로 `fetch('/api/...')` 로 고정한다.

## 실행 방법

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pytest httpx
uvicorn main:app --reload --port 8000
```

| 주소 | 내용 |
|---|---|
| `http://127.0.0.1:8000/` | 앱 화면 |
| `http://127.0.0.1:8000/docs` | Swagger |

테스트는 `backend/` 에서 `pytest` 로 실행한다.

## REST API

| 메서드 | 경로 | 성공 코드 | 설명 |
|---|---|---|---|
| POST | `/api/tasks` | 201 | 생성 |
| GET | `/api/tasks` | 200 | 목록 |
| GET | `/api/tasks/{id}` | 200 | 단건 |
| PUT | `/api/tasks/{id}` | 200 | 수정 (전 필드 전송) |
| DELETE | `/api/tasks/{id}` | 204 | 삭제 |

목록 응답에는 `description` 이 없고, 단건 응답에는 있다.

### Task 필드 7개

`id` / `title` (필수, 200자) / `description` / `status` (`todo` · `in_progress` · `done`, 기본값 `todo`) /
`due_at` (UTC) / `created_at` / `updated_at` (뒤 둘은 서버 자동)

### 검증 규칙

| 상황 | 응답 |
|---|---|
| 스펙에 없는 필드 | 422 |
| `title` / `status` / `due_at` 형식 위반 | 400 |
| 없는 `id` | 404 |

`due_at` 은 ISO 8601 이며 서버에 UTC 로 저장한다.
프론트가 보낼 때 로컬에서 UTC 로, 보일 때 UTC 에서 로컬로 변환한다.

## 기능 (MVP)

- CRUD 4종을 모두 화면에서 수행 - 추가 / 목록 / 수정 / 삭제
- 상태 배지와 마감 표시 - `D-N HH:MM`, 오늘은 `D-DAY`, 지난 마감은 `D+N`, 없으면 `마감 없음`
- 라이트/다크 테마 토글 (`localStorage('theme')`, 초기값은 `prefers-color-scheme`)
- 모바일 반응형 (360px)
- 목록 갱신은 폴링 3초 (WebSocket 은 확장 단계로 보류)

### 범위 외

외부결제, 네이티브앱, WebRTC, 외부캘린더, 파일업로드

## 문서

`docs/` 를 아래 순서로 읽는다.

| 파일 | 역할 |
|---|---|
| `00-overview.md` | 문서 지도 |
| `01-product.md` | WHY - 목표·페르소나·MVP 범위·성공 기준 |
| `02-specs.md` | WHAT - 모델·검증·API·화면 명세 |
| `03-design.md` | HOW - 기술 선택과 근거, 의존성 추가 정책 |
| `04-tasks.md` | 구현 순서 - Phase 별 체크리스트 |
| `05-conventions.md` | 규칙 - 명명·금지 사항·테스트 매트릭스·커밋 규칙 |

프로젝트 규칙과 절대규칙 6개는 `CLAUDE.md` 에 있다.
새 라이브러리는 `03-design.md` 에 사유를 적기 전에는 도입하지 않는다.

## 커밋 규칙

`feat` / `fix` / `docs` / `refactor` / `test` / `chore` + 한국어 요약
