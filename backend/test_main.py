import os

os.environ.setdefault("TESTING", "1")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import database
import main
from database import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test_taskflow.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db

client = TestClient(main.app)


def test_create_task_success():
    response = client.post("/api/tasks", json={"title": "write tests"})
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "write tests"
    assert body["status"] == "todo"


def test_create_task_with_status():
    response = client.post(
        "/api/tasks", json={"title": "in progress task", "status": "in_progress"}
    )
    assert response.status_code == 201
    assert response.json()["status"] == "in_progress"


def test_create_task_extra_field_rejected():
    response = client.post("/api/tasks", json={"title": "x", "unknown": "field"})
    assert response.status_code == 422


def test_create_task_bad_due_at_format():
    response = client.post(
        "/api/tasks", json={"title": "x", "due_at": "not-a-date"}
    )
    assert response.status_code == 400


def test_create_task_missing_title():
    response = client.post("/api/tasks", json={})
    assert response.status_code == 400


def test_list_tasks_excludes_description():
    client.post("/api/tasks", json={"title": "task with desc", "description": "hidden"})
    response = client.get("/api/tasks")
    assert response.status_code == 200
    for item in response.json():
        assert "description" not in item


def test_get_task_includes_description():
    created = client.post(
        "/api/tasks", json={"title": "task with desc", "description": "visible"}
    ).json()
    response = client.get(f"/api/tasks/{created['id']}")
    assert response.status_code == 200
    assert response.json()["description"] == "visible"


def test_get_task_not_found():
    response = client.get("/api/tasks/999999")
    assert response.status_code == 404


def test_update_task_success():
    created = client.post("/api/tasks", json={"title": "before"}).json()
    response = client.put(
        f"/api/tasks/{created['id']}",
        json={"title": "after", "description": "updated", "status": "done"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "after"
    assert body["status"] == "done"


def test_update_task_not_found():
    response = client.put(
        "/api/tasks/999999", json={"title": "x", "status": "todo"}
    )
    assert response.status_code == 404


def test_delete_task_success():
    created = client.post("/api/tasks", json={"title": "to delete"}).json()
    response = client.delete(f"/api/tasks/{created['id']}")
    assert response.status_code == 204


def test_delete_task_not_found():
    response = client.delete("/api/tasks/999999")
    assert response.status_code == 404
