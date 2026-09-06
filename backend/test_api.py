"""Phase 2 단계 9 - 정상 / 400 / 404 테스트."""


def test_create_task_201(client):
    response = client.post("/api/tasks", json={"title": "첫 작업"})
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "첫 작업"
    assert body["status"] == "todo"


def test_list_and_detail(client):
    client.post("/api/tasks", json={"title": "작업", "description": "설명"})
    list_response = client.get("/api/tasks")
    assert list_response.status_code == 200
    assert "description" not in list_response.json()[0]

    detail_response = client.get("/api/tasks/1")
    assert detail_response.status_code == 200
    assert detail_response.json()["description"] == "설명"


def test_update_and_delete(client):
    client.post("/api/tasks", json={"title": "작업"})
    put_response = client.put(
        "/api/tasks/1",
        json={
            "title": "수정된 작업",
            "description": "수정 설명",
            "status": "done",
            "due_at": "2026-12-31T18:00:00Z",
        },
    )
    assert put_response.status_code == 200
    assert put_response.json()["status"] == "done"

    delete_response = client.delete("/api/tasks/1")
    assert delete_response.status_code == 204


def test_missing_title_400(client):
    assert client.post("/api/tasks", json={}).status_code == 400


def test_invalid_status_400(client):
    response = client.post("/api/tasks", json={"title": "작업", "status": "waiting"})
    assert response.status_code == 400


def test_invalid_due_at_400(client):
    response = client.post("/api/tasks", json={"title": "작업", "due_at": "내일"})
    assert response.status_code == 400


def test_unknown_id_404(client):
    assert client.get("/api/tasks/99999").status_code == 404
    assert client.delete("/api/tasks/99999").status_code == 404
