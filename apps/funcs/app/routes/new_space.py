from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from app.admin_add_user_to_space import add_user_to_space


class Trigger(BaseModel):
    name: str


class Table(BaseModel):
    schema_name: str = Field(alias="schema")
    name: str


class SessionVars(BaseModel):
    x_hasura_role: str = Field(alias="x-hasura-role")
    x_hasura_user_id: Optional[UUID] = Field(alias="x-hasura-user-id")


class NewData(BaseModel):
    space_id: UUID


class Data(BaseModel):
    old: Optional[dict]
    new: NewData


class DeliveryInfo(BaseModel):
    max_retries: int
    current_retry: int


class TraceContext(BaseModel):
    trace_id: str
    span_id: str


class Event(BaseModel):
    session_variables: SessionVars
    op: str
    data: Data
    trace_context: TraceContext


class RequestArgs(BaseModel):
    event: Event
    created_at: datetime
    id: UUID
    delivery_info: DeliveryInfo
    trigger: Trigger
    table: Table


new_space = APIRouter()


@new_space.post("/", response_model=None)
async def handle(args: RequestArgs) -> None:
    assert args.table.schema_name == 'public', args.table.schema_name
    user_id = args.event.session_variables.x_hasura_user_id
    space_id = args.event.data.new.space_id
    await add_user_to_space(user_id, space_id)
    return None
