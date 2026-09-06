# 02-specs - WHAT

## Task 모델 필드 7개

| # | 필드 | 타입 | 비고 |
|---|---|---|---|
| 1 | `id` | INTEGER | PK, AUTOINCREMENT |
| 2 | `title` | VARCHAR(200) | 필수 |
| 3 | `description` | TEXT | 선택 |
| 4 | `status` | `todo` / `in_progress` / `done` | 기본값 `todo` |
| 5 | `due_at` | DATETIME (UTC) | 선택 |
| 6 | `created_at` | DATETIME | 서버 자동 |
| 7 | `updated_at` | DATETIME | 서버 자동 |

## 검증

- `title` / `status` / `due_at` 형식 위반 > **400**
- `due_at` - ISO 8601 형식
- 없는 `id` > **404**
- `due_at` 은 서버에 **UTC** 로 저장한다.
  프론트는 보낼 때 로컬에서 UTC 로, 보일 때 UTC 에서 로컬로 변환한다.
- `POST` 에서도 `status` 를 지정할 수 있다 (생략 시 `todo`).
- 스펙에 없는 필드가 오면 **422** 로 거부한다. 조용히 무시하지 않는다.
- `extra_forbidden` 은 **422**, 그 밖의 검증 실패는 **400** 으로 바꾸는 예외 핸들러를 둔다.

## REST API 5개 (경로는 `/api/` 접두사 필수)

| 메서드 | 경로 | 성공 코드 | 설명 |
|---|---|---|---|
| POST | `/api/tasks` | 201 | 생성 |
| GET | `/api/tasks` | 200 | 목록 |
| GET | `/api/tasks/{id}` | 200 | 단건 |
| PUT | `/api/tasks/{id}` | 200 | 수정 (모달에서 전 필드 전송) |
| DELETE | `/api/tasks/{id}` | 204 | 삭제 |

- **목록 응답에는 `description` 을 제외한다. 단건 응답에는 포함한다.**

## 화면 명세

### 추가 - 폼

| 항목 | 내용 |
|---|---|
| 입력 필드 | `title` / `due_at` / `status` |
| 필수 | `title` |
| 동작 | 제출 시 `POST /api/tasks` |
| 결과 | 201 이면 목록 갱신, 폼 초기화 |

### 목록 - 카드

| 항목 | 내용 |
|---|---|
| 표시 | `status` 배지 + `D-N HH:MM` |
| 마감 없음 | `due_at` 이 없으면 `마감 없음` |
| 오늘 마감 | `D-DAY` |
| 지난 마감 | `D+N` |
| 주의 | 휴지통 클릭이 카드 클릭(수정 모달)으로 번지지 않게 한다 |

### 수정 - 카드 클릭 > 모달

| 항목 | 내용 |
|---|---|
| 진입 | 카드 클릭 |
| 조회 | `GET /api/tasks/{id}` 로 전 필드를 채운다 |
| 수정 범위 | 전 필드 수정 가능 |
| 전송 | `PUT /api/tasks/{id}` 로 전 필드 전송 |

### 삭제 - 휴지통 > 확인 > DELETE

| 항목 | 내용 |
|---|---|
| 진입 | 카드의 휴지통 아이콘 |
| 확인 | 확인 대화상자 |
| 전송 | `DELETE /api/tasks/{id}` |
| 결과 | 204 이면 목록에서 제거 |
