from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from app.file import get_file_text
from app.admin_add_user_to_space import add_user_to_space
import requests
import json
import os


class Trigger(BaseModel):
    name: str


class Table(BaseModel):
    schema_name: str = Field(alias="schema")
    name: str


class SessionVars(BaseModel):
    x_hasura_role: str = Field(alias="x-hasura-role")
    x_hasura_user_id: Optional[UUID] = Field(alias="x-hasura-user-id")


class NewData(BaseModel):
    user_id: UUID


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


new_user = APIRouter()


@new_user.post("/", response_model=None)
async def handle(args: RequestArgs) -> None:
    assert args.table.schema_name == 'public', args.table.schema_name
    user_id = args.event.data.new.user_id
    space_id = await create_personal_space()
    await add_user_to_space(user_id, space_id)
    await set_user_personal_space(user_id, space_id)
    return None


async def create_personal_space() -> Optional[UUID]:
    query = await get_file_text('./graphql/create_personal_space.graphql')

    variables = {
        'name': 'Personal'
    }

    request = {
        'query': query,
        'variables': variables
    }

    headers = {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': os.environ['HASURA_GRAPHQL_ADMIN_SECRET']
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'insert_space_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_space_one')

    if 'space_id' not in data['data']['insert_space_one']:
        print(data)
        raise Exception('Missing key: space_id')

    return data['data']['insert_space_one']['space_id']


async def set_user_personal_space(user_id: UUID, space_id: UUID) -> Optional[UUID]:
    query = await get_file_text('./graphql/set_user_personal_space.graphql')

    variables = {
        'user_id': str(user_id),
        'space_id': str(space_id)
    }

    request = {
        'query': query,
        'variables': variables
    }

    headers = {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': os.environ['HASURA_GRAPHQL_ADMIN_SECRET']
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'update_user_by_pk' not in data['data']:
        print(data)
        raise Exception('Missing key: update_user_by_pk')

    if 'personal_space_id' not in data['data']['update_user_by_pk']:
        print(data)
        raise Exception('Missing key: personal_space_id')

    return data['data']['update_user_by_pk']['personal_space_id']
