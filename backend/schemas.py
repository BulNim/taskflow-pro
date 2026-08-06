from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from models import TaskStatus


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    due_at: Optional[datetime] = None


class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: Optional[str] = None
    status: TaskStatus
    due_at: Optional[datetime] = None


class TaskListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: TaskStatus
    due_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TaskDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    due_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
