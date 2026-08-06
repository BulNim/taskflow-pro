# 05-conventions.md

## 명명 규칙

- 백엔드: `snake_case`
- 프론트: `camelCase`
- 컴포넌트: `PascalCase`
- 식별자는 영어로 작성한다. 주석만 한국어로 작성한다.

## 금지 5개

| 금지 | 이유 | 대안 |
|---|---|---|
| print 디버깅 | 노이즈 | logging 모듈 |
| bare except | 예외 삼킴 | except SpecificError |
| 비밀번호 하드코딩 | 보안사고 | .env + os.getenv |
| any 타입 (TS) | 의미 상실 | 명시적 타입 |
| !important | 우선순위 꼬임 | 셀렉터 개선 |

## 구현 시 반드시 지킬 것

| # | 규칙 |
|---|---|
| 1 | SQLite id는 삭제해도 번호를 재사용하지 않는다 |
| 2 | 수정 모달은 단건 조회로 전 필드를 채운 뒤 전송한다 |
| 3 | 스펙에 없는 필드는 422로 거부한다 - Pydantic `model_config`에 `extra="forbid"`를 넣을 것. 조용히 무시 금지 |
| 4 | 다크모드 설정은 Tailwind CDN 로드 뒤에 둘 것 |

## 테스트

pytest를 사용하며, 정상 케이스와 404/400 케이스를 모두 작성한다.

## git 커밋 규칙

`타입: 한국어 요약` 형식을 사용한다.

타입: `feat` / `fix` / `docs` / `refactor` / `test` / `chore`
