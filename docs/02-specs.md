# 02-specs.md

## Task 모델

아래 7개 필드를 이 순서와 타입 그대로 사용한다.

| 순서 | 필드명 | 타입 | 제약 |
|---|---|---|---|
| 1 | id | INTEGER | PK, AUTOINCREMENT |
| 2 | title | VARCHAR(200) | 필수 |
| 3 | description | TEXT | 선택 |
| 4 | status | ENUM(todo/in_progress/done) | 기본값 todo |
| 5 | due_at | DATETIME (UTC) | 선택 |
| 6 | created_at | DATETIME | 서버 자동 생성 |
| 7 | updated_at | DATETIME | 서버 자동 갱신 |

## 검증 규칙

- `title` / `status` / `due_at` 형식을 위반하면 400을 반환한다.
- `due_at`은 ISO 8601 형식만 허용한다.
- 존재하지 않는 `id`를 조회/수정/삭제하면 404를 반환한다.
- `POST /api/tasks`에서도 `status`를 지정할 수 있다. 생략 시 기본값 `todo`가 적용된다.
- 스펙에 정의되지 않은 필드가 요청에 포함되면 422로 거부한다. 조용히 무시하지 않는다.

## REST API

모든 경로는 `/api/` 접두사를 필수로 붙인다.

| Method | Path | 응답 코드 | 설명 |
|---|---|---|---|
| POST | /api/tasks | 201 | 생성 |
| GET | /api/tasks | 200 | 목록 조회 |
| GET | /api/tasks/{id} | 200 | 단건 조회 |
| PUT | /api/tasks/{id} | 200 | 수정 (모달에서 전 필드 전송) |
| DELETE | /api/tasks/{id} | 204 | 삭제 |

- 목록 응답(`GET /api/tasks`)에는 `description`을 제외한다.
- 단건 응답(`GET /api/tasks/{id}`)에는 `description`을 포함한다.

## 화면 명세

| 화면 | 트리거/구성 | 동작 |
|---|---|---|
| 추가 | 폼 (title / due_at / status) | 입력 후 제출 시 `POST /api/tasks` 호출 |
| 목록 | 카드 (status 배지 + D-N HH:MM 표시) | `GET /api/tasks` 결과를 카드 목록으로 렌더링 |
| 수정 | 카드 클릭 → 모달 (전 필드 수정 가능) | 모달에서 전 필드 전송, `PUT /api/tasks/{id}` 호출 |
| 상태 변경 (인라인) | 카드 안 status 배지를 드롭다운으로 클릭 | 선택 즉시 `GET /api/tasks/{id}`로 현재 값 조회 후 status만 교체해 `PUT /api/tasks/{id}` 호출. 모달을 열지 않으며 클릭 이벤트가 카드(모달 오픈)로 전파되지 않아야 한다 |
| 삭제 | 휴지통 아이콘 → 확인 | 확인 후 `DELETE /api/tasks/{id}` 호출 |
