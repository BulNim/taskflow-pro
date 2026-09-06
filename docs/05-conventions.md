# 05-conventions - 규칙

## 명명

- 백엔드: `snake_case`
- 프론트: `camelCase`
- 컴포넌트: `PascalCase`
- 식별자는 영어, 주석만 한국어

## 금지 5개

| 금지 | 이유 | 대안 |
|---|---|---|
| `print` 디버깅 | 노이즈 | `logging` 모듈 |
| bare `except` | 예외 삼킴 | `except SpecificError` |
| 비밀번호 하드코딩 | 보안사고 | `.env` + `os.getenv` |
| `any` 타입 (TS) | 의미 상실 | 명시적 타입 |
| `!important` | 우선순위 꼬임 | 셀렉터 개선 |

## .gitignore 에 넣을 것

```
__pycache__/
.venv/
*.db
*.log
```

## 구현 시 반드시 지킬 것 4가지

| # | 항목 | 내용 |
|---|---|---|
| 1 | SQLite id 재사용 금지 | 삭제해도 번호를 재사용하지 않는다 |
| 2 | 수정 모달 | 단건 조회로 전 필드를 채운 뒤 전송한다 |
| 3 | 스펙 외 필드 | 422 로 거부한다. Pydantic `model_config` 에 `extra="forbid"` 를 넣는다. 조용히 무시 금지 |
| 4 | 다크모드 설정 | Tailwind CDN 로드 뒤에 둔다 |

## 테스트 매트릭스

| 케이스 | 요청 | 기대 응답 |
|---|---|---|
| 정상 생성 | POST title 만 | 201 |
| 목록 | GET /api/tasks | 200, description 없음 |
| 단건 | GET /api/tasks/{id} | 200, description 있음 |
| 수정 | PUT 전 필드 | 200 |
| 삭제 | DELETE | 204 |
| title 누락 | POST {} | 400 |
| status 오값 | POST status 오값 | 400 |
| due_at 형식 오류 | POST due_at 형식 오류 | 400 |
| 없는 id | GET /api/tasks/99999 | 404 |
| 스펙 외 필드 | POST 스펙 외 필드 포함 | 422 |

## git 커밋 규칙

`feat` / `fix` / `docs` / `refactor` / `test` / `chore` + 한국어 요약

예) `feat: 작업 생성 API 추가`
