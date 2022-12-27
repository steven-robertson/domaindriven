import requests
import json
import os
from uuid import UUID
from typing import Optional
from app.file import get_file_text


async def backup(model_id: UUID, user_id: UUID) -> Optional[UUID]:

    # Get a snapshot of the complete model.
    query = await get_file_text('./graphql/export_model.graphql')

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

    model = data['data']['model_by_pk']

    if model is None:  # Model has been deleted?
        return None

    # Convert the exported model to JSON and save this to the db with additional info.
    model_json = json.dumps(model)
    model_name = model['name']
    space_name = model['space']['name']
    space_id = model['space']['space_id']
    backup_id = await save_backup(model_json, model_name, model_id, space_name, space_id, user_id)

    return backup_id


async def save_backup(model_json, model_name, model_id, space_name, space_id, user_id) -> Optional[UUID]:
    query = await get_file_text('./graphql/save_backup.graphql')

    variables = {
        'model_json': model_json,
        'model_name': model_name,
        'model_id': str(model_id) if model_id is not None else None,
        'space_name': space_name,
        'space_id': str(space_id) if space_id is not None else None,
        'user_id': str(user_id) if user_id is not None else None
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

    if 'insert_backup_one' not in data['data']:
        print(data)
        raise Exception('Missing key: insert_backup_one')

    if 'backup_id' not in data['data']['insert_backup_one']:
        print(data)
        raise Exception('Missing key: backup_id')

    return data['data']['insert_backup_one']['backup_id']
