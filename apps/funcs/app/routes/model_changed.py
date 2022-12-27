import json
import requests
import os
from fastapi import APIRouter, Request
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, timezone
from app.backup import backup
from app.audit import log_audit_event
from app.file import get_file_text


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
    new: Optional[dict]


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


model_changed = APIRouter()


@model_changed.post("/", response_model=None)
async def handle(args: RequestArgs, request: Request) -> None:
    assert args.table.schema_name == 'public', args.table.schema_name

    # Get user_id of the person initiating the change.
    user_id = args.event.session_variables.x_hasura_user_id

    # Add the event to the audit table.
    table_name = args.table.name
    op = args.event.op
    body = await request.json()
    await log_audit_event(user_id, table_name, op, json.dumps(body))

    # NOTE: The remainder of this function is to complete a backup.

    # Backups cannot be done when model has already been deleted.
    if table_name == 'model' and op == 'DELETE':
        return None

    # Get the old or new data depending on op.
    if op == 'INSERT' or op == 'UPDATE':
        data = args.event.data.new
    else:
        assert op == 'DELETE'
        data = args.event.data.old

    # Expect data from this point on.
    assert data is not None

    model_id = None

    # The following tables changes provide the model_id. Other tables may not.
    if table_name == 'model' or table_name == 'context' or table_name == 'connection':
        model_id = data['model_id']
    elif table_name == 'group_term':
        context_id = await get_group_context_id(data['group_id'])
        if context_id is not None:
            model_id = await get_context_model_id(context_id)
    elif table_name == 'group' \
            or table_name == 'term' \
            or table_name == 'relation' \
            or table_name == 'demoted':
        model_id = await get_context_model_id(data['context_id'])

    # NOTE: model_id is None when model or context has been deleted already.
    if model_id is None:
        assert op == 'DELETE', f'{op}; {table_name}'
        return

    timestamp = datetime.now(timezone.utc)
    await update_model_timestamp(model_id, timestamp)
    await update_space_timestamp(model_id, timestamp)

    await backup(model_id, user_id)


async def get_context_model_id(context_id: UUID) -> Optional[UUID]:
    assert context_id is not None

    query = await get_file_text('./graphql/get_context_model_id.graphql')

    variables = {
        'context_id': str(context_id)
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

    if 'context_by_pk' not in data['data']:
        print(data)
        raise Exception('Missing key: context_by_pk')

    # NOTE: Handling an error observed in logs. Not sure about this one.
    if data['data']['context_by_pk'] is None:
        return None

    if 'model_id' not in data['data']['context_by_pk']:
        print(data)
        raise Exception('Missing key: model_id')

    return data['data']['context_by_pk']['model_id']


async def get_group_context_id(group_id: UUID) -> Optional[UUID]:
    assert group_id is not None

    query = await get_file_text('./graphql/get_group_context_id.graphql')

    variables = {
        'group_id': str(group_id)
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

    if 'group_by_pk' not in data['data']:
        print(data)
        raise Exception('Missing key: group_by_pk')

    # NOTE: Handling an error observed in logs. Not sure about this one.
    if data['data']['group_by_pk'] is None:
        return None

    if 'context_id' not in data['data']['group_by_pk']:
        print(data)
        raise Exception('Missing key: context_id')

    return data['data']['group_by_pk']['context_id']


async def get_model_space_id(model_id: UUID) -> Optional[UUID]:
    assert model_id is not None

    query = await get_file_text('./graphql/get_model_space_id.graphql')

    variables = {
        'model_id': str(model_id)
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

    if 'model_by_pk' not in data['data']:
        print(data)
        raise Exception('Missing key: model_by_pk')

    # NOTE: Handling an error observed in logs. Not sure about this one.
    if data['data']['model_by_pk'] is None:
        return None

    if 'space_id' not in data['data']['model_by_pk']:
        print(data)
        raise Exception('Missing key: space_id')

    return data['data']['model_by_pk']['space_id']


async def update_model_timestamp(model_id: UUID, timestamp: datetime) -> None:
    assert model_id is not None

    query = await get_file_text('./graphql/update_model_timestamp.graphql')

    variables = {
        'model_id': str(model_id),
        'updated_at': str(timestamp)
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


async def update_space_timestamp(model_id: UUID, timestamp: datetime) -> None:
    assert model_id is not None

    space_id = await get_model_space_id(model_id)

    query = await get_file_text('./graphql/update_space_timestamp.graphql')

    variables = {
        'space_id': str(space_id),
        'updated_at': str(timestamp)
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
