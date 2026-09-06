"""05-conventions.md 테스트 매트릭스 10건 검증."""

import pytest


def make_task(client, **overrides):
    payload = {"title": "기준 작업"}
    payload.update(overrides)
    return client.post("/api/tasks", json=payload)


def test_01_정상_생성_201(client):
    """정상 생성 | POST title 만 | 201"""
    assert make_task(client).status_code == 201


def test_02_목록_200_description_없음(client):
    """목록 | GET /api/tasks | 200, description 없음"""
    make_task(client, description="설명")
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert all("description" not in item for item in response.json())


def test_03_단건_200_description_있음(client):
    """단건 | GET /api/tasks/{id} | 200, description 있음"""
    task_id = make_task(client, description="설명").json()["id"]
    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["description"] == "설명"


def test_04_수정_200(client):
    """수정 | PUT 전 필드 | 200"""
    task_id = make_task(client).json()["id"]
    response = client.put(
        f"/api/tasks/{task_id}",
        json={
            "title": "수정",
            "description": "설명",
            "status": "in_progress",
            "due_at": "2026-12-31T18:00:00Z",
        },
    )
    assert response.status_code == 200


def test_05_삭제_204(client):
    """삭제 | DELETE | 204"""
    task_id = make_task(client).json()["id"]
    assert client.delete(f"/api/tasks/{task_id}").status_code == 204


def test_06_title_누락_400(client):
    """title 누락 | POST {} | 400"""
    assert client.post("/api/tasks", json={}).status_code == 400


def test_07_status_오값_400(client):
    """status 오값 | 400"""
    assert make_task(client, status="hold").status_code == 400


def test_08_due_at_형식_오류_400(client):
    """due_at 형식 오류 | 400"""
    assert make_task(client, due_at="2026-13-45 어제").status_code == 400


def test_09_없는_id_404(client):
    """없는 id | 404"""
    assert client.get("/api/tasks/99999").status_code == 404


def test_10_스펙_외_필드_422(client):
    """스펙 외 필드 | 422"""
    assert make_task(client, priority="high").status_code == 422


@pytest.mark.parametrize("path", ["/api/tasks"])
def test_api_prefix(client, path):
    """모든 API 경로는 /api/ 접두사 (CLAUDE.md 기술 스택)."""
    assert client.get(path).status_code == 200
