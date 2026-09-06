"""Pydantic 스키마 - 스펙에 없는 필드는 422 로 거부한다 (extra=forbid)."""

from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

Status = Literal["todo", "in_progress", "done"]


def to_iso_utc(value: Optional[datetime]) -> Optional[str]:
    """02-specs 의 ISO 8601 UTC 로 통일해 내보낸다. 표준 라이브러리만 쓴다."""
    if value is None:
        return None
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    return value.replace(microsecond=0).isoformat() + "Z"


class UtcIsoMixin(BaseModel):
    """응답의 모든 시각 필드를 같은 형식으로 직렬화한다."""

    @field_serializer("due_at", "created_at", "updated_at", check_fields=False)
    def serialize_datetimes(self, value: Optional[datetime]) -> Optional[str]:
        return to_iso_utc(value)


def to_naive_utc(value: Optional[datetime]) -> Optional[datetime]:
    """타임존이 붙어 오면 UTC 로 바꾼 뒤 tzinfo 를 떼고 저장한다."""
    if value is None:
        return None
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


class TaskBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    status: Status = "todo"
    due_at: Optional[datetime] = None

    @field_validator("due_at")
    @classmethod
    def normalize_due_at(cls, value: Optional[datetime]) -> Optional[datetime]:
        return to_naive_utc(value)


class TaskCreate(TaskBase):
    """POST 본문. status 를 생략하면 todo 가 된다."""


class TaskUpdate(TaskBase):
    """PUT 본문. 수정 모달에서 전 필드를 전송한다."""


class TaskListItem(UtcIsoMixin):
    """목록 응답 - description 을 제외한다."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: Status
    due_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TaskDetail(UtcIsoMixin):
    """단건 응답 - description 을 포함한다. 필드 순서는 02-specs 와 같다."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    status: Status
    due_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
