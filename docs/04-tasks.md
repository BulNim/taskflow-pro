# 04-tasks - 구현 순서

MVP 를 3개 Phase 로 진행한다.

- **Phase 1 (설계)**: CLAUDE.md + docs/ 6종 작성 - 지금 완료
- **Phase 2 (백엔드)**: `backend/` FastAPI > CRUD API 5개 > Swagger 확인
- **Phase 3 (프론트)**: `frontend/` HTML+JS+Tailwind > 메인 화면 > API 연결 > git push

진행 규칙: 순서대로만, 병렬 금지, 단계별 검증 필수.
`backend 진행해` = Phase 2 전체, `frontend 진행해` = Phase 3 전체.
확장 단계는 본 문서에 포함하지 않는다.

## Phase 1 (설계) - 10단계

| # | 단계 | 검증 방법 | 완료 |
|---|---|---|---|
| 1 | CLAUDE.md 작성 | 4개 섹션(역할·스택·시작 전 절차·절대규칙 6개)이 모두 있는가 | [x] |
| 2 | 00-overview | 매핑표 6행과 읽는 순서가 있는가 | [x] |
| 3 | 01-product | 목표·페르소나·MVP 범위·성공 기준이 있는가 | [x] |
| 4 | 02-specs | 필드 7개, API 5개, 화면 표 4개가 있는가 | [x] |
| 5 | 03-design | 8행 표와 4개 열, 의존성 정책이 있는가 | [x] |
| 6 | 04-tasks | Phase 3개와 체크리스트가 있는가 | [x] |
| 7 | 05-conventions | 금지 5개, 테스트 매트릭스, 커밋 규칙이 있는가 | [x] |
| 8 | docs 6종 상호 모순 점검 | 필드명·상태값·에러코드·경로가 문서 간 일치하는가 | [x] |
| 9 | git init 과 로컬 설정 | `git config user.name` / `user.email` 출력 확인 | [x] |
| 10 | 첫 커밋 | `git log --oneline` 에 커밋 1건 | [x] |

## Phase 2 (백엔드) - 10단계

| # | 단계 | 검증 방법 | 완료 |
|---|---|---|---|
| 1 | backend 폴더와 가상환경 | `backend/.venv` 생성, 활성화 확인 | [x] |
| 2 | 의존성 설치 (fastapi / uvicorn / sqlalchemy / pytest / httpx - httpx 는 TestClient 구동에 필요하므로 03-design 정책에 따라 미리 승인) | `pip list` 에 5개 모두 | [x] |
| 3 | SQLAlchemy 모델 | 필드 7개가 02-specs 순서·타입과 일치 | [x] |
| 4 | Pydantic 스키마 extra=forbid | 스펙 외 필드 요청이 422 | [x] |
| 5 | DB 초기화 | `tasks` 테이블 생성 확인 | [x] |
| 6 | POST 와 GET 목록 | 201 / 200, 목록에 description 없음 | [x] |
| 7 | GET 단건 | 200, description 포함 | [x] |
| 8 | PUT 과 DELETE | 200 / 204 | [x] |
| 9 | pytest 정상·400·404 | `pytest` 전건 통과 | [x] |
| 10 | Swagger 확인 | `http://127.0.0.1:8000/docs` 에 엔드포인트 5개 | [x] |

## Phase 3 (프론트) - 8단계

| # | 단계 | 검증 방법 | 완료 |
|---|---|---|---|
| 1 | frontend 폴더와 index.html | `http://127.0.0.1:8000/` 에서 화면이 뜸 | [ ] |
| 2 | Tailwind CDN 과 테마 토글 | 토글 후 새로고침해도 유지 | [ ] |
| 3 | 목록 카드 렌더 | 배지와 D-N HH:MM 표시 | [ ] |
| 4 | 추가 폼 | 제출 시 목록에 추가됨 | [ ] |
| 5 | 수정 모달 단건 조회 후 전 필드 | 모달에 전 필드가 채워지고 PUT 200 | [ ] |
| 6 | 삭제 확인 | 확인 후 204, 목록에서 사라짐 | [ ] |
| 7 | 360px 반응형 | 개발자도구 폭 360px 에서 안 깨짐 | [ ] |
| 8 | API p95 200ms 측정 | `GET /api/tasks` 와 `GET /api/tasks/{id}` 를 각각 50회 호출해 p95 측정 | [ ] |

Phase 이름과 개수는 위 3개 그대로 고정한다. 변경하지 않는다.
