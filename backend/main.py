"""TaskFlow Pro 백엔드 - FastAPI 진입점."""

import logging
from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, HTTPException, Request, status as http_status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Task
from schemas import TaskCreate, TaskDetail, TaskListItem, TaskUpdate

logger = logging.getLogger(__name__)

app = FastAPI(title="TaskFlow Pro API", version="1.0.0")

# DB 초기화
Base.metadata.create_all(bind=engine)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """스펙 외 필드(extra_forbidden)는 422, 그 밖의 검증 실패는 400 으로 돌려준다."""
    errors = exc.errors()
    has_extra = any(error.get("type") == "extra_forbidden" for error in errors)
    code = (
        http_status.HTTP_422_UNPROCESSABLE_ENTITY
        if has_extra
        else http_status.HTTP_400_BAD_REQUEST
    )
    return JSONResponse(status_code=code, content={"detail": errors})


def get_task_or_404(task_id: int, db: Session) -> Task:
    """없는 id 는 404."""
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    return task


@app.post("/api/tasks", response_model=TaskDetail, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)) -> Task:
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/api/tasks", response_model=List[TaskListItem])
def list_tasks(db: Session = Depends(get_db)) -> List[Task]:
    return db.query(Task).order_by(Task.id).all()


@app.get("/api/tasks/{task_id}", response_model=TaskDetail)
def get_task(task_id: int, db: Session = Depends(get_db)) -> Task:
    return get_task_or_404(task_id, db)


@app.put("/api/tasks/{task_id}", response_model=TaskDetail)
def update_task(
    task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)
) -> Task:
    task = get_task_or_404(task_id, db)
    for field, value in payload.model_dump().items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)) -> None:
    task = get_task_or_404(task_id, db)
    db.delete(task)
    db.commit()


# 정적 파일 마운트는 라우터 정의 뒤 맨 마지막 (03-design 2번)
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
