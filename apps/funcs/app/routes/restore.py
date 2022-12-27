import requests
import json
import os
from fastapi import APIRouter, Header
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from app.file import get_file_text
from app.backup import backup
from app.copy_model import copy_model


class SessionVars(BaseModel):
    x_hasura_role: str = Field(alias="x-hasura-role")
    x_hasura_user_id: Optional[UUID] = Field(alias="x-hasura-user-id")


class Input(BaseModel):
    backup_id: UUID
    space_id: UUID
    name: str


class Action(BaseModel):
    name: str


class RequestArgs(BaseModel):
    session_variables: SessionVars
    input: Input
    action: Action


class Result(BaseModel):
    model_id: UUID


restore = APIRouter()


@restore.post("/", response_model=Result)
async def handle(args: RequestArgs, authorization: Optional[str] = Header(None)) -> Optional[Result]:

    # NOTE: JWT can be obtained from the http://localhost:5003/token endpoint.
    assert authorization is not None, 'Users own authorization must be used for actions'

    user_id = args.session_variables.x_hasura_user_id

    backup_id = args.input.backup_id
    space_id = args.input.space_id
    name = args.input.name

    # Get a snapshot of the complete model.
    query = await get_file_text('./graphql/get_backup.graphql')

    variables = {
        'backup_id': str(backup_id)
    }

    request = {
        'query': query,
        'variables': variables
    }

    headers = {
        'Content-Type': 'application/json',
        'Authorization': authorization  # NOTE: Users own authorization must be used for actions.
    }

    r = requests.post(os.environ['DD_GRAPHQLAPI_URL'], json=request, headers=headers)

    if r.status_code != 200:
        raise Exception(f'Request failed: {r.status_code}')

    data = json.loads(r.text)

    if 'data' not in data:
        print(data)
        raise Exception('Missing key: data')

    if 'backup_by_pk' not in data['data']:
        print(data)
        raise Exception('Missing key: backup_by_pk')

    if 'model_json' not in data['data']['backup_by_pk']:
        print(data)
        raise Exception('Missing key: model_json')

    model = json.loads(data['data']['backup_by_pk']['model_json'])
    assert model is not None

    model_id = await copy_model(model, space_id, name, headers)

    # Do an immediate backup of the restored model.
    await backup(model_id, user_id)

    return Result(model_id=model_id)
