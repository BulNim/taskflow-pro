# 03-design - HOW

## 기술 선택 표

| # | 선택 | 대안 | 근거 | 트레이드오프 |
|---|---|---|---|---|
| 1 | 백엔드 - FastAPI | Django, Express | 타입 힌트 기반 검증과 Swagger 자동 생성. 소규모 CRUD 에 군더더기 없음 | Django 만큼의 기본 제공 관리자·인증이 없어 직접 붙여야 함 |
| 2 | 프론트 - Vanilla JS + Tailwind CDN. **API 호출은 상대경로 `fetch('/api/...')` 고정, 절대경로 금지. 프론트는 FastAPI 가 StaticFiles 로 같은 오리진에서 제공. 마운트 경로는 실행 위치에 흔들리지 않게 루트 기준으로 해석 — `FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"`, `app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True))`. 마운트는 라우터 정의 뒤 맨 마지막. `file://` 로 직접 열지 않음. `frontend/` 가 아직 없는 단계에서는 마운트를 건너뛴다 — `if FRONTEND_DIR.is_dir():` 로 감쌀 것** | React, Vue | 빌드 도구 없이 두 파일로 끝남. 같은 오리진이라 CORS 설정이 필요 없음 | 컴포넌트 재사용·상태 관리 도구가 없어 규모가 커지면 손이 많이 감 |
| 3 | DB - SQLite (SQLAlchemy ORM, 추후 PostgreSQL 전환 고려) | PostgreSQL 즉시 도입 | 파일 하나로 시작. ORM 을 쓰므로 전환 비용이 낮음 | 동시 쓰기와 규모 확장에 한계 |
| 4 | CSS - Tailwind만. styled-components 금지 | styled-components, 순수 CSS | 클래스만으로 일관된 톤 유지. 빌드 불필요 | 마크업이 길어지고 클래스 문자열 가독성이 떨어짐 |
| 5 | 실시간 - MVP 는 폴링 3초. WebSocket 은 확장 단계 보류 | WebSocket 즉시 도입 | 구현·운영이 단순하고 MVP 검증에 충분 | 지연 최대 3초, 불필요한 요청 발생 |
| 6 | 상태관리 - 모듈 변수 + DOM 직접 갱신 | Redux, Zustand, 프레임워크 상태 | 의존성 0, 화면 수가 적어 추적 가능 | 화면이 늘면 갱신 누락이 생기기 쉬움 |
| 7 | 디자인 시스템 - Mac OS UI 톤. **토큰: `rounded-xl`, `shadow-lg`, `backdrop-blur`, 시스템 폰트** | Material, Ant | 목표 사용자에게 친숙하고 Tailwind 유틸리티로 바로 표현됨 | 정식 디자인 시스템의 컴포넌트 규격이 없어 일관성은 사람이 지켜야 함 |
| 8 | 테마 - 라이트/다크 토글, `localStorage('theme')`, 초기값 `prefers-color-scheme` | 라이트 전용, 시스템 설정 추종만 | 사용자가 선택할 수 있고 새로고침해도 유지됨 | 두 벌의 색을 모든 화면에서 관리해야 함 |

## 의존성 추가 정책

이 문서에 사유를 적기 전에는 어떤 라이브러리도 도입할 수 없다.

### 사전 승인 목록

| 패키지 | 사유 |
|---|---|
| `httpx` | pytest TestClient 구동에 필요 |

설치 중 다른 패키지를 권하는 경고가 떠도, 이 목록에 없는 것은 추가하지 않는다.
